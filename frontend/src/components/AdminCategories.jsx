import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, X, Loader2, Layers } from 'lucide-react';

const COMMON_ICONS = [
  'Apple', 'Leaf', 'Egg', 'Croissant', 'Coffee', 'Package', 
  'Wine', 'Soup', 'Carrot', 'CupSoda', 'IceCream', 'Fish'
];

export default function AdminCategories() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon_url: 'Package' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/categories', config);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      showToast('Error loading categories data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name) {
      showToast('Please enter category name', 'error');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post('/api/categories', newCategory, config);
      setCategories([...categories, res.data]);
      setNewCategory({ name: '', icon_url: 'Package' });
      setShowCategoryForm(false);
      showToast('Category created successfully', 'success');
    } catch (err) {
      console.error('Error creating category:', err);
      showToast(err.response?.data?.message || 'Error adding category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This might affect products in this category.')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/categories/${id}`, config);
      setCategories(categories.filter(c => c._id !== id));
      showToast('Category deleted successfully', 'info');
    } catch (err) {
      console.error('Error deleting category:', err);
      showToast(err.response?.data?.message || 'Error deleting category', 'error');
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300">
      
      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="🔍 Search categories by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          />
        </div>
        <button
          onClick={() => setShowCategoryForm(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-md shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Fetching category listing...</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Category Details</th>
                  <th className="p-4">Slug Identifier</th>
                  <th className="p-4">Icon Badge</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/30 transition">
                      
                      {/* Category details */}
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center uppercase shrink-0 border border-emerald-100 text-sm">
                          {item.name?.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">ID: {item._id}</p>
                        </div>
                      </td>
                      
                      {/* Slug */}
                      <td className="p-4 font-mono text-xs text-slate-500">
                        {item.slug || item.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                      </td>
                      
                      {/* Icon */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
                          {item.icon_url || 'Package'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center pr-6">
                        <button
                          onClick={() => handleDeleteCategory(item._id)}
                          className="p-2 border border-slate-200 hover:border-red-200 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-slate-400 font-medium">
                      <Layers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      No categories match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog Form */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Category</h3>
              <button
                onClick={() => setShowCategoryForm(false)}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g. Fresh Produce"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Category Icon Identifier</label>
                <select
                  value={newCategory.icon_url}
                  onChange={(e) => setNewCategory({ ...newCategory, icon_url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {COMMON_ICONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl active:scale-95 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl active:scale-95 transition shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
