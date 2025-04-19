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
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://uniform-xpress-frontend.vercel.app',
    'https://uniformxpress-backend.vercel.app',
  ],
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
    const localTime = now.toLocaleTimeString('en-GB'); 

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
      // Only notify if userId exists
      if (userId) {
        // Send a single consolidated notification with all necessary information
        const orderUpdate = {
          orderId: order._id.toString(),
          status: 'Ready for Pick Up',
          appointmentDate: order.appointmentDate,
          appointmentTime: order.appointmentTime,
          message: `Your order is now ready for pickup on ${order.appointmentDate} at ${order.appointmentTime}`,
          userId: userId
        };
        
        sendOrderUpdate(userId, orderUpdate);
        console.log(`Order ${order._id} status updated to 'Ready for Pick Up' for user ${userId}`);
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

    // Update order with appointment details
    order.appointmentDate = appointmentDate;
    order.appointmentTime = appointmentTime;
    await order.save();

    // Prepare and send a single notification with all needed details
    const orderUpdate = {
      orderId: orderId.toString(),
      appointmentDate,
      appointmentTime,
      status: order.status,
      userId,
      message: `Admin has scheduled your order: ${orderId.toString().slice(-5)} pickup for ${appointmentDate} at ${appointmentTime}.`
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