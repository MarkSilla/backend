import { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import CartTotal from '../components/CartTotal';
import { Trash2, Minus, Plus } from 'lucide-react';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [isEmptyCart, setIsEmptyCart] = useState(true);

  useEffect(() => {
    const tempData = [];
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          tempData.push({
            _id: itemId,
            size: size,
            quantity: cartItems[itemId][size],
          });
        }
      }
    }
    setCartData(tempData);
    setIsEmptyCart(tempData.length === 0);
  }, [cartItems, products]);

  const handleQuantityChange = (itemId, size, value) => {
    if (value === '' || value === '0') return;
    updateQuantity(itemId, size, Number(value));
  };

  const decrementQuantity = (itemId, size, currentQuantity) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, size, currentQuantity - 1);
    }
  };

  const incrementQuantity = (itemId, size, currentQuantity) => {
    updateQuantity(itemId, size, currentQuantity + 1);
  };

  const removeItem = (itemId, size) => {
    updateQuantity(itemId, size, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="border-b pb-4 mb-8">
        <h1 className="font-bold text-3xl">
          YOUR <span className="text-primary">CART</span>
        </h1>
      </div>

      {isEmptyCart ? (
        <div className="flex flex-col items-center justify-center py-16">
          <img 
            src={assets.bin_icon} 
            alt="Empty Cart" 
            className="w-16 h-16 opacity-30 mb-4" 
          />
          <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      ) : (
        <>
          <div className="hidden md:grid grid-cols-12 gap-4 text-gray-500 font-medium pb-2 border-b">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-1 text-right">Remove</div>
          </div>

          <div className="space-y-6 mt-4">
            {cartData.map((item, index) => {
              const productData = products.find((product) => product._id === item._id);

              if (!productData) {
                return (
                  <div key={index} className="py-4 bg-red-50 px-4 rounded text-red-700">
                    <p>Product not found for ID: {item._id}</p>
                  </div>
                );
              }

              return (
                <div key={index} className="border-b pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Product Image and Info */}
                    <div className="md:col-span-6 flex space-x-4">
                      <div className="w-24 h-24 bg-gray-50 flex items-center justify-center rounded overflow-hidden">
                        <img 
                          className="w-20 h-20 object-contain" 
                          src={productData.image[0]} 
                          alt={productData.name} 
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-medium text-base md:text-lg">{productData.name}</h3>
                        <div className="mt-1">
                          <span className="inline-block px-3 py-1 bg-gray-100 text-sm rounded-full">
                            Size: {item.size}
                          </span>
                        </div>
                        <p className="md:hidden mt-2 font-medium">{currency}{productData.price}</p>
                      </div>
                    </div>

                    {/* Price - Hidden on mobile */}
                    <div className="hidden md:block md:col-span-2 text-center font-medium">
                      {currency}{productData.price}
                    </div>

                    {/* Quantity Input */}
                    <div className="md:col-span-3">
                      <div className="flex items-center justify-center border rounded-md max-w-32 mx-auto">
                        <button 
                          onClick={() => decrementQuantity(item._id, item.size, item.quantity)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          onChange={(e) => handleQuantityChange(item._id, item.size, e.target.value)}
                          className="w-14 text-center border-x py-2 focus:outline-none"
                          type="number"
                          min={1}
                          value={item.quantity}
                        />
                        <button 
                          onClick={() => incrementQuantity(item._id, item.size, item.quantity)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        onClick={() => removeItem(item._id, item.size)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 md:mt-16 flex flex-col md:flex-row md:justify-between gap-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Continue Shopping
              </button>
            </div>

            <div className="w-full md:w-80 bg-gray-50 p-6 rounded">
              <CartTotal />
              <button
                onClick={() => navigate('/place-order')}
                className="w-full bg-blue-600 text-white font-medium py-3 mt-4 hover:bg-blue-800 transition-colors rounded"
              >
                CHECKOUT
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;