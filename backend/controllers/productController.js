import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// function for addProducts
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, department, bestseller, stock } = req.body;

        const image1 = req.files?.image1?.[0] || null;
        const image2 = req.files?.image2?.[0] || null;
        const image3 = req.files?.image3?.[0] || null;
        const image4 = req.files?.image4?.[0] || null;

        const images = [image1, image2, image3, image4].filter((item) => item !== null);

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
                return result.secure_url;
            })
        );

        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now(),
            department,
            bestseller: bestseller === "true" || bestseller === true ? true : false,
            stock: Number(stock), 
        };

        console.log(productData); 
        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: "Product Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// function for listProducts
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// function for removeProducts
const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// function for singleProducts
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId);
        res.json({ success: true, product });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// function for updating stock when a product is ordered
const updateStock = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Validate input
        if (!productId || !quantity) {
            return res.json({ success: false, message: "Product ID and quantity are required." });
        }

        // Find the product
        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found." });
        }

        // Check if stock is sufficient
        if (product.stock < quantity) {
            return res.json({ success: false, message: "Insufficient stock." });
        }

        // Reduce the stock
        product.stock -= quantity;

        // Save the updated product
        await product.save();

        res.json({ success: true, message: "Stock updated successfully.", product });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { listProducts, addProduct, removeProduct, singleProduct, updateStock };