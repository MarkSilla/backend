import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrderData = async () => {
    try {
      console.log("Token:", token);
  
      const response = await axios.get(
        backendUrl + '/api/orders/userorders',
        { headers: { token } }
      );
  
      if (response.data.success) {
        console.log("Orders Response:", response.data.orders); 
  
        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            allOrdersItem.push(item);
          });
        });
  
        setOrderData(allOrdersItem); 
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error loading order data:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (token) {
      console.log("Calling loadOrderData...");
      loadOrderData();
    } else {
      toast.error("Token is missing");
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
  <div className="border-t pt-16">
    <div className="text-2xl">
      <Title text1={'MY'} text2={'ORDERS'} />
    </div>
    <div>
      {orderData.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orderData.map((item, index) => (
          <div
            key={index}
            className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-start gap-6 text-sm">
              <img
                className="w-16 sm:w-20"
                src={item.image && Array.isArray(item.image) && item.image[0] ? item.image[0] : 'placeholder.jpg'}
                alt="orderImages"
              />
              <div>
                <p className="sm:text-base font-medium">{item.name || 'Unknown Item'}</p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p className="text-lg">
                    {currency}
                    {item.price || '0.00'}
                  </p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size || 'N/A'}</p>
                </div>
                <p className="mt-1">
                  Date: <span className="text-gray-400">{item.date ? new Date(item.date).toDateString() : 'Unknown Date'}</span>
                </p>
                <p className="mt-1">
                  Payment: <span className="text-gray-400">{item.paymentMethod || 'Unknown Payment Method'}</span>
                </p>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-between">
              <div className="flex items-center gap-2">
                <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                <p className="text-sm md:text-base">{item.status || 'Unknown Status'}</p>
              </div>
              <button onClick={loadOrderData} className="border px-4 py-2 text-sm font-medium  round-sm">
                Track Order
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
};

export default Orders;