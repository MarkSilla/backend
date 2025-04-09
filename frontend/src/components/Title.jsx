import React from 'react';

const Title = ({ text1, text2 }) => {
  return (
    <div className='inline-flex gap-2 items-center mb-3'>
      <p className='text-blue-400'>{text1}</p>
      <span className='text-red-500 font-medium'>{text2}</span>
      <p className='w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gray-700'></p>
    </div>
  );
};

export default Title;
