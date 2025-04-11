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
    <nav className="bg-white shadow-md">
      <div className="container mx-auto max-w-screen-xl flex items-center justify-between py-2 px-4">
        {/* Logo */}
        <Link to="/">
          <img src={UXlogo} alt="logo" className="w-32" />
        </Link>

        {/* Search bar for larger screens */}
        <div className="hidden sm:flex flex-grow justify-center">
          <div className="relative flex items-center w-full max-w-md">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-1 pl-8"
            />
            <img
              src={microphoneIcon}
              className="w-4 cursor-pointer absolute left-2"
              alt="microphone"
              onClick={handleVoiceSearch}
            />
            <img
              src={searchIcon}
              className="w-4 cursor-pointer absolute right-2"
              alt="search"
              onClick={handleSearch}
            />
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <div className="group relative">
            <img
              onClick={() => (token ? null : navigate('/login'))}
              className="w-4 cursor-pointer"
              src={profileIcon}
              alt="user"
            />
            {/* Dropdown menu */}
            {token && (
              <div className="hidden group-hover:block absolute dropdown-menu right-0 pt-2">
                <div className="flex flex-col gap-1 w-28 py-2 px-3 bg-slate-100 text-gray-500 rounded-md">
                  <p className="cursor-pointer hover:text-black">My Profile</p>
                  <p
                    onClick={() => navigate('/orders')}
                    className="cursor-pointer hover:text-black"
                  >
                    Orders
                  </p>
                  <p onClick={logout} className="cursor-pointer hover:text-black">
                    Logout
                  </p>
                </div>
              </div>
            )}
          </div>
          <Link to="/cart" className="relative">
            <img src={cartIcon} className="w-4 cursor-pointer" alt="cart" />
            <p className="absolute right-[-4px] bottom-[-4px] w-3 text-center leading-3 bg-black text-white aspect-square rounded-full text-[6px]">
              {getCartCount()}
            </p>
          </Link>
          <img
            onClick={() => setShowSearchBar(!showSearchBar)} // Toggle search bar visibility
            src={searchIcon}
            className="w-4 cursor-pointer sm:hidden"
            alt="search"
          />
          <img
            onClick={() => setVisible(true)} // Show sidebar
            src={menuIcon}
            className="w-4 cursor-pointer sm:hidden"
            alt="menu"
          />
        </div>
      </div>

      {/* Search bar for small screens */}
      {showSearchBar && (
        <div className="sm:hidden px-4 py-2">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 pl-8"
            />
            <img
              src={microphoneIcon}
              className="w-4 cursor-pointer absolute left-2"
              alt="microphone"
              onClick={handleVoiceSearch}
            />
            <img
              src={searchIcon}
              className="w-4 cursor-pointer absolute right-2"
              alt="search"
              onClick={handleSearch}
            />
          </div>
        </div>
      )}

      {/* Navigation links for larger screens */}
      <div className="hidden sm:flex w-full justify-center mb-2">
        <ul className="flex gap-4 text-sm text-gray-700">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'active' : ''}`
            }
          >
            <p>HOME</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-green-700 hidden" />
          </NavLink>
          <NavLink
            to="/collection"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'active' : ''}`
            }
          >
            <p>COLLECTION</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-green-700 hidden" />
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'active' : ''}`
            }
          >
            <p>ABOUT</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-green-700 hidden" />
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'active' : ''}`
            }
          >
            <p>CONTACT</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-green-700 hidden" />
          </NavLink>
        </ul>
      </div>

      {/* Sidebar for small screens */}
      <div
        className={`fixed top-0 right-0 bottom-0 bg-white transition-all duration-300 ${
          visible ? 'w-3/4' : 'w-0'
        } overflow-hidden`}
        style={{ zIndex: 50 }}
      >
        <div className="flex flex-col text-gray-600 h-full">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-4 border-b cursor-pointer"
          >
            <img className="h-4 rotate-90" src={dropdownIcon} alt="close" />
            <p>Close</p>
          </div>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 px-4 border-b"
            to="/"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 px-4 border-b"
            to="/collection"
          >
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 px-4 border-b"
            to="/about"
          >
            ABOUT
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 px-4 border-b"
            to="/contact"
          >
            CONTACT
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;