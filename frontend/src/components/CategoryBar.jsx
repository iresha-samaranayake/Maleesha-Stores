import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as Icons from 'lucide-react';

// Dynamic Lucide icon component
const LucideIcon = ({ name, className }) => {
  const IconComponent = Icons[name] || Icons.ShoppingBag;
  return <IconComponent className={className} />;
};

export default function CategoryBar({ selectedCategory, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${apiUrl}/categories`);
        setCategories(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar max-w-screen-2xl mx-auto px-4 sm:px-5 lg:px-6 mt-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center shrink-0 w-20 animate-pulse">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 shadow-sm" />
            <div className="w-12 h-3 bg-slate-200 rounded mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-red-500">
        {error}. Please check if the backend server is running.
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-5 lg:px-6 mt-6">
      <h2 className="text-lg font-bold text-slate-800 mb-3 md:text-xl">
        Shop by Category
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {/* 'All Items' category button */}
        <button
          onClick={() => onSelectCategory(null)}
          className="flex flex-col items-center shrink-0 focus:outline-none"
        >
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition shadow-sm ${
              selectedCategory === null
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-100 scale-105'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Icons.LayoutGrid className="w-7 h-7" />
          </div>
          <span
            className={`text-xs mt-2 font-medium transition ${
              selectedCategory === null ? 'text-emerald-700 font-semibold' : 'text-slate-600'
            }`}
          >
            All Items
          </span>
        </button>

        {/* Dynamic categories fetched from server */}
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => onSelectCategory(cat._id)}
            className="flex flex-col items-center shrink-0 focus:outline-none"
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition shadow-sm ${
                selectedCategory === cat._id
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-100 scale-105'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <LucideIcon name={cat.icon_url} className="w-7 h-7" />
            </div>
            <span
              className={`text-xs mt-2 font-medium max-w-[80px] text-center truncate transition ${
                selectedCategory === cat._id ? 'text-emerald-700 font-semibold' : 'text-slate-600'
              }`}
            >
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
