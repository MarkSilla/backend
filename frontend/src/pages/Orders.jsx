import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import QRCodeComponent from '../components/Qrcode'; 
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false); 
  const [qrCodeData, setQrCodeData] = useState(null); 

  const loadOrderData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/orders/userorders`, {
        headers: { token },
      });

      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            item['orderId'] = order._id; 
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
        toast.error(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
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
                <div className="flex gap-2">
                  <button
                    onClick={loadOrderData}
                    className="border px-4 py-2 text-sm font-medium rounded-sm"
                  >
                    Track Order
                  </button>
                  <button
                    onClick={() => {
                      setQrCodeData({
                        orderId: item.orderId,
                        itemName: item.name,
                        quantity: item.quantity,
                        size: item.size,
                        date: item.date,
                      });
                      setShowQRModal(true);
                    }}
                    className="border px-4 py-2 text-sm font-medium rounded-sm bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Show QR Code
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrCodeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4">Scan this QR Code</h3>
            <QRCodeComponent qrCodeData={qrCodeData} />
            <button
              onClick={() => setShowQRModal(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;