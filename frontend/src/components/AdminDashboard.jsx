import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Key, ShieldAlert, Plus, Edit, Trash2, Check, RefreshCw, 
  Layers, Package, FileText, ArrowLeft, Loader, CheckCircle, 
  MapPin, Phone, User, Eye, EyeOff, FileImage
} from 'lucide-react';
import { io } from 'socket.io-client';
import AdminBillsView from './AdminBillsView';

const COMMON_ICONS = [
  'Apple', 'Leaf', 'Egg', 'Croissant', 'Coffee', 'Package', 
  'Wine', 'Soup', 'Carrot', 'CupSoda', 'IceCream', 'Fish'
];

export default function AdminDashboard({ onBackToShop }) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('orders'); // orders, products, categories, bills
  const [newBillTick, setNewBillTick] = useState(0); // For triggering refetch on socket event

  
  // Data States
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal / Form States
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon_url: 'Package' });
  
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    unit: 'kg',
    category_id: '',
    stock: '',
    image_url: ''
  });

  // Search States
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Handle Authentication (Simulated Passcode)
  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === '1234') { // Default store manager passcode
      setIsAuthenticated(true);
      setAuthError(null);
      fetchData();
    } else {
      setAuthError('Invalid Admin Passcode. Try again.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes, ordRes] = await Promise.all([
        axios.get(`${apiUrl}/categories`),
        axios.get(`${apiUrl}/products`),
        axios.get(`${apiUrl}/orders`)
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setOrders(ordRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      
      const socket = io('http://localhost:5000');
      socket.on('new-bill', (bill) => {
        // Trigger a re-render/refetch in AdminBillsView
        setNewBillTick(prev => prev + 1);
        
        // Show notification (simple alert or console for now)
        alert(`New bill uploaded by ${bill.customerName}!`);
      });

      return () => socket.disconnect();
    }
  }, [isAuthenticated]);

  // Category Actions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiUrl}/categories`, newCategory);
      setCategories([...categories, res.data]);
      setNewCategory({ name: '', icon_url: 'Package' });
      setShowCategoryForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? It may affect products in this category.')) return;
    try {
      await axios.delete(`${apiUrl}/categories/${id}`);
      setCategories(categories.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting category');
    }
  };

  // Product Actions
  const handleOpenAddProduct = (categoryId = null) => {
    setEditingProduct(null);
    setNewProduct({
      name: '',
      price: '',
      unit: 'kg',
      category_id: categoryId || categories[0]?._id || '',
      stock: '',
      image_url: ''
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
      image_url: prod.image_url || ''
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Edit Mode
        const res = await axios.put(`${apiUrl}/products/${editingProduct}`, newProduct);
        setProducts(products.map(p => p._id === editingProduct ? res.data : p));
      } else {
        // Add Mode
        const res = await axios.post(`${apiUrl}/products`, newProduct);
        setProducts([res.data, ...products]);
      }
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${apiUrl}/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product');
    }
  };

  // Filter functions
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category_id?.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Order Actions
  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const res = await axios.put(`${apiUrl}/orders/${id}/status`, { status });
      setOrders(orders.map(o => o._id === id ? res.data : o));
    } catch (err) {
      alert('Error updating order status');
    }
  };

  if (!isAuthenticated) {
    /* Login Screen */
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6 text-center">
          <div className="mx-auto w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-md">
            <Key className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Admin Authentication</h2>
            <p className="text-xs text-slate-400 mt-1">
              Access is restricted to Maleesha Stores managers. Enter default passcode.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-semibold">
                {authError}
              </div>
            )}
            <input
              type="password"
              placeholder="Enter Store Passcode (1234)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-center font-bold tracking-widest text-lg"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBackToShop}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition text-sm"
              >
                Back to Shop
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition text-sm"
              >
                Enter Panel
              </button>
            </div>
          </form>
          <div className="text-[10px] text-slate-400 font-medium">
            💡 Hint: The default manager code is <span className="font-bold text-emerald-600">1234</span>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Title / Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 block">
            Store Admin Dashboard
          </h1>
          <span className="text-xs text-slate-400 block mt-0.5">
            Manage your grocery store inventory,categories,and client orders.
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition text-slate-500 hover:text-slate-800"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onBackToShop}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4.5 h-4.5" />
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'products'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Package className="w-4.5 h-4.5" />
          Inventory ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'categories'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4.5 h-4.5" />
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'bills'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileImage className="w-4.5 h-4.5" />
          Uploaded Bills
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader className="w-10 h-10 animate-spin text-emerald-600" />
          <span>Loading dynamic dashboard info...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: ORDERS BOARD */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-slate-400 border rounded-2xl bg-white border-slate-100">
                  No orders registered yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {orders.map((order) => (
                    <div 
                      key={order._id}
                      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6"
                    >
                      <div className="flex-1 space-y-4">
                        {/* Title details */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-bold text-slate-900 text-base">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            order.customerDetails?.pickupType === 'pickup' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>
                            {order.customerDetails?.pickupType === 'pickup' ? 'Pickup' : 'Delivery'}
                          </span>
                        </div>

                        {/* Customer details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-slate-800">{order.customerDetails?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{order.customerDetails?.phone}</span>
                          </div>
                          {order.customerDetails?.pickupType === 'delivery' && (
                            <div className="flex items-start gap-2 md:col-span-2">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <span className="text-xs leading-normal">{order.customerDetails?.deliveryAddress}</span>
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm text-slate-700">
                                <span>{item.name} <span className="text-xs text-slate-400 font-medium">(x{item.quantity} {item.unit})</span></span>
                                <span className="font-medium text-slate-900">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Status / Fulfilling Controls */}
                      <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 flex flex-col justify-between items-stretch">
                        <div className="mb-4">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Order Value</span>
                          <span className="text-2xl font-black text-emerald-800">
                            Rs. {order.totalPrice.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Update Status</label>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="Pending">Pending Validation</option>
                            <option value="Processing">Processing / Packaged</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Completed">Completed / Dispatched</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVENTORY TABLE */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="🔍 Search products by name or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Product Details</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock Level</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((prod) => (
                          <tr key={prod._id} className="hover:bg-slate-50/50 transition">
                            <td className="p-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                                {prod.image_url ? (
                                  <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">Store</div>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block leading-tight">{prod.name}</span>
                                <span className="text-xs text-slate-400">Unit: Per {prod.unit}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                                {prod.category_id?.name || 'Unassigned'}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-slate-800">
                              Rs. {prod.price.toLocaleString()}
                            </td>
                            <td className="p-4">
                              {prod.stock === 0 ? (
                                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Out of Stock</span>
                              ) : prod.stock <= 5 ? (
                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Low Stock ({prod.stock})</span>
                              ) : (
                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">In Stock ({prod.stock})</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center items-center gap-2">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
                                  title="Edit Product"
                                >
                                  <Edit className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod._id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400 text-sm">
                            No products found matching "{productSearch}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES LIST */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="🔍 Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              {showCategoryForm && (
                <form onSubmit={handleAddCategory} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 max-w-md space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">Add Dynamic Grocery Category</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category Name *</label>
                      <input
                        type="text"
                        required
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="e.g. Baby Food, Fresh Vegetables"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Visual Icon *</label>
                      <select
                        value={newCategory.icon_url}
                        onChange={(e) => setNewCategory({ ...newCategory, icon_url: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                      >
                        {COMMON_ICONS.map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                    >
                      Save Section
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryForm(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <div 
                      key={cat._id}
                      className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{cat.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Icon: {cat.icon_url}</p>
                        <p className="text-[11px] text-slate-500 mt-2">
                          {products.filter(p => p.category_id?._id === cat._id || p.category_id === cat._id).length} items
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleOpenAddProduct(cat._id)}
                          className="flex-1 px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                          title="Add item to this category"
                        >
                          <Plus className="w-3.5 h-3.5 inline mr-1" />
                          Add Item
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-400">
                    No categories found matching "{categorySearch}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: UPLOADED BILLS */}
          {activeTab === 'bills' && (
            <AdminBillsView newBills={newBillTick} />
          )}
        </>
      )}

      {/* PRODUCT FORM DIALOG MODAL */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-slate-950 mb-4">
              {editingProduct ? 'Edit Grocery Item' : 'Add New Grocery Item'}
            </h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Fresh Red Onions"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Price (Rs) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    placeholder="e.g. 250"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Unit Type *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    placeholder="e.g. kg, pack, unit"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assign Category *</label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white"
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Stock *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Product Image Link</label>
                <input
                  type="url"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  placeholder="Paste direct unsplash image url here"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
                >
                  Save Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
