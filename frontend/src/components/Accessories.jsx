import React, { useEffect, useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import Productitem from './Productitem';

const Accessories = () => {
  const { products } = useContext(ShopContext);
  const [accessories, setAccessories] = useState([]);

  useEffect(() => {
    if (products && products.length > 0) {
      // Filter products to only include accessories
      const filteredAccessories = products.filter((item) => item.category === 'Accessory' || item.subCategory === 'Accessory');
      setAccessories(filteredAccessories.slice(0, 5)); 
    }
  }, [products]);

  return (
    <div>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'ACCESSORIES'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Discover our top-selling products!
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {accessories.map((item, index) => (
          <Productitem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
        ))}
      </div>
    </div>
  );
};

export default Accessories;