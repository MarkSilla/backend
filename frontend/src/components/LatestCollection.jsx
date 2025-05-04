import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import Productitem from './Productitem';

const LatestCollection = () => {
  const { products } = useContext(ShopContext);

  // Filter directly
  const filteredProducts = products?.filter(
    (item) => item.category !== 'Accessory' && item.subCategory !== 'Accessory'
  ) || [];

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'LATEST'} text2={'UNIFORMS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Don't miss out on these must-have uniforms!
        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {filteredProducts.map((item, index) => (
          <Productitem
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
