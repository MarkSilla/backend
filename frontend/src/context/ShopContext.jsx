import React, { createContext, useEffect, useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { io } from "socket.io-client";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₱";
  const delivery_fee = 0;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const currentUserIdRef = useRef(localStorage.getItem("userId"));

  const loadNotificationsFromStorage = () => {
    try {
      const stored = localStorage.getItem("notifications");
      const parsedNotifications = stored ? JSON.parse(stored) : [];
      console.log("Loaded notifications from storage:", parsedNotifications);
      return parsedNotifications;
    } catch (err) {
      console.error("Error loading notifications:", err);
      return [];
    }
  };

  const [notifications, setNotifications] = useState(loadNotificationsFromStorage());
  const notificationsRef = useRef(notifications);

  // Keep the ref updated with the latest notifications
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const navigate = useNavigate();

  // Save notifications on change
  useEffect(() => {
    try {
      localStorage.setItem("notifications", JSON.stringify(notifications));
      console.log("Saved notifications to storage:", notifications);
    } catch (err) {
      console.error("Error saving notifications:", err);
    }
  }, [notifications]);

  // Safe notification addition that avoids duplicate IDs
  const addNotification = useCallback((newNotification) => {
    setNotifications((prev) => {
      // Check if notification with this ID already exists
      const exists = prev.some(n => n.id === newNotification.id);
      if (exists) {
        console.log("Notification already exists, not adding duplicate:", newNotification);
        return prev;
      }
      
      console.log("Adding new notification:", newNotification);
      return [...prev, newNotification];
    });
  }, []);

  // Initialize socket
  useEffect(() => {
    if (!token || !backendUrl) {
      console.log("Not connecting socket - missing token or backendUrl");
      return;
    }

    const userId = localStorage.getItem("userId");
    currentUserIdRef.current = userId;
    console.log("Initializing socket connection with userId:", userId);

    const socketInstance = io(backendUrl, {
      auth: { token, userId },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket connected with ID:", socketInstance.id);
      socketInstance.emit("userOnline", { userId });
    });

    const handleOrderStatusUpdate = (data) => {
      console.log("Received orderStatusUpdate event:", data);
      const { orderId, status, userId } = data || {};
      const displayOrderId = orderId?.toString().slice(-5) || "unknown";
    
      // Check if the notification is for the current user
      const currentUserId = currentUserIdRef.current;
      console.log("Comparing received userId:", userId, "with current userId:", currentUserId);
      
      if (userId !== currentUserId) {
        console.log("Ignoring notification for different user");
        return;
      }
    
      let message = "";
      if (status === "Ready for Pick Up") {
      
      } else if (status === "Received") {
        message = `Order #${displayOrderId} has been received and is being processed.`;
        toast.info(message);
      } else {
        message = `Order #${displayOrderId} status updated to ${status}`;
        toast.info(message);
      }
    
      if (message) {
        const newNotification = {
          id: uuidv4(),
          token,
          userId,
          type: "status",
          orderId: displayOrderId,
          message,
          time: new Date().toLocaleTimeString(),
          read: false,
        };
        
        addNotification(newNotification);
      }
    };
    
    const handleAppointmentUpdate = (details) => {
      console.log("Received appointmentUpdate event:", details);
      const { orderId, appointmentDate, appointmentTime, status, message, userId } = details || {};
      const displayOrderId = orderId?.toString().slice(-5) || "unknown";
    
      // Check if the notification is for the current user
      const currentUserId = currentUserIdRef.current;
      console.log("Comparing received userId:", userId, "with current userId:", currentUserId);
      
      if (userId !== currentUserId) {
        console.log("Ignoring appointment notification for different user");
        return;
      }
    
      if (status && !appointmentDate && !appointmentTime) {
        handleOrderStatusUpdate({ orderId, status, userId });
        return;
      }
    
      const customMessage =
        message ||
        `Your order #${displayOrderId} has been scheduled for pickup on ${appointmentDate} at ${appointmentTime}`;
    
      toast.info(customMessage);
    
      const newNotification = {
        id: uuidv4(),
        type: "appointment",
        token,
        userId,
        orderId: displayOrderId,
        fullOrderId: orderId,
        message: customMessage,
        appointmentDate,
        appointmentTime,
        time: new Date().toLocaleTimeString(),
        read: false,
      };
      
      addNotification(newNotification);
    };
    
    // Add event listeners with proper logging
    socketInstance.on("orderStatusUpdated", (data) => {
      console.log("Received orderStatusUpdated event:", data);
      handleOrderStatusUpdate(data);
    });
    
    socketInstance.on("appointmentUpdated", (data) => {
      console.log("Received appointmentUpdated event:", data);
      handleAppointmentUpdate(data);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    return () => {
      console.log("Cleaning up socket connection");
      socketInstance.off("orderStatusUpdated");
      socketInstance.off("appointmentUpdated");
      socketInstance.off("connect_error");
      socketInstance.off("disconnect");
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [token, backendUrl, addNotification]);

  // Filter notifications for current user
  const userNotifications = notifications.filter(notification => {
    const currentUserId = currentUserIdRef.current;
    const isForCurrentUser = notification.userId === currentUserId;
    return isForCurrentUser;
  });
  
  // Log the filtered notifications whenever they change
  useEffect(() => {
    console.log("All notifications:", notifications);
    console.log("Filtered notifications for current user:", userNotifications);
  }, [notifications, userNotifications]);
  
  // Notification handlers
  const markNotificationAsRead = (id) => {
    console.log("Marking notification as read:", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    const userId = currentUserIdRef.current;
    console.log("Clearing all notifications for user:", userId);
    setNotifications((prev) => prev.filter((n) => n.userId !== userId));
  };

  // Cart handlers
  const addToCart = async (itemId, size) => {
    if (!size) return toast.error("Please select a size");

    const cartCopy = structuredClone(cartItems);
    cartCopy[itemId] = cartCopy[itemId] || {};
    cartCopy[itemId][size] = (cartCopy[itemId][size] || 0) + 1;

    setCartItems(cartCopy);

    if (token && backendUrl) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId, size },
          { headers: { token } }
        );
        toast.success("Product added to cart");
      } catch (error) {
        const msg = error.response?.data?.message || error.message;
        toast.error(msg);
      }
    }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    const cartCopy = structuredClone(cartItems);
    if (cartCopy[itemId]) {
      cartCopy[itemId][size] = quantity;
      setCartItems(cartCopy);
    }

    if (token && backendUrl) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/update`,
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const product = products.find((p) => p._id === itemId);
      if (!product) continue;

      for (const size in cartItems[itemId]) {
        total += product.price * cartItems[itemId][size];
      }
    }
    return total;
  };

  const getCartCount = () => {
    let count = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        count += cartItems[itemId][size];
      }
    }
    return count;
  };

  // Product & Cart fetching
  const getProductsData = async () => {
    if (!backendUrl) return;
    
    try {
      const res = await axios.get(`${backendUrl}/api/product/list`);
      if (res.data.success) setProducts(res.data.products);
      else toast.error(res.data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getUserCart = async () => {
    if (!token || !backendUrl) return;
    
    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        { headers: { token } }
      );
      if (res.data.success) setCartItems(res.data.cartData);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (backendUrl) {
      getProductsData();
    }
  }, [backendUrl]);

  useEffect(() => {
    if (token && backendUrl) {
      getUserCart();
    }
  }, [token, backendUrl]);

  const value = {
    products,
    currency,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    delivery_fee,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    setToken,
    token,
    backendUrl,
    socket,
    notifications: userNotifications,
    markNotificationAsRead,
    clearNotifications,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;