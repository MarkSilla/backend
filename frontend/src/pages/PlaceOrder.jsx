import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';

const PlaceOrder = () => {
  const [method, setMethod] = useState('on-site-payment');
  const {navigate} = useContext(ShopContext);

  return (
    <div className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* ================= Left side ================= */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className='flex gap-3'>
          <input
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type="text"
            placeholder='First Name'
          />
          <input
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type="text"
            placeholder='Last Name'
          />
        </div>
        <input
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          type="text"
          placeholder='Email'
        />
        <div className='flex gap-3'>
          <input
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type="text"
            placeholder='Department'
          />
          <input
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type="text"
            placeholder='Program'
          />
        </div>
        <input
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          type="number"
          placeholder='Phone Number'
        />
      </div>
      {/* ================= Right side ================= */}
      <div>
        <div className='mt-8'>
          <div className='mt-8 min-w-80'>
            <CartTotal />
          </div>
          <div className='mt-12'></div>
          <Title text1={'PAYMENT'} text2={'METHODS'} />
          {/* ==================== PAYMENT METHOD SELECTION ==================== */}
          <div className='flex gap-3 flex-col lg:flex-row'>
            <div
              onClick={() => setMethod('gcash')}
              className='flex items-center gap-3 border p-2 cursor-pointer'
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === 'gcash' ? 'bg-green-400' : ''
                }`}
              ></p>
              <img
                className='h-5 mx-4'
                src={assets.GCash_logo}
                alt="GCash logo"
              />
            </div>
            <div
              onClick={() => setMethod('on-site-payment')}
              className='flex items-center gap-3 border p-2 cursor-pointer'
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === 'on-site-payment' ? 'bg-green-400' : ''
                }`}
              ></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>
                On-Site Payment
              </p>
            </div>
          </div>
          <div className='w-full text-end mt-8'> {/* Corrected className */}
            <button onClick={()=>navigate('/orders')} className='bg-black text-white px-16 py-3 text-sm'>
              CONFIRM ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;