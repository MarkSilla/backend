import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
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
    <div>
      <h3>Orders Page</h3>
      <div>
        {orders.map((order, orderIndex) => (
          <div key={orderIndex}>
            <img src={assets.parcel_icon} alt="parcel icon" />
            <div>
              {order.items.map((item, index) => {
                if (index === order.items.length - 1) {
                  return (
                    <p key={index}>
                      {item.name} x {item.quantity} <span> {item.size} </span>
                    </p>
                  );
                } else {
                  return (
                    <p key={index}>
                      {item.name} x {item.quantity} <span> {item.size} </span>,
                    </p>
                  );
                }
              })}
            </div>
            <p>
              {order.firstName ? order.firstName : 'Unknown FirstName'} {order.lastName ? order.lastName : 'Unknown LastName'}
            </p>
            <div>
              {order.department || 'Unknown Department'} {order.program || 'Unknown Program'}
            </div>
            <p>{order.phone || 'Unknown Phone Number'}</p>
            <div>
              <p>Items : {order.items.length}</p>
              <p>Method: {order.paymentMethod}</p>
              <p>Payment : {order.payment ? 'Done' : 'Pending'}</p>
              <p>Date: {order.date ? new Date(order.date).toLocaleDateString() : 'Unknown Date'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;