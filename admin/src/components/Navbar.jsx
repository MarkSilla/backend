import React from 'react';
import { assets } from '../assets/assets';
import { LogOut } from 'lucide-react';

const Navbar = ({ setToken }) => {
  return (
    <div className="flex items-center py-3 px-4 sm:px-8 justify-between bg-white shadow-md">
      {/* Logo - Increased size */}
      <div className="flex items-center">
        <img
          className="h-20 sm:h-24 md:h-28 w-auto"
          src={assets.UXlogo}
          alt="UX Logo"
        />
      </div>

      {/* Logout Button - Responsive for all screen sizes */}
      <button
        onClick={() => setToken('')}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm transition duration-300"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
};

export default Navbar;