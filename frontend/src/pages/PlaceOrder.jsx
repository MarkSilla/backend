import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const [method, setMethod] = useState('on-site-payment');
  const { navigate, backendUrl, token, cartItems, setCartItems, delivery_fee, getCartAmount, products } = useContext(ShopContext);

  const [formData, setFromData] = useState({
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

    setFromData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      // Validate cartItems and products
      if (!cartItems || Object.keys(cartItems).length === 0) {
        toast.error("Cart items are empty");
        return;
      }

      if (!products || products.length === 0) {
        toast.error("Products are empty");
        return;
      }

      let orderItems = [];

      // Process cart items
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            } else {
              console.error(`Product with ID ${items} not found`);
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
          // Handle GCASH payment logic here
          break;

        case 'on-site-payment':
          const response = await axios.post(
            `${backendUrl}/api/orders/place`,
            orderData,
            { headers: { token } }
          );
          if (response.data.success) {
            setCartItems({});
            navigate('/orders');
          } else {
            toast.error(response.data.message);
          }
          break;

        default:
          toast.error("Invalid payment method");
          orderData.paymentMethod = 'on-site-payment';
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/getuser`, {
          headers: { token },
        });
        if (response.data.success) {
          setFromData((prev) => ({
            ...prev,
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            email: response.data.user.email,
            department: response.data.user.department,
            program: response.data.user.program,
          }));
        } else {
          toast.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("An error occurred while fetching user data");
      }
    };

    fetchUserData();
  }, [backendUrl, token]);

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* ================= Left side ================= */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col w-full">
            <label htmlFor="firstName" className="text-sm font-medium text-black-700 font-semibold">
              First Name
            </label>
            <input
              required
              id="firstName"
              name="firstName"
              value={formData.firstName}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full bg-gray-100 cursor-not-allowed"
              type="text"
              readOnly
            />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="lastName" className="text-sm font-medium text-black-700 font-semibold">
              Last Name
            </label>
            <input
              required
              id="lastName"
              name="lastName"
              value={formData.lastName}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full bg-gray-100 cursor-not-allowed"
              type="text"
              readOnly
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm font-medium text-black-700 font-semibold">
            Email
          </label>
          <input
            required
            id="email"
            name="email"
            value={formData.email}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full bg-gray-100 cursor-not-allowed"
            type="text"
            readOnly
          />
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col w-full">
            <label htmlFor="department" className="text-sm font-medium text-black-700 font-semibold">
              Department
            </label>
            <input
              required
              id="department"
              name="department"
              value={formData.department}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full bg-gray-100 cursor-not-allowed"
              type="text"
              readOnly
            />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="program" className="text-sm font-medium text-black-700 font-semibold">
              Program
            </label>
            <input
              required
              id="program"
              name="program"
              value={formData.program}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full bg-gray-100 cursor-not-allowed"
              type="text"
              readOnly
            />
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <label htmlFor="phone" className="text-sm font-medium text-black-700 font-semibold">
            Phone Number
          </label>
          <input
            required
            onChange={onChangeHandler}
            id="phone"
            name="phone"
            value={formData.phone}
            className="border border-gray-300 rounded-md py-2 px-4 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            type="tel"
            placeholder="Phone Number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
      </div>
      {/* ================= Right side ================= */}
      <div>
        <div className="mt-8">
          <div className="mt-8 min-w-80">
            <CartTotal />
          </div>
          <div className="mt-12"></div>
          <Title text1={'PAYMENT'} text2={'METHODS'} />
          {/* ==================== PAYMENT METHOD SELECTION ==================== */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => setMethod('gcash')}
              className="flex items-center gap-3 border p-2 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${method === 'gcash' ? 'bg-green-400' : ''
                  }`}
              ></p>
              <img
                className="h-5 mx-4"
                src={assets.GCash_logo}
                alt="GCash logo"
              />
            </div>
            <div
              onClick={() => setMethod('on-site-payment')}
              className="flex items-center gap-3 border p-2 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${method === 'on-site-payment' ? 'bg-green-400' : ''
                  }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                On-Site Payment
              </p>
            </div>
          </div>
          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-black text-white px-16 py-3 text-sm"
            >
              CONFIRM ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;