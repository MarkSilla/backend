import express from 'express';
import { placeOrder, allOrders, payMongo, userOrders, updateStatus } from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

// Admin Features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

// Payment Features
orderRouter.post('/paymongo', authUser, payMongo)
orderRouter.post('/place',authUser, placeOrder)

// User Features
orderRouter.get('/userorders', authUser, userOrders)

export default orderRouter;
