import express from 'express';
import { placeOrder, allOrders, payMongo, userOrders, updateStatus, updateAppointment } from '../controllers/orderController.js'; // Import the new controller
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

// Admin Features
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);
orderRouter.post('/appointment', adminAuth, updateAppointment);

// Payment Features
orderRouter.post('/paymongo', authUser, payMongo);
orderRouter.post('/place', authUser, placeOrder);


// User Features
orderRouter.get('/userorders', authUser, userOrders);

// QR Code Feature
orderRouter.post('/received/:orderId', adminAuth, updateStatus );

export default orderRouter;
