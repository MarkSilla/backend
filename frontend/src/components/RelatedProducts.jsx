import React, { useEffect, useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './Productitem';

const RelatedProducts = ({ category, subCategory, department }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      let productsCopy = products.slice();
    {/* need to fix */}
      productsCopy = productsCopy.filter(
        (item) =>
          category === item.category &&
          subCategory === item.subCategory &&
          department === item.department
      );

      setRelated(productsCopy.slice(0, 5));
    }
  }, [products, category, subCategory, department]);

  const Title = ({ text1, text2 }) => (
    <h2 className="font-bold text-3xl">
      {text1} <span className="text-primary">{text2}</span>
    </h2>
  );

  return (
    <div className="my-24">
      <div className="text-center text-3xl py-2">
        <Title text1={'RELATED'} text2={'PRODUCTS'} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {related.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;