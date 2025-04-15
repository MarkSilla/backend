import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Phone, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const PlaceOrder = () => {
  const [method, setMethod] = useState('on-site-payment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { navigate, backendUrl, token, cartItems, setCartItems, delivery_fee, getCartAmount, products } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    program: '',
    phone: '',
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate cart is not empty
      if (!cartItems || Object.keys(cartItems).length === 0) {
        toast.error("Your cart is empty");
        navigate('/cart');
        return;
      }

      // Validate products exist
      if (!products || products.length === 0) {
        toast.error("Unable to process order. Please try again later.");
        return;
      }

      let orderItems = [];

      // Process cart items
      for (const itemId in cartItems) {
        for (const size in cartItems[itemId]) {
          if (cartItems[itemId][size] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === itemId));
            if (itemInfo) {
              itemInfo.size = size;
              itemInfo.quantity = cartItems[itemId][size];
              orderItems.push(itemInfo);
            } else {
              console.error(`Product with ID ${itemId} not found`);
            }
          }
        }
      }

      let orderData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        program: formData.program,
        phone: formData.phone,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        paymentMethod: method,
      };

      switch (method) {
        case 'gcash':
          toast.info("GCash payment processing will be available soon");
          // GCash payment logic would go here
          break;

        case 'on-site-payment':
          const response = await axios.post(
            `${backendUrl}/api/orders/place`,
            orderData,
            { headers: { token } }
          );
          
          if (response.data.success) {
            setCartItems({});
            toast.success("Order placed successfully!");
            navigate('/orders');
          } else {
            toast.error(response.data.message || "Failed to place order");
          }
          break;

        default:
          toast.error("Invalid payment method");
          orderData.paymentMethod = 'on-site-payment';
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error(error.response?.data?.message || "An error occurred while placing your order");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/getuser`, {
          headers: { token },
        });
        
        if (response.data.success) {
          setFormData((prev) => ({
            ...prev,
            firstName: response.data.user.firstName || '',
            lastName: response.data.user.lastName || '',
            email: response.data.user.email || '',
            department: response.data.user.department || '',
            program: response.data.user.program || '',
          }));
        } else {
          toast.error("Failed to fetch your information");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Unable to load your information. Please try again.");
      }
    };

    fetchUserData();
  }, [backendUrl, token]);

  // Check if cart is empty
  useEffect(() => {
    const isEmpty = !cartItems || Object.keys(cartItems).length === 0;
    const hasItems = Object.values(cartItems || {}).some(sizes => 
      Object.values(sizes).some(quantity => quantity > 0)
    );
    
    if (isEmpty || !hasItems) {
      toast.info("Your cart is empty. Please add items before checkout.");
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const SectionTitle = ({ children }) => (
    <h2 className="font-bold text-lg md:text-xl mb-4 flex items-center">
      {children}
    </h2>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-bold text-2xl md:text-3xl">Checkout</h1>
        <p className="text-gray-600 mt-1">Please review your information and payment method</p>
      </div>
      
      <form onSubmit={onSubmitHandler} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Customer Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <SectionTitle>Customer Information</SectionTitle>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input id="firstName" name="firstName"
                  value={formData.firstName}
                  className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
                  type="text"
                  readOnly
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
                  type="text"
                  readOnly
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                value={formData.email}
                className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
                type="text"
                readOnly
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  value={formData.department}
                  className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
                  type="text"
                  readOnly
                />
              </div>
              
              <div>
                <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
                  Program
                </label>
                <input
                  id="program"
                  name="program"
                  value={formData.program}
                  className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
                  type="text"
                  readOnly
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone size={16} className="text-gray-500" />
                </div>
                <input
                  required
                  onChange={onChangeHandler}
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  type="tel"
                  placeholder="Enter your phone number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We'll contact you on this number for delivery coordination
              </p>
            </div>
          </div>
          
          {/* Payment Methods Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <SectionTitle>
              <CreditCard className="mr-2" size={20} />
              Payment Method
            </SectionTitle>
            
            <div className="space-y-3">
              <label className={`block border rounded-lg p-4 cursor-pointer transition-all ${method === 'on-site-payment' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="on-site-payment"
                    checked={method === 'on-site-payment'}
                    onChange={() => setMethod('on-site-payment')}
                    className="mr-3 h-4 w-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium">On-Site Payment</p>
                    <p className="text-sm text-gray-500">Pay when you pick up your items</p>
                  </div>
                  {method === 'on-site-payment' && (
                    <CheckCircle className="ml-auto text-blue-500" size={20} />
                  )}
                </div>
              </label>
              
              <label className={`block border rounded-lg p-4 cursor-pointer transition-all ${method === 'gcash' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="gcash"
                    checked={method === 'gcash'}
                    onChange={() => setMethod('gcash')}
                    className="mr-3 h-4 w-4 text-blue-600"
                  />
                  <div className="flex items-center">
                    <img className="h-6 mr-2" src={assets.GCash_logo} alt="GCash logo" />
                    <p className="font-medium">GCash</p>
                  </div>
                  {method === 'gcash' && (
                    <CheckCircle className="ml-auto text-blue-500" size={20} />
                  )}
                </div>
              </label>
              
              {method === 'gcash' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start">
                  <AlertCircle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-sm text-yellow-700">
                    GCash payment is coming soon. Please use On-Site Payment for now.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right side - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
            <h2 className="font-bold text-lg md:text-xl mb-4">Order Summary</h2>
            
            <CartTotal />
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded bg-blue-600 text-white font-medium 
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-800'} 
                  transition-colors flex items-center justify-center`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'PLACE ORDER'
                )}
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                By placing your order, you agree to our {''} 
                <Link to= "/terms" className="text-blue-600 hover:underline" >Terms of Service.</Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;