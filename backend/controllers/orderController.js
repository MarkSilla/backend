import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Placing orders using on-site payment
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, department, paymentMethod } = req.body;

        if (!userId || !items || !amount || !department || !paymentMethod) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Create a new order
        const newOrder = new orderModel({
            userId,
            items,
            amount,
            department,
            paymentMethod,
            payment: false, // Payment is false for on-site payment
            date: Date.now(),
        });

        // Save the order to the database
        await newOrder.save();

        // Optionally, clear the user's cart after placing the order
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.status(201).json({ success: true, message: "Order placed successfully", order: newOrder });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const payMongo = async (req, res) => {
    
}

const allOrders = async (req, res) => { 

}

const userOrders = async (req, res) => { 

}

const updateStatus = async (req, res) => { 

}



export { placeOrder, allOrders, userOrders, updateStatus };