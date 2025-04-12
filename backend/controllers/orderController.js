import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js"; 

const placeOrder = async (req, res) => {
    try {
        const { userId, firstName, lastName, phone, items, amount, department, paymentMethod, program } = req.body;

        // Validate required fields
        if (!userId || !firstName || !lastName || !phone || !items || !amount || !department || !paymentMethod) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Reduce stock for each item in the order
        for (const item of items) {
            const product = await productModel.findById(item._id); // Find the product by ID
            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${item._id} not found` });
            }

            // Check if the product has enough stock
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Not enough stock for product: ${product.name}` });
            }

            // Reduce the product stock
            product.stock -= item.quantity;
            await product.save();
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
    try {
        const { amount, description } = req.body;

        // Validate required fields
        if (!amount || !description) {
            return res.status(400).json({ success: false, message: "Amount and description are required" });
        }

        // Create a payment link using PayMongo API
        const response = await axios.post(
            "https://api.paymongo.com/v1/links",
            {
                data: {
                    attributes: {
                        amount: amount * 100,
                        description: description,
                    },
                },
            },
            {
                headers: {
                    Authorization: `Basic ${Buffer.from("sk_test_QPWmfdMUtUyXV3y7XHBb58yK").toString("base64")}`, // Replace with your PayMongo secret key
                    "Content-Type": "application/json",
                },
            }
        );

        // Return the payment link to the client
        res.status(201).json({
            success: true,
            message: "Payment link created successfully",
            paymentLink: response.data.data.attributes.checkout_url,
        });
    } catch (error) {
        console.error("Error creating payment link:", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Failed to create payment link" });
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

        // Update the order status
        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // If the status is "Received", log the event
        if (status === "Received") {
            console.log(`Order ID: ${orderId} has been marked as Received.`);
        }

        res.json({ success: true, message: "Status updated successfully", order: updatedOrder });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};



export { placeOrder, allOrders, payMongo, userOrders, updateStatus,};