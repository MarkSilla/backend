import React, { useEffect, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  useEffect(() => {
    const selectedProduct = products.find((item) => item._id === productId);
    if (selectedProduct) {
      setProductData(selectedProduct);
      setImage(selectedProduct.image[0]);
    }
  }, [productId, products]);

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100 max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-10">
        <div className="flex md:w-1/2 gap-5">
          <div className="flex flex-col space-y-3 overflow-y-auto h-[350px]">
            {productData.image?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-20 h-20 border rounded-lg cursor-pointer hover:opacity-75 transition"
                onClick={() => setImage(img)}
              />
            ))}
          </div>
          <div className="w-full flex justify-center">
            <img className="max-w-full h-auto rounded-lg shadow-md" src={image} alt="Selected Product" />
          </div>
        </div>

        <div className="md:w-1/2">
          <h1 className="font-semibold text-3xl">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(4)].map((_, index) => (
              <img key={index} src={assets.star_icon} alt="star" className="w-4" />
            ))}
            <img src={assets.star_dull_icon} alt="star" className="w-4" />
            <p className="text-gray-600 pl-2">(122 Reviews)</p>
          </div>
          <p className="mt-4 text-3xl font-bold">{currency} {productData.price}</p>
          <p className="mt-2 text-gray-600">Stock: <span className={`font-bold ${productData.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{productData.stock > 0 ? `${productData.stock} available` : 'Out of Stock'}</span></p>
          <p className="mt-4 text-gray-600 leading-relaxed">{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-green-500' : ''}`}
                  key={index}>{item}</button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => addToCart(productData._id, size)} 
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'
            disabled={productData.stock === 0}
          >
            {productData.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
          </button>
          <hr className='mt-8 sm:w-4/5'></hr>
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product</p>
            <p>Easy return and exchange policy within 7 days</p>
          </div>
        </div>
      </div>
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div>
          <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
            <p>Uniform Xpress is Gordon College's exclusive online store for official uniforms, offering a seamless shopping experience with easy ordering, secure payments, and real-time tracking.</p>
          </div>
        </div>
        <RelatedProducts category={productData.category} subCategory={productData.subCategory} department={productData.department}/>
      </div>
    </div>
  ) : (
    <div className="text-center py-10 text-gray-500">Loading product details...</div>
  );
};

export default Product;
