import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen bg-gray-100 border-r-2 shadow-md">
      
      {/* Sidebar Navigation */}
      <div className="flex flex-col gap-4 pt-6 pl-[15%] text-[15px]">
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md ${
              isActive ? 'bg-blue-500 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-200'
            }`
          }
          to="/add"
        >
          <img className="w-5 h-5" src={assets.add_icon} alt="Add Items" />
          <p className="hidden md:block">Add Items</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md ${
              isActive ? 'bg-blue-500 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-200'
            }`
          }
          to="/list"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="List Items" />
          <p className="hidden md:block">List Items</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md ${
              isActive ? 'bg-blue-500 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-200'
            }`
          }
          to="/orders"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="Orders" />
          <p className="hidden md:block">Orders</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md ${
              isActive ? 'bg-blue-500 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-200'
            }`
          }
          to="/scanner"
        >
          <img className="w-5 h-5" src={assets.scanner} alt="Scanner" />
          <p className="hidden md:block">Scanner</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;