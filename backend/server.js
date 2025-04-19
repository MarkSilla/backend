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
    io.to(socketId).emit(eventName, data);
    console.log(`Notified user ${userId} with event ${eventName}:`, data);
    return true;
  } else {
    console.warn(`Socket ID not found for user ${userId}. Cannot send ${eventName} notification.`);
    return false;
  }
};

// Function to send appointment updates to specific users
const sendAppointmentUpdate = (userId, appointmentDetails) => {
  return notifyUser(userId, 'appointmentUpdated', appointmentDetails);
};

// Function to send order status updates to specific users
const sendOrderStatusUpdate = (userId, orderDetails) => {
  return notifyUser(userId, 'orderStatusUpdated', orderDetails);
};

// CRON job to update order statuses
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const localDate = now.toLocaleDateString('en-CA'); 
    const localTime = now.toLocaleTimeString('en-GB'); 

    const ordersToUpdate = await orderModel.find({
      appointmentDate: { $lte: localDate },
      appointmentTime: { $lte: localTime },
      status: { $nin: ['Ready for Pick Up', 'Received'] },
    });
    console.log(`Found ${ordersToUpdate.length} orders to update`);
    // Update orders and notify users via WebSocket
    for (const order of ordersToUpdate) {
      order.status = 'Ready for Pick Up';
      await order.save();

      const userId = order.userId?.toString();
      // Only notify if userId exists
      if (userId) {
        // Send order status update notification
        const statusUpdate = {
          orderId: order._id.toString(),
          status: 'Ready for Pick Up',
        };
        sendOrderStatusUpdate(userId, statusUpdate);

        // Send detailed appointment notification
        const appointmentDetails = {
          orderId: order._id.toString(),
          status: 'Ready for Pick Up',
          appointmentDate: order.appointmentDate,
          appointmentTime: order.appointmentTime,
        };
        sendAppointmentUpdate(userId, appointmentDetails);
      }

      console.log(`Order ${order._id} status updated to 'Ready for Pick Up' for user ${userId}`);
    }

    if (ordersToUpdate.length > 0) {
      console.log(`Updated ${ordersToUpdate.length} orders to 'Ready for Pick Up'`);
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

    // Prepare detailed appointment notification
    const appointmentDetails = {
      orderId: orderId.toString(),
      appointmentDate,
      appointmentTime,
      message: `Admin has scheduled your order: ${orderId.slice(-5)} pickup for ${appointmentDate} at ${appointmentTime}.`
    };    

    // Send the notification
    return sendAppointmentUpdate(userId, appointmentDetails);
  } catch (error) {
    console.error('Error sending admin appointment notification:', error);
    return false;
  }
};

export {
  io,
  sendOrderStatusUpdate,
  sendAppointmentUpdate,
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