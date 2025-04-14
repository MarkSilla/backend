import React from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink from React Router
import { assets } from '../assets/assets'; // Ensure the correct path to your assets

const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row bg-gradient-to-br from-white to-gray-50 shadow-sm rounded-lg overflow-hidden'>
      {/* Hero Left Side */}
      <div className='w-full sm:w-1/2 flex items-center justify-center py-12 sm:py-16 lg:py-20'>
        <div className='w-full sm:w-4/5 text-[#414141] p-6 sm:pl-10 md:pl-16'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-8 md:w-12 h-[2px] bg-green-600'></div>
            <p className='font-medium text-sm md:text-base tracking-wider text-green-700'>AVAILABLE HERE!</p>
          </div>
          
          <h1 className='lato-bold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight mb-6 font-bold'>
            <span className='text-green-800'>GORDON COLLEGE</span>
            <br />
            <span className='text-[#414141]'>UNIFORMS</span>
          </h1>
          
          <NavLink 
            to="/collection" // Link to the collection page
            className="group inline-flex items-center gap-3 mt-2 cursor-pointer transition-all duration-300 hover:translate-x-2"
          >
            <p className='font-semibold text-sm md:text-base tracking-wider text-green-700 group-hover:text-green-800'>SHOP NOW</p>
            <div className='w-8 md:w-12 h-[2px] bg-green-600 group-hover:w-16 transition-all duration-300'></div>
            <svg 
              className='w-4 h-4 text-green-700 opacity-0 group-hover:opacity-100 -ml-2 transition-all duration-300' 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </NavLink>
        </div>
      </div>
      
      {/* Hero Right Side */}
      <div className='w-full sm:w-1/2 flex items-center justify-center py-8 sm:py-0 bg-gradient-to-br from-green-50 to-gray-50'>
        <div className='relative w-2/3 aspect-square flex items-center justify-center'>
          <div className='absolute inset-0 bg-green-500 opacity-5 rounded-full transform -rotate-6'></div>
          <div className='absolute inset-2 bg-green-500 opacity-5 rounded-full transform rotate-12'></div>
          <img 
            className='w-full h-auto relative z-10 transform transition-transform duration-700 hover:scale-105 drop-shadow-xl' 
            src={assets.GC_LOGO} 
            alt='Gordon College Logo' 
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;