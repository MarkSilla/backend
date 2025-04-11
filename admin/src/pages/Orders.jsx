import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchallOrders = async () => {
    if (!token) {
      return;
    }
    try {
      const response = await axios.post(backendUrl + '/api/orders/list', {}, { headers: { token } });
      console.log("API Response:", response.data);
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchallOrders();
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <h3 className="text-2xl font-bold mb-6">Orders Page</h3>
      <div className="grid grid-cols-1 gap-6">
        {orders.map((order, orderIndex) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr_1fr] gap-4 items-start border border-gray-300 rounded-lg p-4 shadow-md"
            key={orderIndex}
          >
            {/* Order Icon */}
            <div className="flex justify-center items-center">
              <img src={assets.parcel_icon} alt="parcel icon" className="w-16 h-16" />
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-semibold text-lg mb-2">Order Items</h4>
              {order.items.map((item, index) => (
                <p key={index} className="text-sm">
                  {item.name} x {item.quantity} <span className="text-gray-500">({item.size})</span>
                  {index !== order.items.length - 1 && ','}
                </p>
              ))}
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="font-semibold text-lg mb-2">Customer Info</h4>
              <p className="text-sm">
                {order.firstName || 'Unknown FirstName'} {order.lastName || 'Unknown LastName'}
              </p>
              <p className="text-sm">{order.department || 'Unknown Department'}</p>
              <p className="text-sm">{order.program || 'Unknown Program'}</p>
              <p className="text-sm">{order.phone || 'Unknown Phone Number'}</p>
            </div>

            {/* Order Details */}
            <div>
              <h4 className="font-semibold text-lg mb-2">Order Details</h4>
              <p className="text-sm">Items: {order.items.length}</p>
              <p className="text-sm">Method: {order.paymentMethod}</p>
              <p className="text-sm">Payment: {order.payment ? 'Done' : 'Pending'}</p>
              <p className="text-sm">
                Date: {order.date ? new Date(order.date).toLocaleDateString() : 'Unknown Date'}
              </p>
              <p className="text-sm">
                Total: <span className="font-bold">{currency} {order.amount}</span>
              </p>
              <select className="mt-2 p-2 border border-gray-300 rounded">
                <option value="Order Placed">Order Placed</option>
                <option value="Received">Received</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;