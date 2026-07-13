import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, Edit, Trash2, X, Loader2, Package } from 'lucide-react';
import axios from 'axios';

export default function AdminProducts() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal / Form States
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    unit: 'kg',
    category_id: '',
    stock: '',
    image_url: '',
    discountPercentage: 0
  });

  // Search/Filter States
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [prodRes, catRes] = await Promise.all([
        axios.get('/api/products', config),
        axios.get('/api/categories', config)
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('Error loading inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProductsAndCategories();
    }
  }, [user]);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setNewProduct({
      name: '',
      price: '',
      unit: 'kg',
      category_id: categories[0]?._id || '',
      stock: '',
      image_url: '',
      discountPercentage: 0
    });
    setShowProductForm(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod._id);
    setNewProduct({
      name: prod.name,
      price: prod.price,
      unit: prod.unit,
      category_id: prod.category_id?._id || prod.category_id || '',
      stock: prod.stock,
      image_url: prod.image_url || '',
      discountPercentage: prod.discountPercentage || 0
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category_id) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (editingProduct) {
        // Edit Mode
        const res = await axios.put(`/api/products/${editingProduct}`, newProduct, config);
        setProducts(products.map(p => p._id === editingProduct ? res.data : p));
        showToast('Product updated successfully', 'success');
      } else {
        // Add Mode
        const res = await axios.post('/api/products', newProduct, config);
        setProducts([res.data, ...products]);
        showToast('Product created successfully', 'success');
      }
      setShowProductForm(false);
    } catch (err) {
      console.error('Error saving product:', err);
      showToast(err.response?.data?.message || 'Error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/products/${id}`, config);
      setProducts(products.filter(p => p._id !== id));
      showToast('Product deleted from inventory', 'info');
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast('Error removing product', 'error');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300">
      
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="🔍 Search items by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          />
        </div>
        <button
          onClick={handleOpenAddProduct}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-md shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Fetching inventory list...</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-50/30 transition">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          {prod.image_url ? (
                            <img
                              src={prod.image_url.startsWith('http') ? prod.image_url : `http://localhost:5000${prod.image_url}`}
                              alt={prod.name}
                              className="w-10 h-10 object-contain rounded-lg border border-slate-100 shrink-0 bg-slate-50 p-0.5"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                              {prod.name?.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800">{prod.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Unit: {prod.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-semibold text-slate-650">
                          {prod.category_id?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        Rs. {prod.price}
                      </td>
                      <td className="p-4">
                        {prod.discountPercentage > 0 ? (
                          <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-full text-xs font-bold">
                            {prod.discountPercentage}% OFF
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${prod.stock > 10 ? 'bg-emerald-500' : prod.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                          <span className="font-semibold text-slate-700">{prod.stock}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod._id)}
                            className="p-2 border border-slate-200 hover:border-red-200 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400 font-medium">
                      <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      No products match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog Form */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Grocery Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowProductForm(false)}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Red Apples"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="250"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Unit</label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="kg">Per kg</option>
                    <option value="pack">Per Pack</option>
                    <option value="bottle">Per Bottle</option>
                    <option value="bundle">Per Bundle</option>
                    <option value="item">Per Item</option>
                    <option value="100g">Per 100g</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
                  <select
                    required
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Stock Level</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newProduct.discountPercentage}
                    onChange={(e) => setNewProduct({ ...newProduct, discountPercentage: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Image URL (Optional)</label>
                <input
                  type="text"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  placeholder="e.g. /uploads/products/apples.png"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl active:scale-95 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl active:scale-95 transition shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
