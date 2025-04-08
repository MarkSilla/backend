import React, { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [department, setDepartment] = useState("BSIT");
  const [stock, setStocks] = useState(0);
  const [sizes, setSizes] = useState([]);
  const [bestseller, setBestseller] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("department", department);
      formData.append("bestseller", bestseller);
      formData.append("stock", stock);
      formData.append("sizes", JSON.stringify(sizes));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } });
      console.log("Form Data:", Object.fromEntries(formData.entries()));

      setTimeout(() => {
        console.log("Form submitted successfully!");
      }, 1000);
      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setDescription('');
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      {/* Upload Image Section */}
      <div>
        <p className='mb-2'> Upload Image</p>
        <div className='flex gap-2'>
          <label htmlFor="image1">
            <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
          </label>
          <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden />

          <label htmlFor="image2">
            <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
          </label>
          <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden />

          <label htmlFor="image3">
            <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
          </label>
          <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden />

          <label htmlFor="image4">
            <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
          </label>
          <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden />
        </div>
      </div>

      {/* Product Name */}
      <div className='w-full'>
        <p className='mb-2'>Product name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className='w-full max-w-[500px] px-3 py-2 border rounded'
          type="text"
          placeholder='Type here'
          required
        />
      </div>

      {/* Product Description */}
      <div className='w-full'>
        <p className='mb-2'>Product description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className='w-full max-w-[500px] px-3 py-2 border rounded'
          placeholder='Write content here'
          required
        />
      </div>

      {/* Product Category & Subcategory */}
      <div className='flex flex-col sm:flex-row gap-4 w-full sm:gap-8'>
        <div>
          <p>Product category</p>
          <select onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2 border rounded'>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>
        </div>
        <div>
          <p className='mb-2'>Sub category</p>
          <select onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2 border rounded'>
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Accessory">Accessory</option>
          </select>
        </div>
        <div>
          <p className='mb-2'>Department</p>
          <select onChange={(e) => setDepartment(e.target.value)} className='w-full px-3 py-2 border rounded'>
            <option value="BSIT">BSIT</option>
            <option value="BSCS">BSCS</option>
            <option value="BSEMC">BSEMC</option>
          </select>
        </div>
      </div>

      {/* Product Stock */}
      <div className='w-full'>
        <p className='mb-2'>Product Stock</p>
        <input
          onChange={(e) => setStocks(e.target.value)}
          value={stock}
          className='w-full max-w-[200px] px-3 py-2 border rounded'
          type="number"
          placeholder='Enter stock'
          required
        />
      </div>

      {/* Product Price */}
      <div className='w-full'>
        <p className='mb-2'>Product Price</p>
        <input
          onChange={(e) => setPrice(e.target.value)}
          value={price}
          className='w-full max-w-[200px] px-3 py-2 border rounded'
          type="number"
          placeholder='25'
          required
        />
      </div>

      {/* Product Sizes */}
      <div>
        <p className='mb-2'>Product Sizes</p>
        <div className='flex gap-3'>
          <div onClick={() => setSizes((prev) => prev.includes("S") ? prev.filter((item) => item !== "S") : [...prev, "S"])}>
            <p className={`${sizes.includes("S") ? "bg-blue-100" : "bg-slate-200"} px-4 py-2 rounded cursor-pointer`}>S</p>
          </div>
          <div onClick={() => setSizes((prev) => prev.includes("M") ? prev.filter((item) => item !== "M") : [...prev, "M"])}>
            <p className={`${sizes.includes("M") ? "bg-blue-100" : "bg-slate-200"} px-4 py-2 rounded cursor-pointer`}>M</p>
          </div>
          <div onClick={() => setSizes((prev) => prev.includes("L") ? prev.filter((item) => item !== "L") : [...prev, "L"])}>
            <p className={`${sizes.includes("L") ? "bg-blue-100" : "bg-slate-200"} px-4 py-2 rounded cursor-pointer`}>L</p>
          </div>
          <div onClick={() => setSizes((prev) => prev.includes("XL") ? prev.filter((item) => item !== "XL") : [...prev, "XL"])}>
            <p className={`${sizes.includes("XL") ? "bg-blue-100" : "bg-slate-200"} px-4 py-2 rounded cursor-pointer`}>XL</p>
          </div>
          <div onClick={() => setSizes((prev) => prev.includes("XXL") ? prev.filter((item) => item !== "XXL") : [...prev, "XXL"])}>
            <p className={`${sizes.includes("XXL") ? "bg-blue-100" : "bg-slate-200"} px-4 py-2 rounded cursor-pointer`}>XXL</p>
          </div>
        </div>
      </div>

      {/* Bestseller Checkbox */}
      <div className='flex gap-2 mt-2'>
        <input
          onChange={() => setBestseller((prev) => !prev)} type="checkbox" id='bestseller' checked={bestseller}/>
        <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
      </div>

      {/* Submit Button */}
      <button type="submit" className='w-32 py-3 bg-black text-white text-center'>ADD</button>
    </form>
  );
};

export default Add;