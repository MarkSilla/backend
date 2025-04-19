import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import QRCodeComponent from '../components/Qrcode';
import axios from 'axios';
import { toast } from 'react-toastify';
import generateReceipt from '../utils/generateReceipt';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [fullOrders, setFullOrders] = useState([]); // Store full orders data
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  const loadOrderData = async () => {
    try {
      setLoading(true); // Ensure loading state is set
      const response = await axios.get(`${backendUrl}/api/orders/userorders`, {
        headers: { token },
      });

      if (response.data.success) {
        // Store the full orders for receipt generation
        setFullOrders(response.data.orders);
        
        // Process orders for display as before
        const allOrdersItem = response.data.orders.flatMap((order) =>
          order.items.map((item) => ({
            ...item,
            status: order.status,
            payment: order.payment,
            paymentMethod: order.paymentMethod,
            date: order.date,
            orderId: order._id,
            appointmentDate: order.appointmentDate,
            appointmentTime: order.appointmentTime,
          }))
        );

        setOrderData(allOrdersItem.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error loading order data:', error);
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReceipt = (item) => {
    try {
      // Find the full order that contains this item
      const fullOrder = fullOrders.find(order => order._id === item.orderId);
      
      if (!fullOrder) {
        throw new Error('Order not found');
      }
      
      // Generate receipt URL using the full order object
      const url = generateReceipt(fullOrder, currency);
      
      // Open in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt. Please try again.');
    }
  };

  useEffect(() => {
    if (token) {
      loadOrderData();
    } else {
      toast.error('Token is missing');
      setLoading(false);
    }
  }, [token]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'order placed':
        return 'bg-yellow-400';
      case 'ready for pick up':
        return 'bg-purple-400';
      case 'received':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 border-b pb-4">
        <Title text1="MY" text2="ORDERS" />
        <p className="text-gray-500 mt-2">Track and manage your recent orders</p>
      </div>

      {orderData.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0h-2m-6 4v2m-6-2v2m6-6v2m-6-2v2"
            ></path>
          </svg>
          <p className="mt-4 text-xl font-medium text-gray-500">No orders found</p>
          <p className="mt-2 text-gray-400">You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orderData.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        className="w-full h-full object-cover"
                        src={
                          item.image && Array.isArray(item.image) && item.image[0]
                            ? item.image[0]
                            : 'placeholder.jpg'
                        }
                        alt={item.name}
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{item.name || 'Unknown Item'}</h3>
                        <div className="mt-2 flex items-center flex-wrap gap-4">
                          <span className="text-lg font-semibold">
                            {currency}
                            {item.price || '0.00'}
                          </span>
                          <span className="text-gray-600 text-sm px-2 py-1 bg-gray-100 rounded-full">
                            Size: {item.size || 'N/A'}
                          </span>
                          <span className="text-gray-600 text-sm px-2 py-1 bg-gray-100 rounded-full">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-4 md:mt-0">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            item.status
                          )} bg-opacity-20 text-gray-800`}
                        >
                          <span
                            className={`w-2 h-2 mr-1.5 rounded-full ${getStatusColor(item.status)}`}
                          ></span>
                          {item.status || 'Unknown Status'}
                        </span>
                      </div>
                    </div>

                    {/* Order Info Section */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-500">
                      {/* Left Column - Payment Method and Order Date */}
                      <div className="space-y-2">
                        {/* Payment Method */}
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            ></path>
                          </svg>
                          <span>
                            Payment Method: {item.paymentMethod || 'Not Available'}
                          </span>
                        </div>

                        {/* Order Date */}
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <span>
                            Order Date:{' '}
                            {item.date
                              ? new Date(item.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                              : 'Not Available'}
                          </span>
                        </div>
                      </div>

                      {/* Right Column - Appointment Date and Time */}
                      <div className="space-y-2">
                        {/* Appointment Date */}
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                          </svg>
                          <span>
                            Appointed Date:{' '}
                            {item.appointmentDate
                              ? new Date(item.appointmentDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                              : 'Pending'}
                          </span>
                        </div>

                        {/* Appointment Time with Clock Icon */}
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <span>
                            Appointed Time: {item.appointmentTime || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500">
                  Order ID:{' '}
                  <span className="font-mono">
                    {item.orderId ? item.orderId.substring(0, 8) : 'Unknown'}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={loadOrderData}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
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
                    className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Show QR Code
                  </button>
                  
                  {/* Receipt Button */}
                  {item.status === 'Received' && (
                    <button
                      onClick={() => handleGenerateReceipt(item)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      View Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrCodeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Order QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="mb-4 p-2 border border-gray-200 rounded-lg bg-white">
                <QRCodeComponent qrCodeData={qrCodeData} />
              </div>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">
                  Present this QR code when picking up your order
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Order ID: {qrCodeData.orderId?.substring(0, 8)}
                </p>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full py-2 bg-gray-800 text-white rounded-md hover:bg-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;