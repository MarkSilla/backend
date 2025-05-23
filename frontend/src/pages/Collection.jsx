import React, { useContext, useEffect, useState, } from 'react';
import { useLocation } from 'react-router-dom'; // move this out of your React import
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import Productitem from '../components/Productitem';

const Collection = () => {
  const { products, search } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [program, setProgram] = useState([]);
  const [department, setDepartment] = useState([]);
  const [sortType, setSortType] = useState('default');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("query") || search;

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleProgram = (e) => {
    if (program.includes(e.target.value)) {
      setProgram((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setProgram((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    if (!products || !Array.isArray(products)) {
      setFilteredProducts([]); // Set an empty array if products is undefined or not an array
      return;
    }

    let productsCopy = products.slice();

    // Filter by category
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }

    // Filter by subCategory
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => subCategory.includes(item.subCategory));
    }

    // Filter by program
    if (program.length > 0) {
      productsCopy = productsCopy.filter((item) => program.includes(item.program));
    }

    // Filter by search query
    if (searchTerm) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }    

    setFilteredProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filteredProducts.slice();
    switch (sortType) {
      case 'low-high':
        fpCopy.sort((a, b) => a.price - b.price);
        break;
      case 'high-low':
        fpCopy.sort((a, b) => b.price - a.price);
        break;
      default:
        fpCopy = products.slice();
        break;
    }

    setFilteredProducts(fpCopy);
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, department, search, products, program, searchTerm]);

  // Apply sorting dynamically when sortType changes
  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Filter Options */}
      <div className='min-w-60'>
        <p
          onClick={() => setShowFilter(!showFilter)}
          className='my-2 text-xl flex items-center cursor-pointer gap-2'
        >
          FILTERS
          <img
            className={`h-3 sm:hidden transition-transform ${showFilter ? 'rotate-90' : ''}`}
            src={assets.dropdown_icon}
            alt="dropdown"
          />
        </p>

        {/* CATEGORIES */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value='Men' onChange={toggleCategory} /> Men
            </label>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value='Women' onChange={toggleCategory} /> Women
            </label>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value='Unisex' onChange={toggleCategory} /> Unisex
            </label>
          </div>
        </div>

        {/* UNIFORM TYPE */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>SUB CATEGORY</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value='Topwear' onChange={toggleSubCategory} /> Topwear
            </label>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value='Bottomwear' onChange={toggleSubCategory} /> Bottomwear
            </label>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value='Accessory' onChange={toggleSubCategory} /> Accessory
            </label>
          </div>
        </div>

        {/* Program */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>PROGRAM</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value="BSIT" onChange={toggleProgram} /> BSIT
            </label>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value="BSCS" onChange={toggleProgram} /> BSCS
            </label>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value="BSEMC" onChange={toggleProgram} /> BSEMC
            </label>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value="General" onChange={toggleProgram} /> General
            </label>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'COLLEGE'} text2={'COLLECTIONS'} />
          {/* Product Sort */}
          <select
            className='border-2 border-gray-300 text-sm px-2 py-1'
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="default">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <Productitem key={item._id} name={item.name} id={item._id} price={item.price} image={item.image} />
            ))
          ) : (
            <p className='col-span-full text-center text-gray-500'>No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;