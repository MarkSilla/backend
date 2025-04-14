import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 border-r border-blue-200 shadow-lg flex flex-col">
      {/* Sidebar Navigation Links */}
      <div className="flex flex-1 flex-col gap-3 px-4 py-2 text-[15px]">
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-blue-500 text-white shadow-md shadow-blue-300'
                : 'text-gray-700 hover:bg-blue-200/50 hover:text-blue-800'
            }`
          }
          to="/add"
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-md bg-opacity-90 ${
                  isActive ? 'bg-white/20' : 'bg-blue-100'
                }`}
              >
                <img className="w-5 h-5" src={assets.add_icon} alt="Add Items" />
              </div>
              <p className="font-medium hidden lg:block">Add Items</p>
            </>
          )}
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-blue-500 text-white shadow-md shadow-blue-300'
                : 'text-gray-700 hover:bg-blue-200/50 hover:text-blue-800'
            }`
          }
          to="/list"
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-md bg-opacity-90 ${
                  isActive ? 'bg-white/20' : 'bg-blue-100'
                }`}
              >
                <img className="w-5 h-5" src={assets.order_icon} alt="List Items" />
              </div>
              <p className="font-medium hidden lg:block">List Items</p>
            </>
          )}
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-blue-500 text-white shadow-md shadow-blue-300'
                : 'text-gray-700 hover:bg-blue-200/50 hover:text-blue-800'
            }`
          }
          to="/orders"
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-md bg-opacity-90 ${
                  isActive ? 'bg-white/20' : 'bg-blue-100'
                }`}
              >
                <img className="w-5 h-5" src={assets.order_icon} alt="Orders" />
              </div>
              <p className="font-medium hidden lg:block">Orders</p>
            </>
          )}
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-blue-500 text-white shadow-md shadow-blue-300'
                : 'text-gray-700 hover:bg-blue-200/50 hover:text-blue-800'
            }`
          }
          to="/scanner"
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-md bg-opacity-90 ${
                  isActive ? 'bg-white/20' : 'bg-blue-100'
                }`}
              >
                <img className="w-5 h-5" src={assets.scanner} alt="Scanner" />
              </div>
              <p className="font-medium hidden lg:block">Scanner</p>
            </>
          )}
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;