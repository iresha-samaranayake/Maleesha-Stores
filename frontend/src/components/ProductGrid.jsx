import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import { RefreshCw, Inbox } from 'lucide-react';

export default function ProductGrid({ selectedCategory, searchQuery }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      let url = `${apiUrl}/products`;
      const params = {};
      
      if (selectedCategory) {
        params.category_id = selectedCategory;
      }
      
      if (searchQuery) {
        params.q = searchQuery;
      }

      const res = await axios.get(url, { params });
      setProducts(res.data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Check database connection.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4 space-y-4 animate-pulse">
              <div className="aspect-square w-full bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 bg-slate-200 rounded w-1/3" />
                <div className="h-9 w-9 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <div className="text-rose-500 font-medium mb-4">{error}</div>
        <button
          onClick={fetchProducts}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
          <Inbox className="w-12 h-12 stroke-[1.5]" />
          <h3 className="font-semibold text-slate-800 text-lg">No products found</h3>
          <p className="text-sm max-w-sm">
            We couldn't find any products matching your selection. Try a different category or search term.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
