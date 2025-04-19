import React, { useState, useContext, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import profileIcon from '../assets/profile_icon.png';
import cartIcon from '../assets/cart_icon.png';
import menuIcon from '../assets/menu_icon.png';
import dropdownIcon from '../assets/dropdown_icon.png';
import microphoneIcon from '../assets/microphone.png';
import searchIcon from '../assets/search_icon.png';
import UXlogo from '../assets/UXlogo.png';
import notification_icon from '../assets/notification-icon.png';
import { toast } from 'react-toastify';

const Navbar = () => {
  const {
    setSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    notifications,
    markNotificationAsRead,
    clearNotifications
  } = useContext(ShopContext);

  const logout = () => {
    // Show a toast notification
    toast.info('You have been logged out.');

    // Perform logout actions
    navigate('/login');
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
  };

  const [visible, setVisible] = useState(false); // Sidebar visibility
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false); // Search bar visibility for small screens
  const [showNotifications, setShowNotifications] = useState(false); // Notifications dropdown visibility
  const [showNotificationsModal, setShowNotificationsModal] = useState(false); // Notifications modal for small screens
  const notificationRef = useRef(null);
  const notificationModalRef = useRef(null);
  const sidebarRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationModalRef.current && !notificationModalRef.current.contains(event.target)) {
        setShowNotificationsModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle body scroll when sidebar or modal is open
  useEffect(() => {
    if (visible || showNotificationsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [visible, showNotificationsModal]);

  const handleSearch = () => {
    navigate(`/collection?query=${encodeURIComponent(searchQuery)}`);
    setShowSearchBar(false); // optional
  };
  

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Your browser does not support voice search. Please use Chrome.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setSearch(transcript);
    };

    toast.info('Listening... Please speak now.');
    recognition.start();
  };

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);

    // Navigate to the appropriate page based on notification type
    if (notification.type === 'order' || notification.type === 'status' || notification.type === 'appointment') {
      navigate(`/orders`);
    }

    setShowNotifications(false);
    setShowNotificationsModal(false);
  };

  const toggleNotifications = () => {
    // For mobile screens, show the modal
    if (window.innerWidth < 768) {
      setShowNotificationsModal(!showNotificationsModal);
    } else {
      // For larger screens, show the dropdown
      setShowNotifications(!showNotifications);
    }
  };

  // Get unread notifications count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto max-w-screen-xl flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <Link to="/" className="transition-transform duration-200 hover:scale-105">
          <img src={UXlogo} alt="logo" className="w-32" />
        </Link>

        {/* Search bar for larger screens */}
        <div className="hidden md:flex flex-grow justify-center mx-4">
          <div className="relative flex items-center w-full max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full border border-gray-300 rounded-lg p-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              onClick={() => {
                handleVoiceSearch();
                navigate('/collection');
              }}
              className="absolute left-2 p-1 text-gray-500 hover:text-green-600 transition-colors"
              aria-label="Voice search"
            >
              <img src={microphoneIcon} className="w-4" alt="microphone" />
            </button>

            <button
              onClick={() => {handleSearch();}}
              className="absolute right-2 p-1 text-gray-500 hover:text-green-600 transition-colors"
              aria-label="Search"
            >
              <img src={searchIcon} className="w-4" alt="search" />
            </button>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2 sm:gap-5">
          {/* Notification Bell */}
          {token && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotifications}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                aria-label="Notifications"
              >
                <img src={notification_icon} className="w-4" alt="notifications" />

                {/* Notification Indicator */}
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 w-4 h-4 flex items-center justify-center bg-red-600 text-white rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown (for larger screens) */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium text-gray-700">Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotifications();
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-gray-200">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Icon */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => token ? setShowProfileDropdown(!showProfileDropdown) : navigate('/login')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Profile"
            >
              <img className="w-4" src={profileIcon} alt="user" />
            </button>

            {/* Dropdown menu */}
            {token && showProfileDropdown && (
              <div className="absolute dropdown-menu right-0 pt-2 z-10">
                <div className="flex flex-col gap-1 w-32 py-2 px-3 bg-white rounded-md shadow-lg border border-gray-100">
                  <p
                    onClick={() => {
                      navigate('/profile');
                      setShowProfileDropdown(false);
                    }}
                    className="cursor-pointer py-1 px-2 hover:bg-gray-100 rounded transition-colors text-sm"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => {
                      navigate('/orders');
                      setShowProfileDropdown(false);
                    }}
                    className="cursor-pointer py-1 px-2 hover:bg-gray-100 rounded transition-colors text-sm"
                  >
                    Orders
                  </p>
                  <p
                    onClick={() => {
                      logout();
                      setShowProfileDropdown(false);
                    }}
                    className="cursor-pointer py-1 px-2 hover:bg-gray-100 rounded transition-colors text-sm text-red-600"
                  >
                    Logout
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <img src={cartIcon} className="w-4" alt="cart" />
            {getCartCount() > 0 && (
              <span className="absolute -right-1 -top-1 w-4 h-4 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs">
                {getCartCount()}
              </span>
            )}
          </Link>

          {/* Search Icon (Mobile) */}
          <button
            onClick={() => setShowSearchBar(!showSearchBar)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors md:hidden"
            aria-label="Toggle search"
          >
            <img src={searchIcon} className="w-4" alt="search" />
          </button>

          {/* Menu Icon (Mobile) */}
          <button
            onClick={() => setVisible(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <img src={menuIcon} className="w-4" alt="menu" />
          </button>
        </div>
      </div>

      {/* Search bar for small screens */}
      {showSearchBar && (
        <div className="md:hidden px-4 py-2 border-t border-gray-100">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full border border-gray-300 rounded-lg p-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={handleVoiceSearch}
              className="absolute left-2 p-1 text-gray-500 hover:text-green-600 transition-colors"
              aria-label="Voice search"
            >
              <img src={microphoneIcon} className="w-4" alt="microphone" />
            </button>
            <button
              onClick={handleSearch}
              className="absolute right-2 p-1 text-gray-500 hover:text-green-600 transition-colors"
              aria-label="Search"
            >
              <img src={searchIcon} className="w-4" alt="search" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation links for larger screens */}
      <div className="hidden md:flex w-full justify-center mb-2">
        <ul className="flex gap-6 text-sm text-gray-700">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 hover:text-blue-700 transition-colors ${isActive ? 'text-blue-700 font-medium' : ''
              }`
            }
          >
            {({ isActive }) => (
              <>
                <p>HOME</p>
                <hr className={`w-2/4 border-none h-[2px] bg-blue-700 ${isActive ? 'block' : 'hidden'}`} />
              </>
            )}
          </NavLink>
          <NavLink
            to="/collection"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 hover:text-blue-700 transition-colors ${isActive ? 'text-blue-700 font-medium' : ''
              }`
            }
          >
            {({ isActive }) => (
              <>
                <p>COLLECTION</p>
                <hr className={`w-2/4 border-none h-[2px] bg-blue-700 ${isActive ? 'block' : 'hidden'}`} />
              </>
            )}
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 hover:text-blue-700 transition-colors ${isActive ? 'text-blue-700 font-medium' : ''
              }`
            }
          >
            {({ isActive }) => (
              <>
                <p>ABOUT</p>
                <hr className={`w-2/4 border-none h-[2px] bg-blue-700 ${isActive ? 'block' : 'hidden'}`} />
              </>
            )}
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 hover:text-blue-700 transition-colors ${isActive ? 'text-blue-700 font-medium' : ''
              }`
            }
          >
            {({ isActive }) => (
              <>
                <p>CONTACT</p>
                <hr className={`w-2/4 border-none h-[2px] bg-blue-700 ${isActive ? 'block' : 'hidden'}`} />
              </>
            )}
          </NavLink>
        </ul>
      </div>

      {/* Notifications Modal for small screens */}
      {showNotificationsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowNotificationsModal(false)}
        >
          <div
            ref={notificationModalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium text-lg">Notifications</h3>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotifications();
                    }}
                    className="text-sm text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => {
                  navigate('/orders');
                  setShowNotificationsModal(false);
                }}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View All Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for small screens */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-50 ${visible ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
          }`}
        onClick={() => setVisible(false)}
      >
        <div
          ref={sidebarRef}
          className={`fixed top-0 right-0 bottom-0 bg-white shadow-xl transition-all duration-300 ease-in-out transform ${visible ? 'translate-x-0' : 'translate-x-full'
            } w-4/5 max-w-xs h-full overflow-hidden flex flex-col z-50`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
            <div className="flex items-center gap-2">
              <img className="h-6" src={UXlogo} alt="logo" />
              {token && <span className="text-sm font-medium text-blue-600">My Account</span>}
            </div>
            <button
              onClick={() => setVisible(false)}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>


          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            {/* Main navigation group */}
            <div className="py-2">
              <div className="px-4 pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Main Menu
              </div>
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${isActive ? 'text-blue-700 border-l-4 border-blue-700 bg-blue-50 font-medium' : 'border-l-4 border-transparent'}`
                }
                to="/"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                HOME
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${isActive ? 'text-blue-700 border-l-4 border-blue-700 bg-blue-50 font-medium' : 'border-l-4 border-transparent'}`
                }
                to="/collection"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                COLLECTION
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${isActive ? 'text-blue-700 border-l-4 border-blue-700 bg-blue-50 font-medium' : 'border-l-4 border-transparent'}`
                }
                to="/about"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ABOUT
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${isActive ? 'text-blue-700 border-l-4 border-blue-700 bg-blue-50 font-medium' : 'border-l-4 border-transparent'}`
                }
                to="/contact"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                CONTACT
              </NavLink>
            </div>

            {/* Quick actions group */}
            <div className="py-2 mt-2 border-t border-gray-200">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quick Actions
              </div>

              {/* Notifications */}
              {token && (
                <div
                  onClick={() => {
                    setVisible(false);
                    setShowNotificationsModal(true);
                  }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              )}

              {/* Cart */}
              <div
                onClick={() => {
                  navigate('/cart');
                  setVisible(false);
                }}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Cart</span>
                </div>
                {getCartCount() > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {getCartCount()}
                  </span>
                )}
              </div>

              {/* Search */}
              <div
                onClick={() => {
                  setVisible(false);
                  setShowSearchBar(true);
                  navigate('/collection');
                }}
                className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search Products</span>
              </div>
            </div>

            {/* Account section */}
            {token ? (
              <div className="py-2 mt-2 border-t border-gray-200">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  My Account
                </div>
                <div
                  onClick={() => {
                    navigate('/orders');
                    setVisible(false);
                  }}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Orders</span>
                </div>
              </div>
            ) : (
              <div className="py-2 mt-2 border-t border-gray-200">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </div>
                <div
                  onClick={() => {
                    navigate('/login');
                    setVisible(false);
                  }}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Login / Register</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer with logout button (if logged in) */}
          {token && (
            <div className="mt-auto border-t border-gray-200 p-4">
              <button
                onClick={() => {
                  logout();
                  setVisible(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;