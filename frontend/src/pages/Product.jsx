import React, { useEffect, useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { toast } from 'react-toastify';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const navigate = useNavigate();

  useEffect(() => {
    const selectedProduct = products.find((item) => item._id === productId);
    if (selectedProduct) {
      setProductData(selectedProduct);
      setImage(selectedProduct.image[0]);
    }
  }, [productId, products]);

  const handleAddToCart = () => {
    const isLoggedIn = !!localStorage.getItem('token');

    if (!isLoggedIn) {
      toast.error("You need to log in to add items to the cart.");
      navigate('/login');
      return;
    }
    if (productData.stock === 0) {
      toast.error("This product is out of stock.");
      return;
    }
    if (!size) {
      toast.error("Please select a size before adding to cart.");
      return;
    }
    addToCart(productData._id, size);
  };

  if (!productData) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100 max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Image section - keeping original dimensions */}
        <div className="flex md:w-1/2 gap-5">
          <div className="flex flex-col space-y-3 overflow-y-auto h-[350px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
            {productData.image?.map((img, index) => (
              <div
                key={index}
                className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${image === img ? 'ring-2 ring-blue-500' : 'hover:border-gray-400'
                  }`}
                onClick={() => setImage(img)}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-20 h-20 object-cover"
                />
              </div>
            ))}
          </div>
          <div className="w-full flex justify-center">
            <div className="relative rounded-lg overflow-hidden bg-gray-50">
              <img
                className="max-w-full h-auto rounded-lg shadow-md"
                src={image}
                alt="Selected Product"
              />
              {productData.isNew && (
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  NEW
                </div>
              )}
              {productData.discount > 0 && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {productData.discount}% OFF
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product info section */}
        <div className="md:w-1/2">
          <div>
            <h1 className="font-semibold text-3xl text-gray-900">{productData.name}</h1>

            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, index) => (
                <img
                  key={index}
                  src={index < 4 ? assets.star_icon : assets.star_dull_icon}
                  alt="star"
                  className="w-4"
                />
              ))}
              <p className="text-gray-600 pl-2 text-sm hover:underline cursor-pointer">(122 Reviews)</p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-900">{currency} {productData.price}</p>
              {productData.oldPrice && (
                <p className="text-gray-500 line-through text-lg">{currency} {productData.oldPrice}</p>
              )}
            </div>

            <div className="mt-3 flex items-center">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${productData.stock > 10 ? 'bg-green-100 text-green-800' :
                  productData.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                {productData.stock > 10 ? 'In Stock' :
                  productData.stock > 0 ? 'Low Stock' :
                    'Out of Stock'}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                {productData.stock > 0 && `${productData.stock} available`}
              </span>
            </div>

            <p className="mt-4 text-gray-600 leading-relaxed">{productData.description}</p>

            {/* Size selection */}
            <div className="flex flex-col gap-4 my-8">
              <div className="flex justify-between items-center">
                <p className="font-medium text-gray-800">Select Size</p>
                {productData.stock === 0 && (
                  <p className="text-red-600 text-sm font-medium">Out of Stock</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {productData.sizes.map((item, index) => (
                  <button
                    onClick={() => setSize(item)}
                    disabled={productData.stock === 0}
                    className={`border py-2 px-4 transition ${productData.stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                        item === size ? 'bg-blue-600 text-white border-blue-600' :
                          'bg-gray-100 hover:bg-gray-200 transition-colors'
                      }`}
                    key={index}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to cart button - made longer */}
            <button
              onClick={handleAddToCart}
              disabled={productData.stock === 0}
              className={`bg-blue-600 text-white px-12 py-2 text-sm font-medium transition-all w-3/4 rounded-lg ${productData.stock > 0 ? 'hover:bg-blue-700 active:bg-blue-800' :
                  'opacity-60 cursor-not-allowed'
                }`}
            >
              {productData.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
            </button>

            {/* Shipping & Guarantees */}
            <hr className="mt-8 sm:w-4/5" />

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p>100% Original product</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p>Easy return and exchange policy within 7 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-20">
        <div className="flex">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-5 py-3 text-sm border-t border-l border-r transition-colors ${activeTab === 'description' ?
                'bg-white text-blue-600 font-semibold border-b-white' :
                'bg-gray-50 text-gray-600 border-b hover:bg-gray-100'
              }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-3 text-sm border-t border-r transition-colors ${activeTab === 'reviews' ?
                'bg-white text-blue-600 font-semibold border-b-white' :
                'bg-gray-50 text-gray-600 border-b hover:bg-gray-100'
              }`}
          >
            Reviews (122)
          </button>
          <div className="flex-grow border-b"></div>
        </div>

        <div className="border-l border-r border-b p-6">
          {activeTab === 'description' && (
            <div className="space-y-4 text-gray-600">
              <p>Uniform Xpress is Gordon College's exclusive online store for official uniforms, offering a seamless shopping experience with easy ordering, secure payments, and real-time tracking.</p>
              <p>This {productData.name} is part of our {productData.category} collection designed specifically for the {productData.department} department.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg">Customer Reviews</h3>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(4)].map((_, index) => (
                        <svg key={index} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                      <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </div>
                    <p className="ml-2 text-sm text-gray-600">4.0 out of 5</p>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded transition-colors">
                  Write a Review
                </button>
              </div>

              <div className="border-t pt-6 mt-2">
                <p className="text-gray-600 italic">Review functionality coming soon!</p>
              </div>
            </div>
          )}
        </div>

        {/* Related Products - without the heading */}
        <div className="mt-16">
          <RelatedProducts
            category={productData.category}
            subCategory={productData.subCategory}
            department={productData.department}
          />
        </div>
      </div>
    </div>
  );
};

export default Product;