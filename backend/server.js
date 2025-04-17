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
    'http://localhost:5173', // Local frontend
    'http://localhost:5174', // Another local frontend (if applicable)
    'https://uniform-xpress-frontend.vercel.app', // Deployed frontend
    'https://uniformxpress-backend.vercel.app', // Deployed backend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  credentials: true, // Allow cookies and authentication headers
};

app.use(cors(corsOptions)); // Apply the CORS middleware
app.options('*', cors(corsOptions)); // Allow preflight requests for all routes

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://uniform-xpress-frontend.vercel.app',
      'https://uniformxpress-backend.vercel.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

app.use(express.json());

// API endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Export the `io` instance for use in controllers
export { io };

// Cron job to update order statuses
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0];

    const ordersToUpdate = await orderModel.find({
      appointmentTime: { $lte: currentTime },
      status: { $nin: ['Ready for Pick Up', 'Received'] },
    });

    for (const order of ordersToUpdate) {
      order.status = 'Ready for Pick Up';
      await order.save();
    }

    if (ordersToUpdate.length > 0) {
      console.log(`Updated ${ordersToUpdate.length} orders to "Ready for Pick Up"`);
    }
  } catch (error) {
    console.error('Error updating order statuses:', error);
  }
});

app.get('/', (req, res) => {
  res.send('API Working');
});

server.listen(port, () => console.log('Server started on PORT : ' + port));