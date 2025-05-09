import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import cron from 'node-cron';
import orderModel from './models/orderModel.js';
import userModel from './models/userModel.js';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://uniform-xpress-frontend.vercel.app', 'https://uniformxpress-backend.vercel.app']
    : '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Create Socket.IO server
const io = new Server(server, {
  cors: corsOptions,
});

let connectedUsers = 0;
const userSockets = {};

// Socket.IO connection logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  connectedUsers++;
  io.emit('usersOnline', connectedUsers);

  // Get userId from auth
  const userId = socket.handshake.auth?.userId;
  if (userId) {
    userSockets[userId] = socket.id;
    console.log(`User ${userId} associated with socket ID: ${socket.id}`);
  }

  // Handle userOnline event explicitly
  socket.on('userOnline', ({ userId }) => {
    if (userId) {
      userSockets[userId] = socket.id;
      console.log(`User ${userId} marked as online with socket ID: ${socket.id}`);

      // Debug: Log all connected users
      console.log('Connected users:', Object.keys(userSockets));
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    connectedUsers--;
    io.emit('usersOnline', connectedUsers);

    for (const [key, value] of Object.entries(userSockets)) {
      if (value === socket.id) {
        delete userSockets[key];
        console.log(`User ${key} disconnected`);
        break;
      }
    }
  });
});

// Function to send notification to specific user
const notifyUser = (userId, eventName, data) => {
  const socketId = userSockets[userId];
  if (socketId) {
    // Always include userId in the data
    const notificationData = { ...data, userId };
    io.to(socketId).emit(eventName, notificationData);
    console.log(`Notified user ${userId} with event ${eventName}:`, notificationData);
    return true;
  } else {
    console.warn(`Socket ID not found for user ${userId}. Cannot send ${eventName} notification.`);
    return false;
  }
};

// Function to format date to YYYY-MM-DD
const formatDate = (dateStr) => {
  try {
    // Handle if date is already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateStr}, returning as is`);
      return dateStr;
    }
    
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  } catch (error) {
    console.error(`Error formatting date ${dateStr}:`, error);
    return dateStr;
  }
};

// Function to format time to HH:MM AM/PM
const formatTime = (timeStr) => {
  try {
    // If already in format like "08:00 AM", return as is
    if (/^\d{1,2}:\d{2}\s(?:AM|PM)$/i.test(timeStr)) {
      // Ensure consistent formatting (2-digit hour, uppercase AM/PM)
      const [timePart, ampm] = timeStr.split(' ');
      const [hours, minutes] = timePart.split(':');
      return `${hours.padStart(2, '0')}:${minutes} ${ampm.toUpperCase()}`;
    }
    
    // Handle 24-hour format like "14:00"
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12; // Convert to 12-hour format
      return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    }
    
    // Try to parse as Date object
    const date = new Date(`2000-01-01T${timeStr}`);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }).replace(/\s/, ' '); // Ensure proper spacing between time and AM/PM
    }
    
    console.warn(`Could not format time: ${timeStr}, returning as is`);
    return timeStr;
  } catch (error) {
    console.error(`Error formatting time ${timeStr}:`, error);
    return timeStr;
  }
};

// Function to send order updates to specific users (combines status and appointment details)
const sendOrderUpdate = (userId, orderDetails) => {
  return notifyUser(userId, 'orderUpdated', {
    ...orderDetails,
    userId // Always include userId
  });
};

