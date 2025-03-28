import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import Productitem from '../components/Productitem';

const Collection = () => {
  const { products, search } = useContext(ShopContext); // Access search from context
  const [showFilter, setShowFilter] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [department, setDepartment] = useState([]);
  const [sortType, setSortType] = useState('relevant'); // Added state for sorting

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

  const toggleDepartment = (e) => {
    if (department.includes(e.target.value)) {
      setDepartment((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setDepartment((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    // Filter by category
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }

    // Filter by subCategory
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => subCategory.includes(item.subCategory));
    }

    // Filter by department
    if (department.length > 0) {
      productsCopy = productsCopy.filter((item) => department.includes(item.department));
    }

    // Filter by search query
    if (search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filteredProducts.slice();
    switch (sortType) {
      case 'low-high':
        fpCopy.sort((a, b) => a.price - b.price); // Sort by price (low to high)
        break;
      case 'high-low':
        fpCopy.sort((a, b) => b.price - a.price); // Sort by price (high to low)
        break;
      default:
        fpCopy = filteredProducts;
        break;
    }

    setFilteredProducts(fpCopy);
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, department, search, products]); // Added search to dependencies

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
          </div>
        </div>

        {/* DEPARTMENT */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>DEPARTMENT</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value='BSIT' onChange={toggleDepartment} /> BSIT
            </label>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value='BSCS' onChange={toggleDepartment} /> BSCS
            </label>
            <label className='flex gap-2'>
              <input type='checkbox' className='w-3' value='BSEMC' onChange={toggleDepartment} /> BSEMC
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
            onChange={(e) => setSortType(e.target.value)} // Fixed onChange handler
          >
            <option value="relevant">Sort by: Relevant</option>
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