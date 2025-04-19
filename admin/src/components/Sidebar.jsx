import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Sidebar = () => {
  // Navigation items for reusability
  const navItems = [
    { path: '/add', icon: assets.add_icon, label: 'Add Items' },
    { path: '/list', icon: assets.order_icon, label: 'List Items' },
    { path: '/orders', icon: assets.order_icon, label: 'Orders' },
    { path: '/scanner', icon: assets.scanner, label: 'Scanner' }
  ];

  return (
    <div className="w-16 md:w-[15%] lg:w-[18%] min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 border-r border-blue-200 shadow-lg flex flex-col">
      {/* Sidebar Navigation Links */}
      <div className="flex flex-1 flex-col gap-3 px-2 md:px-4 py-2 text-[15px]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 md:gap-3 px-2 md:px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-300'
                  : 'text-gray-700 hover:bg-blue-200/50 hover:text-blue-800'
              }`
            }
            to={item.path}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-md bg-opacity-90 ${
                    isActive ? 'bg-white/20' : 'bg-blue-100'
                  }`}
                >
                  <img className="w-5 h-5" src={item.icon} alt={item.label} />
                </div>
                <p className="font-medium hidden md:block">{item.label}</p>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;