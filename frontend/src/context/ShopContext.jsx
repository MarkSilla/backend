import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

  const loadNotificationsFromStorage = () => {
    try {
      const stored = localStorage.getItem("notifications");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Error loading notifications:", err);
      return [];
    }
  };

  const [notifications, setNotifications] = useState(loadNotificationsFromStorage());

  const navigate = useNavigate();

  // Save notifications on change
  useEffect(() => {
    try {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    } catch (err) {
      console.error("Error saving notifications:", err);
    }
  }, [notifications]);

  // Initialize socket
  useEffect(() => {
    if (!token) return;

    const userId = localStorage.getItem("userId");
    const socketInstance = io(backendUrl, {
      auth: { token, userId },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      socketInstance.emit("userOnline", { userId });
    });

    const handleOrderStatusUpdate = ({ orderId, status }) => {
      const displayOrderId = orderId?.toString().slice(-5) || "unknown";

      let message = "";
      if (status === "Ready for Pick Up") {
        message = `Order #${displayOrderId} is now Ready for Pickup!`;
      } else if (status === "Received") {
        message = `Order #${displayOrderId} has been received and is being processed.`;
        toast.info(message);
      }

      if (message) {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "status",
            orderId: displayOrderId,
            message,
            time: new Date().toLocaleTimeString(),
            read: false,
          },
        ]);
      }
    };

    const handleAppointmentUpdate = (details) => {
      const { orderId, appointmentDate, appointmentTime, status, message } = details || {};
      const displayOrderId = orderId?.toString().slice(-5) || "unknown";

      if (status && !appointmentDate && !appointmentTime) {
        handleOrderStatusUpdate({ orderId, status });
        return;
      }

      const customMessage =
        message ||
        `Your order #${displayOrderId} has been scheduled for pickup on ${appointmentDate} at ${appointmentTime}`;

      toast.info(customMessage);

      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "appointment",
          userId,
          orderId: displayOrderId,
          fullOrderId: orderId,
          message: customMessage,
          appointmentDate,
          appointmentTime,
          time: new Date().toLocaleTimeString(),
          read: false,
        },
      ]);
    };

    socketInstance.on("orderStatusUpdated", handleOrderStatusUpdate);
    socketInstance.on("appointmentUpdated", handleAppointmentUpdate);

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    return () => {
      socketInstance.off("orderStatusUpdated", handleOrderStatusUpdate);
      socketInstance.off("appointmentUpdated", handleAppointmentUpdate);
      socketInstance.disconnect();
    };
  }, [token, backendUrl]);

  // Notification handlers
  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    const userId = localStorage.getItem("userId");
    setNotifications((prev) => prev.filter((n) => n.userId !== userId));
  };

  // Cart handlers
  const addToCart = async (itemId, size) => {
    if (!size) return toast.error("Please select a size");

    const cartCopy = structuredClone(cartItems);
    cartCopy[itemId] = cartCopy[itemId] || {};
    cartCopy[itemId][size] = (cartCopy[itemId][size] || 0) + 1;

    setCartItems(cartCopy);

    if (token) {
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

    if (token) {
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
    try {
      const res = await axios.get(`${backendUrl}/api/product/list`);
      if (res.data.success) setProducts(res.data.products);
      else toast.error(res.data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getUserCart = async () => {
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
    getProductsData();
  }, []);

  useEffect(() => {
    if (token) getUserCart();
  }, [token]);

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
    notifications,
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
