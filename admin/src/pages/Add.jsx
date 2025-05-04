import React, { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const Add = ({ token }) => {
  const [images, setImages] = useState({
    image1: false,
    image2: false,
    image3: false,
    image4: false
  });
  
  const availableSizes = ["S", "M", "L", "XL", "XXL"];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Men",
    subCategory: "Topwear",
    department: "General",
    program: "General",
    stock: 0, 
    inventory: {}, 
    sizes: [], 
    bestseller: false
  });

  // Handle all text/select input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle image selection
  const handleImageChange = (e, imageKey) => {
    setImages({
      ...images,
      [imageKey]: e.target.files[0]
    });
  };

  // Toggle size selection and initialize its stock
  const toggleSize = (size) => {
    setFormData(prev => {
      const newInventory = { ...prev.inventory };
      let newSizes = [...prev.sizes];
      
      if (size in newInventory) {
        // If size exists, remove it from inventory
        const { [size]: _, ...remainingInventory } = newInventory;
        newSizes = newSizes.filter(s => s !== size);
        
        return { 
          ...prev, 
          inventory: remainingInventory,
          sizes: newSizes
        };
      } else {
        // If size doesn't exist, add it with 0 stock
        newSizes.push(size);
        
        return { 
          ...prev, 
          inventory: { 
            ...newInventory, 
            [size]: 0 
          },
          sizes: newSizes
        };
      }
    });
  };

  // Update stock for a specific size
  const updateSizeStock = (size, quantity) => {
    const quantityNum = parseInt(quantity, 10) || 0;
    
    setFormData(prev => {
      const newInventory = {
        ...prev.inventory,
        [size]: quantityNum
      };
      
      // Calculate total stock across all sizes
      const totalStock = Object.values(newInventory).reduce((sum, val) => sum + val, 0);
      
      return {
        ...prev,
        inventory: newInventory,
        stock: totalStock 
      };
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const submitFormData = new FormData();

      // Prepare data for submission
      const dataToSubmit = { ...formData };
      
      // Convert objects to strings for FormData
      submitFormData.append('inventory', JSON.stringify(formData.inventory));
      submitFormData.append('sizes', JSON.stringify(formData.sizes));
      
      // Add all other fields
      Object.keys(formData).forEach(key => {
        if (key !== 'inventory' && key !== 'sizes') {
          submitFormData.append(key, formData[key]);
        }
      });

      // Append images
      Object.keys(images).forEach(key => {
        if (images[key]) {
          submitFormData.append(key, images[key]);
        }
      });

      const response = await axios.post(
        `${backendUrl}/api/product/add`, 
        submitFormData, 
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "Men",
          subCategory: "Topwear",
          department: "General",
          program: "General",
          stock: 0,
          inventory: {},
          sizes: [],
          bestseller: false
        });
        setImages({
          image1: false,
          image2: false,
          image3: false,
          image4: false
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>
      
      <form onSubmit={onSubmitHandler} className="space-y-6">
        {/* Images Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-semibold text-gray-700 mb-3">Product Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(num => {
              const imageKey = `image${num}`;
              return (
                <div key={imageKey} className="relative">
                  <label 
                    htmlFor={imageKey}
                    className="block cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
                  >
                    <img 
                      className="w-full h-32 object-cover" 
                      src={!images[imageKey] ? assets.upload_area : URL.createObjectURL(images[imageKey])} 
                      alt={`Upload area ${num}`} 
                    />
                    {!images[imageKey] && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <span>Image {num}</span>
                      </div>
                    )}
                  </label>
                  <input 
                    onChange={(e) => handleImageChange(e, imageKey)} 
                    type="file" 
                    id={imageKey} 
                    hidden 
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name*
            </label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              type="text"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Product Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (₱)*
            </label>
            <input
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              type="number"
              placeholder="Enter price"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Product Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your product..."
            required
          />
        </div>

        {/* Categories Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>

          {/* Sub Category */}
          <div>
            <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Sub Category
            </label>
            <select
              id="subCategory"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Accessory">Accessory</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="CHAS">CHAS</option>
              <option value="CBA">CBA</option>
              <option value="CCS">CCS</option>
              <option value="CEAS">CEAS</option>
              <option value="CHTM">CHTM</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Program */}
          <div>
            <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
              Program
            </label>
            <select
              id="program"
              name="program"
              value={formData.program}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
              <option value="BSEMC">BSEMC</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        {/* Sizes and Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Sizes and Stock
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
            {availableSizes.map(size => {
              const isSelected = size in formData.inventory;
              
              return (
                <div 
                  key={size} 
                  className={`border rounded-md p-3 transition-colors ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{size}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSize(size)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  {isSelected && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Stock:</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.inventory[size]}
                        onChange={(e) => updateSizeStock(size, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Display total stock */}
          <div className="text-sm text-gray-600">
            Total Stock: {formData.stock} units
          </div>
        </div>

        {/* Bestseller Option */}
        <div className="flex items-center">
          <input
            id="bestseller"
            name="bestseller"
            type="checkbox"
            checked={formData.bestseller}
            onChange={() => setFormData({...formData, bestseller: !formData.bestseller})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="bestseller" className="ml-2 block text-sm text-gray-700 font-medium">
            Add to bestseller collection
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default Add;