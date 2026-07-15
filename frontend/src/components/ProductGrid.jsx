import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import { RefreshCw, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function ProductGrid({ selectedCategory, searchQuery, isGridView }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const productScrollRef = useRef(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('userInfo');
      const token = storedUser ? JSON.parse(storedUser).token : '';
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const params = {};
      if (selectedCategory) {
        params.category_id = selectedCategory;
      }
      if (searchQuery) {
        params.q = searchQuery;
      }

      const res = await axios.get('/api/products', { params, headers });
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
      <div className="w-full py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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

  const slideLeft = () => {
    if (productScrollRef.current) {
      const firstChild = productScrollRef.current.firstElementChild;
      if (firstChild) {
        productScrollRef.current.scrollBy({ left: -(firstChild.offsetWidth + 12), behavior: 'smooth' });
      }
    }
  };

  const slideRight = () => {
    if (productScrollRef.current) {
      const firstChild = productScrollRef.current.firstElementChild;
      if (firstChild) {
        productScrollRef.current.scrollBy({ left: firstChild.offsetWidth + 12, behavior: 'smooth' });
      }
    }
  };

  if (!isGridView) {
    return (
      <div className="relative w-full py-4 px-10 select-none">
        {/* Left Navigation Arrow */}
        <button
          onClick={slideLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow border border-slate-200 transition z-10 cursor-pointer"
          aria-label="Previous products"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Navigation Arrow */}
        <button
          onClick={slideRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow border border-slate-200 transition z-10 cursor-pointer"
          aria-label="Next products"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Container */}
        <motion.div
          ref={productScrollRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-row gap-3 overflow-x-auto no-scrollbar scroll-smooth w-full pt-5 pb-5 px-4 -mx-4 flex-nowrap"
        >
          {products.map((product) => (
            <motion.div
              key={product._id}
              variants={itemVariants}
              className="flex-shrink-0 w-full sm:w-[calc((100%-12px)/2)] md:w-[calc((100%-24px)/3)] lg:w-[calc((100%-36px)/4)] xl:w-[calc((100%-48px)/5)] flex justify-center"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
      >
        {products.map((product) => (
          <motion.div key={product._id} variants={itemVariants}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
