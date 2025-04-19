import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { assets } from '../assets/assets.js';
import generateReceipt from '../utils/generateReceipt.jsx';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);

  // Connect to the Socket.IO server and set up all realtime listeners
  useEffect(() => {
    const socketInstance = io(backendUrl, {
      query: { token }, // Pass token for authentication
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
    });

    socketInstance.on('connect_error', (err) => {
      console.log('Socket connection error:', err);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected on attempt ${attemptNumber}`);
    });

    socketInstance.on('usersOnline', (count) => {
      setOnlineUsers(count);
    });

    // Listen for new orders
    socketInstance.on('newOrderPlaced', (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
      toast.info(`New order placed by ${newOrder.firstName} ${newOrder.lastName}`);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  const fetchAllOrders = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/orders/list`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/orders/status`,
        { orderId, status: newStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(`Order status updated to "${newStatus}"`);

        // Update the status in the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );

        // Emit the status change to other clients via Socket.IO
        if (socket) {
          socket.emit('updateOrderStatus', {
            orderId,
            status: newStatus,
            updatedBy: 'Admin' // This could be the logged-in user's name
          });
        }

        // Automatically generate a receipt if the status is "Received"
        if (newStatus === 'Received') {
          const order = orders.find((o) => o._id === orderId);
          generateReceipt(order);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order status');
    }
  };

  const handleAppointmentChange = (orderId, field, value) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, [field]: value } : order
      )
    );
  };

  const saveAppointment = async (orderId) => {
    const order = orders.find((o) => o._id === orderId);

    try {
      const response = await axios.post(
        `${backendUrl}/api/orders/appointment`,
        {
          orderId,
          appointmentDate: order.appointmentDate,
          appointmentTime: order.appointmentTime,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Appointment updated successfully');
        
        // Emit the appointment change to other clients via Socket.IO
        if (socket) {
          socket.emit('updateAppointment', {
            orderId,
            appointmentDate: order.appointmentDate,
            appointmentTime: order.appointmentTime,
            updatedBy: 'Admin' 
          });
        }
        
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update appointment');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;

    const matchesSearch = searchQuery === '' ||
      (order._id && order._id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.firstName && order.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.lastName && order.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.phone && order.phone.includes(searchQuery));

    return matchesStatus && matchesSearch;
  });

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const statusOptions = ['All', ...new Set(orders.map(order => order.status))];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Ready for Pick Up':
        return 'bg-blue-100 text-blue-800';
      case 'Received':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const calculateTotalItems = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Order Management
          </h2>
          <div className="flex items-center">
            <span className={`inline-flex mr-2 w-3 h-3 rounded-full ${socket?.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600">
              {socket?.connected 
                ? `Realtime Updates Active (${onlineUsers} user${onlineUsers !== 1 ? 's' : ''} online)` 
                : 'Connecting to realtime server...'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ID, name, items, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              🔍
            </span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <button
            onClick={fetchAllOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin mr-2">↻</span>
            ) : (
              <span className="mr-2">↻</span>
            )}
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: orders.length, color: 'bg-blue-50 border-blue-200' },
          { label: 'Order Placed', value: orders.filter(o => o.status === 'Order Placed').length, color: 'bg-yellow-50 border-yellow-200' },
          { label: 'Ready for Pick Up', value: orders.filter(o => o.status === 'Ready for Pick Up').length, color: 'bg-indigo-50 border-indigo-200' },
          { label: 'Received', value: orders.filter(o => o.status === 'Received').length, color: 'bg-green-50 border-green-200' }
        ].map((stat, index) => (
          <div key={index} className={`${stat.color} border rounded-lg p-4 flex flex-col items-center justify-center`}>
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order, orderIndex) => (
            <div
              key={orderIndex}
              className={`border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md ${
                order._id === expandedOrder ? 'border-blue-300' : 'border-gray-200'
              }`}
            >
              <div
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer ${
                  order._id === expandedOrder ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              >
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div className="bg-white p-2 rounded-full">
                    <img src={assets.parcel_icon} alt="Order" className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {order.firstName} {order.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.date)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ID: {order._id}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {order.paymentMethod}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {calculateTotalItems(order.items)} items
                  </span>
                  <span className="font-bold">
                    {currency} {order.amount}
                  </span>

                  {/* View Receipt Button */}
                  <button
                    className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const receiptUrl = generateReceipt(order);
                      window.open(receiptUrl, '_blank');
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Receipt
                  </button>
                  <button
                    className="text-blue-600 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedOrder(expandedOrder === order._id ? null : order._id);
                    }}
                  >
                    {expandedOrder === order._id ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {expandedOrder === order._id && (
                <div className="p-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">Size: {item.size}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{currency} {item.price}</p>
                              <p className="text-sm">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Receipt Button in Expanded View */}
                      <div className="mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const receiptUrl = generateReceipt(order);
                            window.open(receiptUrl, '_blank');
                          }}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center justify-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
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
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Customer Details</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p>{order.firstName} {order.lastName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p>{order.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Department</p>
                            <p>{order.department || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Program</p>
                            <p>{order.program || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Appointed Date</p>
                            <p>{order.appointmentDate ? new Date(order.appointmentDate).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Appointed Time</p>
                            <p>{order.appointmentTime || 'N/A'}</p>
                          </div>
                          {/* Order ID */}
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">Order ID</p>
                            <p className="font-mono text-xs break-all">{order._id}</p>
                          </div>
                          {/* Payment Status */}
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">Payment Status</p>
                            <div className="flex items-center mt-1">
                              <span
                                className={`inline-flex mr-2 w-3 h-3 rounded-full ${order.status === 'Received' || order.payment === 'paid'
                                  ? 'bg-green-500'
                                  : 'bg-amber-500'
                                  }`}
                              ></span>
                              <span
                                className={`font-medium ${order.status === 'Received' || order.payment === 'paid'
                                  ? 'text-green-600'
                                  : 'text-amber-600'
                                  }`}
                              >
                                {order.status === 'Received' || order.payment === 'paid'
                                  ? 'Paid'
                                  : 'Pending Payment'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Order Management</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Order Status</p>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="Order Placed">Order Placed</option>
                              <option value="Ready for Pick Up">Ready for Pick Up</option>
                              <option value="Received">Received</option>
                            </select>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Appoint Date</p>
                            <input
                              type="date"
                              value={order.appointmentDate ? new Date(order.appointmentDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleAppointmentChange(order._id, 'appointmentDate', e.target.value)}
                              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <p className="text-sm text-gray-500">Appoint Time</p>
                            <input
                              type="time"
                              value={order.appointmentTime || ''}
                              onChange={(e) => handleAppointmentChange(order._id, 'appointmentTime', e.target.value)}
                              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => saveAppointment(order._id)}
                              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-500">
            {searchQuery || filterStatus !== 'All'
              ? 'No orders match your current filters'
              : 'No orders found'}
          </p>
          {(searchQuery || filterStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('All');
              }}
              className="mt-3 text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {filteredOrders.length > 0 && (
        <div className="mt-6 text-right text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
          {(searchQuery || filterStatus !== 'All') && ' (filtered)'}
        </div>
      )}
    </div>
  );
};

export default Orders;