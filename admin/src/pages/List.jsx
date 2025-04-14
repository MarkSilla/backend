import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const List = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [editProduct, setEditProduct] = useState(null);
  const [departments, setDepartments] = useState(['All']);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);

        // Extract unique departments for the filter dropdown
        const uniqueDepartments = ['All', ...new Set(response.data.products.map(item => item.department))];
        setDepartments(uniqueDepartments);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
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
        setConfirmDelete(null);
        await fetchProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove product');
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
  };

  const saveEdit = async () => {
    try {
      const updatedProduct = {
        id: editProduct._id, // Use the product's ID internally
        name: editProduct.name,
        description: editProduct.description || '',
        price: editProduct.price,
        sizes: JSON.stringify(editProduct.sizes || []),
        stock: editProduct.stock || 0,
      };

      const response = await axios.post(
        `${backendUrl}/api/product/edit`,
        updatedProduct,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setEditProduct(null);
        await fetchProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update product');
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const sortedProducts = React.useMemo(() => {
    if (!products.length) return [];

    let filteredProducts = [...products];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.department.toLowerCase().includes(query)
      );
    }

    // Filter by department
    if (selectedDepartment !== 'All') {
      filteredProducts = filteredProducts.filter(item =>
        item.department === selectedDepartment
      );
    }

    // Sort products
    return filteredProducts.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [products, sortConfig, searchQuery, selectedDepartment]);

  useEffect(() => {
    fetchProducts();
  }, []);
  const availableSizes = ["S", "M", "L", "XL", "XXL"];

  const toggleSize = (size) => {
    if (!editProduct) return;

    const currentSizes = Array.isArray(editProduct.sizes) ? [...editProduct.sizes] : [];

    if (currentSizes.includes(size)) {
      // Remove size if already selected
      setEditProduct({
        ...editProduct,
        sizes: currentSizes.filter(s => s !== size)
      });
    } else {
      // Add size if not selected
      setEditProduct({
        ...editProduct,
        sizes: [...currentSizes, size]
      });
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Products Inventory</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              🔍
            </span>
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Edit Form */}
      {editProduct && (
        <div className="mb-6 border border-blue-100 rounded-lg shadow-md bg-blue-50">
          <div className="bg-blue-500 text-white px-6 py-3 rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-bold">Edit Product: {editProduct.name}</h3>
            <button
              onClick={() => setEditProduct(null)}
              className="text-white hover:text-blue-100 transition"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ({currency})</label>
                  <input
                    type="number"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editProduct.stock || 0}
                    onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editProduct.description || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Sizes
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map(size => (
                      <button
                        key={size}  
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                           ${Array.isArray(editProduct.sizes) && editProduct.sizes.includes(size)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center mt-6">
              <button
                onClick={() => setEditProduct(null)}
                className="w-full sm:w-auto mt-3 sm:mt-0 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <div className="flex w-full sm:w-auto gap-3">
                <button
                  onClick={saveEdit}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center justify-center"
                >
                  <span className="mr-2">Save Changes</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => removeProduct(confirmDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Image</th>
              <th
                className="py-3 px-4 text-left font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name {getSortIcon('name')}
              </th>
              <th
                className="py-3 px-4 text-left font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('department')}
              >
                Department {getSortIcon('department')}
              </th>
              <th
                className="py-3 px-4 text-left font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('price')}
              >
                Price {getSortIcon('price')}
              </th>
              <th className="py-3 px-4 text-center font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-16 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <tr key={product._id}>
                  <td className="py-3 px-4">
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4">{product.department}</td>
                  <td className="py-3 px-4">{currency}{product.price}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(product._id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-16 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;