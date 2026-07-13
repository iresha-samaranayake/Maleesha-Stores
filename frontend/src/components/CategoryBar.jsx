import React, { useEffect, useState } from 'react';
import axios from 'axios';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `http://localhost:5000${url}`;
};

export default function CategoryBar({ selectedCategory, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const storedUser = localStorage.getItem('userInfo');
        const token = storedUser ? JSON.parse(storedUser).token : '';
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await axios.get('/api/categories', { headers });
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
            <div className="w-16 h-16 rounded-[12px] bg-slate-200 shadow-sm" />
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
          className="flex flex-col items-center gap-2 shrink-0 focus:outline-none group"
        >
          <div
            className={`w-16 h-16 rounded-[12px] flex items-center justify-center border transition-all duration-300 overflow-hidden ${
              selectedCategory === null
                ? 'bg-slate-50 border-2 border-blue-950 scale-105 shadow-md'
                : 'bg-white border border-blue-950/20 hover:border-blue-950/60 hover:scale-105 shadow-sm'
            }`}
          >
            <span className="text-2xl select-none">🍏</span>
          </div>
          <span
            className={`text-[10px] sm:text-[11px] font-bold transition-colors uppercase tracking-wider ${
              selectedCategory === null ? 'text-slate-855' : 'text-slate-600 group-hover:text-slate-800'
            }`}
          >
            All Items
          </span>
        </button>

        {/* Dynamic categories fetched from server */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat._id;
          return (
            <button
              key={cat._id}
              onClick={() => onSelectCategory(cat._id)}
              className="flex flex-col items-center gap-2 shrink-0 focus:outline-none group"
            >
              <div
                className={`w-16 h-16 rounded-[12px] flex items-center justify-center border transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? 'bg-slate-50 border-2 border-blue-950 scale-105 shadow-md'
                    : 'bg-white border border-blue-950/20 hover:border-blue-950/60 hover:scale-105 shadow-sm'
                }`}
              >
                {cat.image_url ? (
                  <img
                    src={getImageUrl(cat.image_url)}
                    alt={cat.name}
                    className="w-full h-full object-contain p-1.5 rounded-[12px]"
                  />
                ) : (
                  <span className="text-2xl select-none">📦</span>
                )}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-bold transition-colors uppercase tracking-wider ${
                  isSelected ? 'text-slate-855' : 'text-slate-600 group-hover:text-slate-800'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
