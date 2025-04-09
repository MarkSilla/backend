import React, { useContext, useState } from 'react';
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
  
      // Debugging: Log orderData
      console.log("Order Data:", orderData);
  
      switch (method) {
        case 'gcash':
         
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

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* ================= Left side ================= */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First Name"
          />
          <input
            required
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last Name"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Email"
        />
        <div className="flex gap-3">
          <select
            required
            onChange={onChangeHandler}
            name="department"
            value={formData.department}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          >
            <option value="" disabled className="text-gray-400">
              Select Department
            </option>
            <option value="CAHS">CAHS</option>
            <option value="CBA">CBA</option>
            <option value="CCS">CCS</option>
            <option value="CEAS">CEAS</option>
            <option value="CHTM">CHTM</option>
          </select>
          <select
            required
            onChange={onChangeHandler}
            name="program" // Corrected name attribute
            value={formData.program}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          >
            <option value="" disabled className="text-gray-400">
              Select Program
            </option>
            <option value="BSIT">BSIT</option>
            <option value="BSCS">BSCS</option>
            <option value="BSEMC">BSEMC</option>
          </select>
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone Number"
        />
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