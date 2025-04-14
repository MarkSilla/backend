import React, { useState } from 'react';
import { assets } from '../assets/assets';

const Navbar = ({ setToken }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex items-center py-2 px-4 sm:px-8 justify-between bg-white shadow-md">
      {/* Logo */}
      <img
        className="w-[max(10%,80px)] h-auto"
        src={assets.UXlogo}
        alt="UX Logo"
      />

      {/* Hamburger Menu for Small Screens */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Logout Button for Larger Screens */}
      <div className="hidden md:block">
        <button
          onClick={() => setToken('')}
          className="bg-blue-500 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-blue-600 transition duration-300"
        >
          Logout
        </button>
      </div>

      {/* Dropdown Menu for Small Screens */}
      {isMenuOpen && (
        <div className="absolute top-14 right-4 bg-white shadow-lg rounded-lg py-2 w-40 z-50">
          <button
            onClick={() => setToken('')}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-500 hover:text-white transition duration-300"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;