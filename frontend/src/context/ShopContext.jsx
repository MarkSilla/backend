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
        return prev;
      }
      
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
      socketInstance.emit("userOnline", { userId });
    });

    // New unified handler for all order updates with improved duplicate detection
    const handleOrderUpdate = (data) => {
      const { orderId, status, appointmentDate, appointmentTime, message, userId } = data || {};
      const displayOrderId = orderId?.toString().slice(-5) || "unknown";
    
      // Check if the notification is for the current user
      const currentUserId = currentUserIdRef.current;
      
      if (userId !== currentUserId) {
        return;
      }
      
      // Handle status updates
      let notificationMessage = message || "";
      if (!notificationMessage) {
        if (status === "Ready for Pick Up") {
          notificationMessage = `Order #${displayOrderId} is ready for pickup${appointmentDate ? ` on ${appointmentDate} at ${appointmentTime}` : ''}.`;
        } else if (status === "Received") {
          notificationMessage = `Order #${displayOrderId} has been received and is being processed.`;
        } else {
          notificationMessage = `Order #${displayOrderId} status updated to ${status}`;
        }
      }
      
      // Create a deterministic ID based on orderId and status
      const notificationId = `${orderId}-${status}`;
      
      // Check if we already have this exact notification to prevent duplicates
      const existingNotification = notificationsRef.current.find(
        n => n.fullOrderId === orderId && n.status === status && n.message === notificationMessage
      );
      
      if (existingNotification) {
        return; // Don't even show toast for duplicate notifications
      }
      
      toast.info(notificationMessage);
      
      // Create notification object with deterministic ID
      const newNotification = {
        id: notificationId,
        token,
        userId,
        type: appointmentDate ? "appointment" : "status",
        orderId: displayOrderId,
        fullOrderId: orderId,
        message: notificationMessage,
        status,
        time: new Date().toLocaleTimeString(),
        read: false,
      };
      
      // Add appointment details if available
      if (appointmentDate) {
        newNotification.appointmentDate = appointmentDate;
        newNotification.appointmentTime = appointmentTime;
      }
      
      addNotification(newNotification);
    };
    
    // Listen for the new unified event
    socketInstance.on("orderUpdated", (data) => {
      handleOrderUpdate(data);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    return () => {
      console.log("Cleaning up socket connection");
      socketInstance.off("orderUpdated");
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

  const checkStockAvailability = (productId, size) => {

    const product = products.find(p => p._id === productId);
    
    if (!product) {
        console.log(`Product not found for ID: ${productId}`);
        return false;
    }
    console.log("Product data:", product);

    // Check if inventory exists and has the right format
    if (!product.inventory) {
        console.log(`No inventory data for product: ${product.name || productId}`);
        return false;
    }

    // Check if the specific size exists in inventory
    const sizeStock = parseInt(product.inventory[size] || 0, 10);
    const currentCartQty = cartItems[productId]?.[size] || 0;

    console.log("Stock check details:", { 
        productId, 
        size, 
        availableStock: sizeStock, 
        currentCartQty,
        productName: product.name
    });

    // Return true if we have more stock than what's in cart
    return sizeStock > currentCartQty;
};

  // Reduce stock in the backend when an item is ordered
  const reduceStock = async (productId, size, quantity) => {
    console.log("Calling reduceStock for:", { productId, size, quantity });
    if (!token || !backendUrl) {
      toast.error("Authentication required");
      return { success: false, message: "Authentication required" };
    }
  
    try {
      const res = await axios.post(
        `${backendUrl}/api/product/update-stock`,
        { productId, size, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("API Response for reduceStock:", res.data);
  
      if (res.data.success) {
        // Fetch updated products after reducing stock
        await getProductsData(); // Refresh product data here
        return { success: true };
      } else {
        toast.error(res.data.message || "Failed to update stock");
        return { success: false, message: res.data.message };
      }
    } catch (error) {
      console.error("Error in reduceStock:", error.message);
      return { success: false, message: error.message };
    }
  };

  // Cart handlers
  const addToCart = async (itemId, size) => {
  if (!size) return toast.error("Please select a size");

  // Check if we have enough stock before adding to cart
  if (!checkStockAvailability(itemId, size)) {
    return toast.error("Not enough stock available for this size");
  }

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

      // Fetch updated product data after adding to cart
      await getProductsData(); // Refresh product data here
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      toast.error(msg);
    }
  }
};

  const updateQuantity = async (itemId, size, quantity) => {
    const product = products.find(p => p._id === itemId);
    if (!product) return toast.error("Product not found");
    
    // Check if we have enough stock for the new quantity
    const inventory = product.inventory || {};
    const sizeStock = parseInt(inventory[size] || 0, 10);
    
    if (quantity > sizeStock) {
      return toast.error(`Only ${sizeStock} items available for size ${size}`);
    }
    
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
const processOrder = async (orderItems) => {
    console.log("processOrder called with:", orderItems);
    if (!token || !backendUrl) {
        toast.error("Authentication required");
        return { success: false, message: "Authentication required" };
    }

    let stockUpdateSuccess = true;
    let errorMessage = "";

    for (const item of orderItems) {
        const { productId, size, quantity } = item;

        // Skip if any required field is missing
        if (!productId || !size || !quantity) {
            toast.error("Invalid order item data");
            stockUpdateSuccess = false;
            errorMessage = "Invalid order item data";
            break;
        }

        const result = await reduceStock(productId, size, quantity);
        if (!result.success) {
            stockUpdateSuccess = false;
            errorMessage = result.message;
            break;
        }
    }

    if (!stockUpdateSuccess) {
        toast.error(errorMessage || "Failed to update stock");
        return { success: false, message: errorMessage || "Failed to update stock" };
    }

    // Fetch updated product data after stock reduction
    await getProductsData();

    toast.success("Order processed successfully!");
    return { success: true };
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
    processOrder,
    markNotificationAsRead,
    clearNotifications,
    reduceStock,
    checkStockAvailability
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;