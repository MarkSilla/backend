import React from 'react';
import { assets } from '../assets/assets'; // Ensure the correct path to your assets

const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row border border-gray-400'>
      {/* Hero Left Side */}
      <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
        <div className='w-full sm:w-3/4 text-[#414141] p-4'>
          <div className='flex items-center gap-2'>
            <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
            <p className='font-medium text-sm md:text-base'>AVAILABLE HERE!</p>
          </div>
          <h1 className='lato-bold text-3xl sm:py-3 lg:text-5xl leading-tight'>GORDON COLLEGE UNIFORMS</h1>
          <div className='flex items-center gap-2'>
            <p className='font-semibold text-sm md:text-base'>SHOP NOW</p>
            <p className='w-8 md:w-11 h-[1px] bg-[#414141]'></p>
          </div>
        </div>
      </div>
      {/* Hero Right Side */}
      <div className='w-full sm:w-1/2'>
        <img className='w-full h-auto' src={assets.heroimg} alt='Gordon College Logo' />
      </div>
    </div>
  );
};

export default Hero;