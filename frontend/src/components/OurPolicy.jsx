import React from 'react'
import { assets } from '../assets/assets';

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
   <div>
      <img src={assets.exchange_icon} className='w-12 m-auto mb-5' alt='exchange' />
      <p className='font-semibold'>Easy Exchange Policy</p>
      <p className='text-gray-400'>We offer hassle-free exchanges within 7–14 days <br></br>for unused and unwashed items in their original packaging.</p>
   </div>
   <div>
      <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt='return' />
      <p className='font-semibold'>7 Days Return</p>
      <p className='text-gray-400'>Customers can return eligible items within 7 days<br></br> of purchase with proof of purchase.</p>
   </div>
   <div>
      <img src={assets.support_img} className='w-12 m-auto mb-5' alt='support' />
      <p className='font-semibold'>Customer Support</p>
      <p className='text-gray-400'>We provide 24/7 customer support to assist you <br></br>with any queries or concerns.</p>
   </div>
</div>

    
  )
}

export default OurPolicy
