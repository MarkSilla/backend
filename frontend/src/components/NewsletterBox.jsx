import React from 'react';

const NewsletterBox = () => {
    const onSubmitHandler = (event) => {
        event.preventDeafult();

    }
    
  return (
    <div className='text-center'>
      <p className='text-2xl font-semibold text-gray-800'>Subscribe to get 20% off!</p>
      <p className='text-gray-400 mt-3'>Stay updated with our latest offers and discounts.</p>
      <form className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
        <input
          type='email'
          placeholder='Enter your email address'
          className='w-full sm:flex-1 outline-none'
        />
        <button type='submit' className='bg-black text-white text-xs px-10 py-4'>
          Subscribe
        </button>
      </form>
    </div>
  );
};

export default NewsletterBox;