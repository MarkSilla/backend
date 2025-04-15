import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import cron from 'node-cron'; // Import node-cron
import orderModel from './models/orderModel.js'; // Import the Order model

// App config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// Middlewares 
app.use(express.json());
app.use(cors());

// API endpoint
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

// Cron job to update order statuses
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // Format: "HH:mm"

    // Find orders where the appointment date and time have passed and the status is not "Ready for Pick Up" or "Received"
    const ordersToUpdate = await orderModel.find({
      appointmentTime: { $lte: currentTime },
      status: { $nin: ['Ready for Pick Up', 'Received'] }, // Exclude "Received" and other final statuses
    });

    // Update the status of these orders
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

// Root endpoint
app.get('/', (req, res) => {
  res.send("API Working");
});

// Start the server
app.listen(port, () => console.log('Server started on PORT : ' + port));