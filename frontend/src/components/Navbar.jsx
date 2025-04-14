import React, { useState, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import profileIcon from '../assets/profile_icon.png';
import cartIcon from '../assets/cart_icon.png';
import menuIcon from '../assets/menu_icon.png';
import dropdownIcon from '../assets/dropdown_icon.png';
import microphoneIcon from '../assets/microphone.png';
import searchIcon from '../assets/search_icon.png';
import UXlogo from '../assets/UXlogo.png';

const Navbar = () => {
  const { setSearch, getCartCount, navigate, token, setToken, setCartItems } = useContext(ShopContext);

  const logout = () => {
    navigate('/login');
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
  };

  const [visible, setVisible] = useState(false); // Sidebar visibility
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false); // Search bar visibility for small screens

  const handleSearch = () => {
    setSearch(searchQuery);
    setShowSearchBar(false); // Hide the search bar after searching
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support voice search. Please use a supported browser like Chrome.');
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

    recognition.start();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto max-w-screen-xl flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <Link to="/" className="transition-transform duration-200 hover:scale-105">
          <img src={UXlogo} alt="logo" className="w-32" />
        </Link>

        {/* Search bar for larger screens */}
        <div className="hidden sm:flex flex-grow justify-center mx-4">
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

        {/* Icons */}
        <div className="flex items-center gap-5">
          <div className="group relative">
            <button
              onClick={() => (token ? null : navigate('/login'))}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <img className="w-4" src={profileIcon} alt="user" />
            </button>
            {/* Dropdown menu */}
            {token && (
              <div className="hidden group-hover:block absolute dropdown-menu right-0 pt-2 z-10">
                <div className="flex flex-col gap-1 w-32 py-2 px-3 bg-white rounded-md shadow-lg border border-gray-100">
                  <p className="cursor-pointer py-1 px-2 hover:bg-gray-100 rounded transition-colors text-sm">My Profile</p>
                  <p
                    onClick={() => navigate('/orders')}
                    className="cursor-pointer py-1 px-2 hover:bg-gray-100 rounded transition-colors text-sm"
                  >
                    Orders
                  </p>
                  <p 
                    onClick={logout} 
                    className="cursor-pointer py-1 px-2 hover:bg-gray-100 rounded transition-colors text-sm text-red-600"
                  >
                    Logout
                  </p>
                </div>
              </div>
            )}
          </div>
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <img src={cartIcon} className="w-4" alt="cart" />
            {getCartCount() > 0 && (
              <span className="absolute right-0 top-0 w-4 h-4 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs">
                {getCartCount()}
              </span>
            )}
          </Link>
          <button
            onClick={() => setShowSearchBar(!showSearchBar)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors sm:hidden"
            aria-label="Toggle search"
          >
            <img src={searchIcon} className="w-4" alt="search" />
          </button>
          <button
            onClick={() => setVisible(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors sm:hidden"
            aria-label="Toggle menu"
          >
            <img src={menuIcon} className="w-4" alt="menu" />
          </button>
        </div>
      </div>

      {/* Search bar for small screens */}
      {showSearchBar && (
        <div className="sm:hidden px-4 py-2 border-t border-gray-100">
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
      <div className="hidden sm:flex w-full justify-center mb-2">
        <ul className="flex gap-6 text-sm text-gray-700">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 hover:text-blue-700 transition-colors ${
                isActive ? 'text-blue-700 font-medium' : ''
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
              `flex flex-col items-center gap-1 hover:text-blue-700 transition-colors ${
                isActive ? 'text-blue-700 font-medium' : ''
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
              `flex flex-col items-center gap-1 hover:text-blue-700 transition-colors ${
                isActive ? 'text-blue-700 font-medium' : ''
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
              `flex flex-col items-center gap-1 hover:text-blue-700 transition-colors ${
                isActive ? 'text-blue-700 font-medium' : ''
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

      {/* Sidebar for small screens */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300 z-50"
        style={{ 
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none'
        }}
        onClick={(e) => {
          // Close sidebar when clicking on the backdrop
          if (e.target === e.currentTarget) {
            setVisible(false);
          }
        }}
      >
        <div
          className={`fixed top-0 right-0 bottom-0 bg-white shadow-lg transition-all duration-300 ${
            visible ? 'w-3/4' : 'w-0'
          } overflow-hidden z-50`}
        >
          <div className="flex flex-col text-gray-600 h-full">
            <div
              onClick={() => setVisible(false)}
              className="flex items-center gap-4 p-4 border-b cursor-pointer hover:bg-gray-50"
            >
              <img className="h-4 rotate-90" src={dropdownIcon} alt="close" />
              <p>Close</p>
            </div>
            <NavLink
              onClick={() => setVisible(false)}
              className={({ isActive }) => 
                `py-3 px-4 border-b hover:bg-gray-50 transition-colors ${isActive ? 'text-green-700 font-medium' : ''}`
              }
              to="/"
            >
              HOME
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className={({ isActive }) => 
                `py-3 px-4 border-b hover:bg-gray-50 transition-colors ${isActive ? 'text-green-700 font-medium' : ''}`
              }
              to="/collection"
            >
              COLLECTION
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className={({ isActive }) => 
                `py-3 px-4 border-b hover:bg-gray-50 transition-colors ${isActive ? 'text-green-700 font-medium' : ''}`
              }
              to="/about"
            >
              ABOUT
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className={({ isActive }) => 
                `py-3 px-4 border-b hover:bg-gray-50 transition-colors ${isActive ? 'text-green-700 font-medium' : ''}`
              }
              to="/contact"
            >
              CONTACT
            </NavLink>
            
            {/* Additional account options in mobile menu */}
            {token ? (
              <div className="mt-4 border-t">
                <p className="px-4 py-2 text-xs font-medium text-gray-500">ACCOUNT</p>
                <div 
                  onClick={() => {
                    navigate('/profile');
                    setVisible(false);
                  }}
                  className="py-3 px-4 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  My Profile
                </div>
                <div 
                  onClick={() => {
                    navigate('/orders');
                    setVisible(false);
                  }}
                  className="py-3 px-4 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Orders
                </div>
                <div 
                  onClick={() => {
                    logout();
                    setVisible(false);
                  }}
                  className="py-3 px-4 text-red-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Logout
                </div>
              </div>
            ) : (
              <div 
                onClick={() => {
                  navigate('/login');
                  setVisible(false);
                }}
                className="py-3 px-4 border-b hover:bg-gray-50 transition-colors cursor-pointer mt-4"
              >
                Login / Register
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;