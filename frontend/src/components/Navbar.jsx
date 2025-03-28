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
  const { setSearch, getCartCount } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    setSearch(searchQuery);
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

    recognition.onstart = () => {
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice search result:', transcript);
      setSearchQuery(transcript);
      setSearch(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      alert('An error occurred during voice recognition. Please try again.');
    };

    recognition.onend = () => {
      console.log('Voice recognition ended.');
    };

    recognition.start();
  };

  return (
    <nav className='bg-white shadow-md'>
      <div className='container mx-auto max-w-screen-xl flex items-center justify-between py-2 px-4'>
        {/* Logo */}
        <Link to='/'><img src={UXlogo} alt='logo' className='w-32' /></Link>

        {/* Search bar and search icon */}
        <div className='flex-grow flex justify-center'>
          <div className='relative flex items-center w-full max-w-md'>
            <input
              type='text'
              placeholder='Search'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full border border-gray-300 rounded-md p-1 pl-8'
            />
            <img
              src={microphoneIcon}
              className='w-4 cursor-pointer absolute left-2'
              alt='microphone'
              onClick={handleVoiceSearch}
            />
            <img
              src={searchIcon}
              className='w-4 cursor-pointer absolute right-2'
              alt='search'
              onClick={handleSearch}
            />
          </div>
        </div>

        {/* Icons */}
        <div className='flex items-center gap-4'>
          <div className='group relative'>
            <Link to ="/login"><img className='w-4 cursor-pointer' src={profileIcon} alt="user" /></Link>
            <div className='hidden group-hover:block absolute dropdown-menu right-0 pt-2'>
              <div className='flex flex-col gap-1 w-28 py-2 px-3 bg-slate-100 text-gray-500 rounded-md'>
                <p className='cursor-pointer hover:text-black'>My Profile</p>
                <p className='cursor-pointer hover:text-black'>Orders</p>
                <p className='cursor-pointer hover:text-black'>Logout</p>
              </div>
            </div>
          </div>
          <Link to='/cart' className='relative'>
            <img src={cartIcon} className='w-4 cursor-pointer' alt='cart' />
            <p className='absolute right-[-4px] bottom-[-4px] w-3 text-center leading-3 bg-black text-white aspect-square rounded-full text-[6px]'>{getCartCount()}</p>
          </Link>
          <img onClick={() => setVisible(true)} src={menuIcon} className='w-4 cursor-pointer sm:hidden' alt='menu' />
        </div>
      </div>

      {/* Navigation links */}
      <div className='w-full flex justify-center mb-2'>
        <ul className='flex gap-4 text-sm text-gray-700'>
          <NavLink
            to='/'
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'active' : ''}`
            }
          >
            <p>HOME</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-green-700 hidden' />
          </NavLink>
          <NavLink
            to='/collection'
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'active' : ''}`
            }
          >
            <p>COLLECTION</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-green-700 hidden' />
          </NavLink>
          <NavLink
            to='/about'
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'active' : ''}`
            }
          >
            <p>ABOUT</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-green-700 hidden' />
          </NavLink>
          <NavLink
            to='/contact'
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'active' : ''}`
            }
          >
            <p>CONTACT</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-green-700 hidden' />
          </NavLink>
        </ul>
      </div>

      {/* for smaller screen sidebar */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
        <div className='flex flex-col text-gray-600'>
          <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-2'>
            <img className='h-4 rotate-90' src={dropdownIcon} alt='down' />
            <p>Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className='py-1 pl-4 border' to="/">HOME</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-1 pl-4 border' to="/collection">COLLECTION</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-1 pl-4 border' to="/about">ABOUT</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-1 pl-4 border' to="/contact">CONTACT</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;