import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// function for addProducts
const addProduct = async (req, res) => {
  try {
      const { name, description, price, category, subCategory, sizes, department, bestseller, stock, program, inventory: reqInventory } = req.body;

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

      // Parse sizes
      let parsedSizes = [];
      if (typeof sizes === 'string') {
          try {
              parsedSizes = JSON.parse(sizes);
          } catch (error) {
              console.error("Error parsing sizes:", error);
              parsedSizes = [];
          }
      }

      // Initialize inventory
      let inventory = reqInventory || {};
      if (Object.keys(inventory).length === 0 && Array.isArray(parsedSizes)) {
          parsedSizes.forEach(size => {
              inventory[size] = Number(stock) || 0; // Default stock for each size
          });
      }

      console.log("Final Inventory:", inventory); // Log the final inventory

      const productData = {
          name,
          description,
          price: Number(price),
          category,
          subCategory,
          sizes: parsedSizes,
          image: imagesUrl,
          date: Date.now(),
          department,
          program,
          inventory,
          bestseller: bestseller === "true" || bestseller === true ? true : false,
          stock: Number(stock),
      };

      console.log("Product Data:", productData); // Log the product data
      const product = new productModel(productData);
      await product.save();

      res.json({ success: true, message: "Product Added" });
  } catch (error) {
      console.error("Error adding product:", error);
      res.json({ success: false, message: error.message });
  }
};

// function for listProducts
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        
        // Process inventory to ensure it's always an object
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            
            // Ensure inventory is an object
            if (typeof productObj.inventory === 'string') {
                try {
                    productObj.inventory = JSON.parse(productObj.inventory);
                } catch (e) {
                    productObj.inventory = {};
                }
            } else if (!productObj.inventory) {
                productObj.inventory = {};
            }
            
            // Initialize inventory for each size if not present
            if (Array.isArray(productObj.sizes)) {
                productObj.sizes.forEach(size => {
                    if (productObj.inventory[size] === undefined) {
                        productObj.inventory[size] = 0;
                    } else {
                        // Ensure values are numbers
                        productObj.inventory[size] = parseInt(productObj.inventory[size], 10) || 0;
                    }
                });
            }
            console.log("Processed Product Inventory:", productObj.inventory);
            return productObj;
        });
        
        res.json({ success: true, products: processedProducts });
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
        
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        
        const productObj = product.toObject();
        
        // Ensure inventory is an object
        if (typeof productObj.inventory === 'string') {
            try {
                productObj.inventory = JSON.parse(productObj.inventory);
            } catch (e) {
                productObj.inventory = {};
            }
        } else if (!productObj.inventory) {
            productObj.inventory = {};
        }
        
        // Initialize inventory for each size if not present
        if (Array.isArray(productObj.sizes)) {
            productObj.sizes.forEach(size => {
                if (productObj.inventory[size] === undefined) {
                    productObj.inventory[size] = 0;
                } else {
                    // Ensure values are numbers
                    productObj.inventory[size] = parseInt(productObj.inventory[size], 10) || 0;
                }
            });
        }
        
        res.json({ success: true, product: productObj });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// function for updating stock when a product is ordered
const updateStock = async (req, res) => {
  try {
      const { productId, size, quantity } = req.body;
      
      // Validate input
      if (!productId || !size || quantity === undefined) {
          return res.json({ 
              success: false, 
              message: "Product ID, size, and quantity are required." 
          });
      }
      
      // Find the product
      const product = await productModel.findById(productId);
      if (!product) {
          return res.json({ 
              success: false, 
              message: "Product not found." 
          });
      }
      
      // Ensure inventory exists as an object
      if (!product.inventory || typeof product.inventory !== 'object') {
          product.inventory = {};
      }
      
      // If inventory is stored as a JSON string, parse it
      if (typeof product.inventory === 'string') {
          try {
              product.inventory = JSON.parse(product.inventory);
          } catch (error) {
              product.inventory = {};
          }
      }
      
      // Convert quantity to number - this must be a positive number for reduction
      const quantityNum = Math.abs(parseInt(quantity, 10));
      if (isNaN(quantityNum)) {
          return res.json({ 
              success: false, 
              message: "Quantity must be a valid number." 
          });
      }
      
      // Check if size exists in inventory, initialize if not
      const currentStock = parseInt(product.inventory[size] || 0, 10);
      
      // Check if stock is sufficient
      if (currentStock < quantityNum) {
          return res.json({ 
              success: false, 
              message: `Insufficient stock for size ${size}. Available: ${currentStock}, Requested: ${quantityNum}.` 
          });
      }
      
      // IMPORTANT: This is where we REDUCE the stock for the specified size
      product.inventory[size] = currentStock - quantityNum;
      
      console.log(`Reducing stock for ${productId}, size ${size} from ${currentStock} to ${product.inventory[size]}`);
      
      // Also update the total stock if it exists
      if (product.stock !== undefined) {
          const currentTotalStock = parseInt(product.stock, 10) || 0;
          product.stock = Math.max(0, currentTotalStock - quantityNum);
      }
      
      // Save the updated product
      await product.save();
      
      // Convert to object for response
      const productObj = product.toObject();
      
      // Ensure all inventory values are numbers in the response
      if (productObj.inventory && typeof productObj.inventory === 'object') {
          Object.keys(productObj.inventory).forEach(key => {
              productObj.inventory[key] = parseInt(productObj.inventory[key], 10) || 0;
          });
      }
      
      res.json({ 
          success: true, 
          message: "Stock reduced successfully.", 
          product: productObj
      });
  } catch (error) {
      console.error("Error updating stock:", error);
      res.json({ 
          success: false, 
          message: error.message 
      });
  }
};

const edit = async (req, res) => {
    try {
        const { id, name, description, price, sizes, stock, inventory } = req.body;

        // Parse sizes if it's a string
        let parsedSizes = sizes;
        if (typeof sizes === 'string') {
            try {
                parsedSizes = JSON.parse(sizes);
            } catch (e) {
                parsedSizes = [];
            }
        }

        // Process inventory
        let processedInventory = inventory || {};
        if (typeof processedInventory === 'string') {
            try {
                processedInventory = JSON.parse(processedInventory);
            } catch (e) {
                processedInventory = {};
            }
        }

        // Ensure each size has an inventory value
        if (Array.isArray(parsedSizes)) {
            parsedSizes.forEach(size => {
                if (processedInventory[size] === undefined) {
                    processedInventory[size] = Number(stock) || 0;
                }
            });
        }

        const productData = {
            name,
            description,
            price: Number(price),
            sizes: parsedSizes,
            date: Date.now(),
            stock: Number(stock),
            inventory: processedInventory
        };

        // Use the 'id' to find and update the product
        const updatedProduct = await productModel.findByIdAndUpdate(
            id, 
            productData, 
            { new: true } // Return the updated document
        );

        res.json({ 
            success: true, 
            message: "Product Updated",
            product: updatedProduct
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getProductById = async (req, res) => {
  try {
      const { productId } = req.params;
      const product = await productModel.findById(productId);

      if (!product) {
          return res.status(404).json({ success: false, message: "Product not found" });
      }

      res.json({ success: true, product });
  } catch (error) {
      console.error("Error fetching product:", error.message);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct, updateStock, edit, getProductById };