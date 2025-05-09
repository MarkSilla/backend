import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import { sendAdminAppointmentNotification } from "../server.js";
import { sendOrderUpdate } from "../server.js";
import axios from 'axios';
import dotenv from 'dotenv';
import { io } from '../server.js';    
import mongoose from "mongoose";
dotenv.config();

const placeOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId, firstName, lastName, phone, items, amount, department, paymentMethod, program } = req.body;

        // Validate required fields
        if (!userId || !firstName || !lastName || !phone || !items || !amount || !department || !paymentMethod) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Items must be a non-empty array" });
        }

        // Validate each item
        for (const item of items) {
            if (!item._id || !item.size || !item.quantity) {
                return res.status(400).json({ success: false, message: "Each item must have _id, size, and quantity" });
            }
        }

        // First phase: Check all products have sufficient stock
        for (const item of items) {
            const product = await productModel.findById(item._id).session(session); // Use the session
            if (!product) {
                throw new Error(`Product with ID ${item._id} not found`);
            }

            // Parse inventory if it's a string
            if (typeof product.inventory === 'string') {
                try {
                    product.inventory = JSON.parse(product.inventory);
                } catch (error) {
                    throw new Error(`Invalid inventory format for product ${product.name}`);
                }
            }

            const currentStock = parseInt(product.inventory[item.size] || 0, 10);
            if (currentStock < item.quantity) {
                throw new Error(`Not enough stock for ${product.name}, size: ${item.size}. Only ${currentStock} available.`);
            }
        }

        // Second phase: Reduce stock for each product
        for (const item of items) {
            const result = await productModel.updateOne(
                { _id: item._id, [`inventory.${item.size}`]: { $gte: item.quantity } }, // Ensure sufficient stock
                {
                    $inc: {
                        [`inventory.${item.size}`]: -item.quantity, // Reduce stock for the specific size
                        stock: -item.quantity,                     // Reduce total stock
                    },
                },
                { session } // Use the transaction session
            );

            if (result.modifiedCount === 0) {
                throw new Error(`Failed to update stock for product ID ${item._id}, size ${item.size}`);
            }
        }

        // Create a new order
        const newOrder = new orderModel({
            userId,
            firstName,
            lastName,
            phone,
            items,
            amount,
            department,
            paymentMethod,
            program,
            payment: paymentMethod === 'gcash', // Mark paid if using GCash
            status: 'Order Placed',
            date: Date.now(),
        });

        await newOrder.save({ session }); // Save within the transaction

        // Clear the user's cart
        await userModel.findByIdAndUpdate(userId, { cartData: {} }, { session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Emit the new order to all connected admin clients
        io.emit('newOrderPlaced', newOrder);

        res.status(201).json({ success: true, message: "Order placed successfully", order: newOrder });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Error placing order:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const payMongo = async (req, res) => {
    try {
        const { amount, description } = req.body;

        // Validate required fields
        if (!amount || !description) {
            return res.status(400).json({ success: false, message: "Amount and description are required" });
        }

        // Validate amount is a number
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: "Amount must be a positive number" });
        }

        // Create a payment link using PayMongo API
        const response = await axios.post(
            "https://api.paymongo.com/v1/links",
            {
                data: {
                    attributes: {
                        amount: Math.round(amount * 100), // Convert to smallest currency unit and ensure it's an integer
                        description: description,
                        currency: "PHP",
                        success: `${process.env.FRONTEND_URL}/payment-success`, 
                        failed: `${process.env.FRONTEND_URL}/home`, 
                    },
                },
            },
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString("base64")}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Return the payment link and ID to the client
        res.status(201).json({
            success: true,
            message: "Payment link created successfully",
            paymentLink: response.data.data.attributes.checkout_url,
            paymentId: response.data.data.id,
            expiresAt: response.data.data.attributes.livemode ?
                response.data.data.attributes.inactive_at :
                null // In test mode, the link doesn't expire
        });
    } catch (error) {
        // Handle different types of errors
        if (error.response) {
            // PayMongo returned an error
            console.error("PayMongo API error:", error.response.data);

            const errorMessage = error.response.data.errors?.[0]?.detail ||
                "Failed to create payment link";

            return res.status(error.response.status).json({
                success: false,
                message: errorMessage,
                code: error.response.data.errors?.[0]?.code
            });
        } else if (error.request) {
            // No response received
            console.error("No response from PayMongo API:", error.request);
            return res.status(503).json({
                success: false,
                message: "Payment service unavailable"
            });
        } else {
            // Something else went wrong
            console.error("Error creating payment link:", error.message);
            return res.status(500).json({
                success: false,
                message: "Failed to create payment link"
            });
        }
    }
};



const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const updateAppointment = async (req, res) => {
    try {
        const { orderId, appointmentDate, appointmentTime } = req.body;

        // Validate required fields
        if (!orderId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({ success: false, message: "Order ID, appointment date, and appointment time are required" });
        }

        // Find the order by ID
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Update the appointment date and time
        order.appointmentDate = appointmentDate;
        order.appointmentTime = appointmentTime;
        await order.save();

        const userId = order.userId.toString(); // Convert to string for consistency

        // Send admin notification
        await sendAdminAppointmentNotification(
            userId,
            orderId,
            appointmentDate,
            appointmentTime
        );

        res.status(200).json({ success: true, message: "Appointment updated successfully", order });
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const userOrders = async (req, res) => {
    try {
        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        // Validate the required fields
        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "Order ID and status are required" });
        }

        // Find the order by ID
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if the status is already "Received"
        if (order.status === "Received") {
            return res.status(400).json({ success: false, message: "This order has already been marked as Received." });
        }

        // Update the order status
        order.status = status;
        await order.save();

        // If status is "Ready for Pick Up", send notification
        if (status === 'Ready for Pick Up') {
            const userId = order.userId.toString();
            const notificationSent = await sendOrderUpdate(userId, {
                orderId: orderId.toString(),
                status
            });

            return res.status(200).json({
                success: true,
                message: 'Order status updated and notification sent for Ready for Pick Up',
                notificationSent,
                order
            });
        }

        // If status is "Received", log it and update user
        if (status === "Received") {
            console.log(`Order ID: ${orderId} has been marked as Received.`);

            // Send notification to the user that the order is received
            const userId = order.userId.toString();
            const notificationSent = await sendOrderUpdate(userId, {
                orderId: orderId.toString(),
                status: "Received",
                message: "Your order has been successfully received. Thank you!"
            });

            // Update user record (optional, if you want to track order status in the user model)
            await userModel.findByIdAndUpdate(userId, {
                $push: {
                    notifications: {
                        message: `Order ${orderId.slice(-5)} has been marked as Received.`,
                        date: new Date()
                    }
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Order status updated to Received and user notified',
                notificationSent,
                order
            });
        }

        res.status(200).json({ success: true, message: "Status updated successfully", order });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};



export { placeOrder, allOrders, payMongo, userOrders, updateStatus, updateAppointment };