// CRON job to update order statuses
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const localDate = now.toLocaleDateString('en-CA');
    const localTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });


    // Find orders ready for pickup
    const ordersToUpdate = await orderModel.find({
      appointmentDate: { $lte: localDate },
      appointmentTime: { $lte: localTime },
      status: { $nin: ['Ready for Pick Up', 'Received'] },
    });

    console.log(`Found ${ordersToUpdate.length} orders to update to Ready for Pick Up`);

    // Update orders and notify users via WebSocket
    for (const order of ordersToUpdate) {
      order.status = 'Ready for Pick Up';
      await order.save();

      const userId = order.userId?.toString();
      if (userId) {
        // Format the date and time
        const formattedDate = formatDate(order.appointmentDate);
        const formattedTime = formatTime(order.appointmentTime);

        const orderShortId = order._id.toString().slice(0, 8);

        const orderUpdate = {
          orderId: order._id.toString(),
          status: 'Ready for Pick Up',
          appointmentDate: formattedDate, // Use formatted values
          appointmentTime: formattedTime, // Use formatted values
          message: `Your order ${orderShortId} is now ready for pickup on ${formattedDate} at ${formattedTime}`,
          userId: userId,
        };
        
        sendOrderUpdate(userId, orderUpdate);
        console.log(`Order ${orderShortId} status updated to 'Ready for Pick Up' for user ${userId}`);
      }
    }

    // Find orders that have been received but not yet notified
    // Using $or to handle both cases where notificationSent doesn't exist or is false
    const receivedOrders = await orderModel.find({
      status: 'Received',
      $or: [
        { notificationSent: { $exists: false } },
        { notificationSent: false }
      ]
    });

    console.log(`Found ${receivedOrders.length} received orders to notify about`);

    // Process received orders
    for (const order of receivedOrders) {
      const userId = order.userId?.toString();
      if (userId) {
        try {
          // First update the database to prevent duplicate notifications in case of errors
          order.notificationSent = true;
          await order.save();

          // Then send the notification
          sendOrderUpdate(userId, {
            orderId: order._id.toString(),
            status: 'Received',
            message: 'Thank you! Your order has been received.',
            userId: userId
          });

          console.log(`User ${userId} notified for received order ${order._id}`);

          // Update user record if needed
          if (userModel) {
            await userModel.findByIdAndUpdate(userId, {
              $push: {
                notifications: {
                  message: `Your order ${order._id.toString().slice(-5)} has been marked as Received.`,
                  date: new Date(),
                }
              }
            });
          }
        } catch (error) {
          console.error(`Error processing received order ${order._id}:`, error);
          // If there was an error sending the notification, revert the notificationSent flag
          try {
            order.notificationSent = false;
            await order.save();
            console.log(`Reset notificationSent flag for order ${order._id} due to error`);
          } catch (saveError) {
            console.error(`Error resetting notificationSent flag for order ${order._id}:`, saveError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error.message);
  }
});

// Admin appointment notification function - export this for use in your admin routes
const sendAdminAppointmentNotification = async (userId, orderId, appointmentDate, appointmentTime) => {
  try {
    // Find the order to update
    const order = await orderModel.findById(orderId);
    if (!order) {
      console.error(`Order ${orderId} not found`);
      return false;
    }

    // Format the date and time consistently
    const formattedDate = formatDate(appointmentDate);
    const formattedTime = formatTime(appointmentTime);
    
    // Update order with appointment details (store formatted values)
    order.appointmentDate = formattedDate;
    order.appointmentTime = formattedTime;
    await order.save();

    // Get the last 5 characters of the order ID or handle properly if too short
    const orderShortId = orderId.toString().slice(0, 8);
    
    // Format the message with the exact format requested
    const message = `Admin has scheduled your order: ${orderShortId} pickup for ${formattedDate} at ${formattedTime}.`;

    // Prepare and send a single notification with all needed details
    const orderUpdate = {
      orderId: orderId.toString(),
      appointmentDate: formattedDate,
      appointmentTime: formattedTime,
      status: order.status,
      userId,
      message: message,
    };

    // Send the notification
    return sendOrderUpdate(userId, orderUpdate);
  } catch (error) {
    console.error('Error sending admin appointment notification:', error);
    return false;
  }
};

export {
  io,
  sendOrderUpdate,
  sendAdminAppointmentNotification
}; // Export functions for use in route handlers

// API Routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

app.get('/', (req, res) => {
  res.send('API Working');
});

// Start the server
const port = process.env.PORT || 4000;
connectDB(); // Connect to MongoDB
connectCloudinary(); // Connect to Cloudinary

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});