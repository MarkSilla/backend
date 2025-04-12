import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const List = ({ token }) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">All Uniforms List</h2>
      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-2 px-4 border bg-gray-200 text-sm font-bold  ">
          <span>Image</span>
          <span>Name</span>
          <span>Department</span>
          <span>Price</span>
          <span className="text-center">Action</span>
        </div>

        {/* Product List */}
        {list.length > 0 ? (
          list.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] 
              items-center gap-2 py-2 px-4 border text-sm hover:bg-gray-50 transition"
            >
              <img className="w-12" src={item.image[0]} alt="Product" />
              <p className="truncate">{item.name}</p>
              <p>{item.department}</p>
              <p>
                {currency}
                {item.price}
              </p>
              <button
                onClick={() => removeProduct(item._id)}
                className="bg-red-500 text-white px-2 py-1 w-16 rounded-md text-xs hover:bg-red-600 transition text-center mx-auto"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default List;