import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Loader2, Truck, Clock, ShieldCheck, ChevronRight, TrendingUp,
  Menu, Apple, Leaf, Egg, CupSoda, Cookie, Package, Layers, Search,
  Sparkles, Gift, Trash2, Heart, Plus, ShoppingBag, Copy, Check, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductGrid from './ProductGrid';

/* ── Category details helper ─────────────────────────────── */
const getCategoryDetails = (name) => {
  const l = name.toLowerCase();
  if (l.includes('vegetable')) return { icon: Leaf, emoji: '🥬', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  if (l.includes('fruit')) return { icon: Apple, emoji: '🍎', color: 'bg-rose-50 text-rose-600 border-rose-100' };
  if (l.includes('bakery') || l.includes('bread')) return { icon: Cookie, emoji: '🍞', color: 'bg-amber-50 text-amber-700 border-amber-100' };
  if (l.includes('dairy') || l.includes('egg')) return { icon: Egg, emoji: '🥛', color: 'bg-blue-50 text-blue-600 border-blue-100' };
  if (l.includes('beverage') || l.includes('drink') || l.includes('tea') || l.includes('coffee')) return { icon: CupSoda, emoji: '🧃', color: 'bg-purple-50 text-purple-600 border-purple-100' };
  if (l.includes('pantry') || l.includes('staple')) return { icon: Package, emoji: '🥫', color: 'bg-orange-50 text-orange-600 border-orange-100' };
  return { icon: Layers, emoji: '🛒', color: 'bg-slate-50 text-slate-600 border-slate-100' };
};

/* ── Framer Motion variants ───────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

const slides = [
  {
    backgroundClass: 'bg-[#581c3f]', // Plum purple
    badge: 'Order in Minutes, Delivered in Hours',
    title: 'Clean Eating Starts With Clean Shopping',
    description: 'Save time and energy with our easy online store. Browse thousands of items, fill your cart in minutes, and enjoy fast delivery to your home.',
    buttonText: 'Shop Now',
    image: '/assets/Gemini_Generated_Image_x5ra9hx5ra9hx5ra.png'
  },
  {
    backgroundClass: 'bg-[#064e3b]', // Deep Emerald Green
    badge: 'Fresh Foods, Certified Organic Sourced',
    title: 'Need it fresh, fast, and easy? Shop with us',
    description: 'From farm-fresh produce to pantry must-haves—everything you need, delivered straight to your doorstep in pristine condition.',
    buttonText: 'Show Now',
    image: '/assets/jack-lee-IH65r4HEQWQ-unsplash.jpg'
  },
  {
    backgroundClass: 'bg-[#7c2d12]', // Deep Rust/Orange
    badge: 'Artisan & Office Essentials',
    title: 'Sourced Selection & Direct Delivery',
    description: 'Explore our premium handpicked collections of daily essentials, organic spices, and pantry snacks sourced directly from local producers.',
    buttonText: 'Explore Now',
    image: '/assets/Gemini_Generated_Image_yna1pgyna1pgyna1.png'
  }
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addToCart } = useCart();

  const location = useLocation();
  const catalogRef = useRef(null);

  const navigate = useNavigate();

  // Auto swapping banner image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/assets')) return url;
    return `http://localhost:5000${url}`;
  };

  // Data states
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  // Fetch Banners
  useEffect(() => {
    const fetchBanners = async () => {
      setLoadingBanners(true);
      try {
        const res = await axios.get('/api/banners');
        setBanners(res.data);
      } catch (err) {
        console.error('Error fetching banners:', err);
      } finally {
        setLoadingBanners(false);
      }
    };
    fetchBanners();
  }, []);

  const mainBanners = banners.filter(b => b.type === 'Main Carousel');
  const dbSlides = mainBanners.map(b => ({
    image: b.image_url,
    target_link: b.target_link,
    is_db: true
  }));
  const dashboardSlides = [...slides, ...dbSlides];

  useEffect(() => {
    if (dashboardSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % dashboardSlides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [dashboardSlides.length]);

  const activeSlideIndex = currentImageIndex < dashboardSlides.length ? currentImageIndex : 0;

  const handleBannerClick = (targetLink) => {
    if (!targetLink) return;
    if (targetLink === '#upload-bill' || targetLink?.toLowerCase().includes('upload') || targetLink?.toLowerCase().includes('bill')) {
      if (!user) {
        sessionStorage.setItem('intendedAction', JSON.stringify({ type: 'UPLOAD_BILL' }));
        showToast('Please log in to upload your grocery list', 'info');
        navigate('/login');
        return;
      }
    }
    if (targetLink === '#catalog') {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (targetLink.startsWith('http')) {
      window.open(targetLink, '_blank');
    } else {
      navigate(targetLink);
    }
  };

  // Selection/Search states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  // Sync scroll on catalog if navigated with scroll parameter
  useEffect(() => {
    if ((location.search.includes('scroll=catalog') || location.search.includes('tab=shop')) && catalogRef.current) {
      setTimeout(() => {
        catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [location]);

  // Fetch categories
  const fetchCategories = async () => {
    if (!user) return;
    setLoadingCategories(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/categories', config);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/orders/myorders', config);
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load wishlist products
  const fetchWishlistProducts = async () => {
    try {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (savedWishlist.length === 0) {
        setWishlistProducts([]);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/products', config);
      setWishlistProducts(res.data.filter(p => savedWishlist.includes(p._id)));
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchOrders();
    fetchWishlistProducts();
  }, [user]);

  // Handle wishlist updates directly from window changes
  useEffect(() => {
    const handleStorageChange = () => {
      fetchWishlistProducts();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const activeOrder = orders.find(o => ['Pending', 'Processing', 'Out for Delivery'].includes(o.status));
  const getTimelineStep = (s) => ({ Pending: 0, Processing: 1, 'Out for Delivery': 2, Completed: 3 }[s] ?? 0);
  const loyaltyPoints = Math.round(orders.reduce((sum, o) => sum + (o.status === 'Completed' ? o.totalPrice * 0.05 : 0), 0));
  const completedOrders = orders.filter(o => o.status === 'Completed').length;

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    showToast(`Coupon ${code} copied!`, 'success');
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col font-sans bg-[#fbfbfa] pb-16">
      {/* ── Editorial Slider Hero Banner (Full-Width Edge-to-Edge) ── */}
      <div className="relative overflow-hidden w-full min-h-[240px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[390px] shadow-sm flex bg-white">

          <AnimatePresence>
            {dashboardSlides.length > 0 && dashboardSlides[activeSlideIndex] && (
              <motion.div
                key={activeSlideIndex}
                initial={{ x: '100%', opacity: 0.9 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0.9 }}
                transition={{ duration: 1.0, ease: 'easeInOut' }}
                className={`absolute inset-0 p-8 sm:p-12 md:p-16 flex flex-col justify-center text-left bg-cover bg-center ${
                  dashboardSlides[activeSlideIndex]?.target_link ? 'cursor-pointer' : ''
                }`}
                style={{ backgroundImage: `url(${getImageUrl(dashboardSlides[activeSlideIndex]?.image)})` }}
                onClick={() => {
                  if (dashboardSlides[activeSlideIndex]?.target_link) {
                    handleBannerClick(dashboardSlides[activeSlideIndex]?.target_link);
                  }
                }}
              >
                {/* Dark overlay for readability */}
                {!dashboardSlides[activeSlideIndex]?.is_db && (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/35 to-transparent z-0" />
                )}

                {/* Content panel */}
                {!dashboardSlides[activeSlideIndex]?.is_db && (
                  <div className="space-y-6 text-white max-w-xl text-left z-10">

                    {/* Badge */}
                    {dashboardSlides[activeSlideIndex]?.badge && (
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full bg-white/15 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                          ✳ {dashboardSlides[activeSlideIndex].badge}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    {dashboardSlides[activeSlideIndex]?.title && (
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
                        {dashboardSlides[activeSlideIndex].title}
                      </h1>
                    )}

                    {/* Description */}
                    {dashboardSlides[activeSlideIndex]?.description && (
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-md drop-shadow-sm">
                        {dashboardSlides[activeSlideIndex].description}
                      </p>
                    )}

                    {/* Button */}
                    <div className="pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-7 py-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition active:scale-95 cursor-pointer inline-flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        {dashboardSlides[activeSlideIndex]?.buttonText || 'Shop Now'}
                      </button>
                    </div>

                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination Dots at bottom-left */}
          {dashboardSlides.length > 1 && (
            <div className="absolute bottom-6 left-8 sm:left-12 md:left-16 z-20 flex items-center gap-2.5">
              {dashboardSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${activeSlideIndex === idx
                    ? 'w-7 bg-amber-400'
                    : 'w-2.5 bg-white/35 hover:bg-white/50'
                    }`}
                />
              ))}
            </div>
          )}

        </div>

        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1 flex flex-col gap-10">

        {/* ── Circular Categories Selector under Banner ── */}
        <div className="space-y-4">
          <h3 className="text-subhead text-slate-800 text-center font-bold">Popular Departments</h3>

          {loadingCategories ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-caption text-slate-400 font-semibold">Loading departments...</span>
            </div>
          ) : (
            <div className="flex justify-center gap-6 sm:gap-10 overflow-x-auto py-4 no-scrollbar custom-scrollbar">
              {/* All Departments Circle */}
              <button
                onClick={() => { setSelectedCategory(null); }}
                className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
              >
                <div className={`w-16 h-16 rounded-[12px] flex items-center justify-center border transition-all duration-300 overflow-hidden ${selectedCategory === null
                  ? 'bg-slate-50 border-2 border-blue-950 scale-105 shadow-md'
                  : 'bg-white border border-blue-950/20 hover:border-blue-950/60 hover:scale-105 shadow-sm'
                  }`}>
                  <span className="text-2xl select-none">🍏</span>
                </div>
                <span className={`text-[10px] sm:text-[11px] font-bold transition-colors uppercase tracking-wider ${selectedCategory === null ? 'text-slate-855' : 'text-slate-600 group-hover:text-slate-800'}`}>
                  All Items
                </span>
              </button>

              {/* Individual Category Circles */}
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat._id;
                const details = getCategoryDetails(cat.name);
                return (
                  <button
                    key={cat._id}
                    onClick={() => { setSelectedCategory(cat._id); }}
                    className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
                  >
                    <div className={`w-16 h-16 rounded-[12px] flex items-center justify-center border transition-all duration-300 overflow-hidden ${isSelected
                      ? 'bg-slate-50 border-2 border-blue-950 scale-105 shadow-md'
                      : 'bg-white border border-blue-950/20 hover:border-blue-950/60 hover:scale-105 shadow-sm'
                      }`}>
                      {cat.image_url ? (
                        <img
                          src={cat.image_url.startsWith('http') ? cat.image_url : `http://localhost:5000${cat.image_url}`}
                          alt={cat.name}
                          className="w-full h-full object-contain p-1.5 rounded-[12px]"
                        />
                      ) : (
                        <span className="text-2xl select-none">{details.emoji}</span>
                      )}
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-bold transition-colors uppercase tracking-wider ${isSelected ? 'text-slate-855' : 'text-slate-600 group-hover:text-slate-800'}`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Bento Grid Promo Cards (Styling inspired by mockup) ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden" animate="visible"
          className="grid grid-cols-1 gap-6"
        >
          {/* Card 3: Fulfillment / Active Order Promo Card */}
          <motion.div
            variants={itemVariants}
            className="rounded-[24px] p-6 text-slate-800 bg-[#fafbfe] border border-blue-200/60 relative overflow-hidden flex flex-col justify-between min-h-[180px] shadow-sm card-hover-lift"
          >
            <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-blue-100/30 rounded-full blur-xl pointer-events-none" />
            <div className="space-y-1">
              <span className="text-micro bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">
                📦 Fulfillment
              </span>
              <h3 className="text-subhead text-slate-900 pt-1 font-bold">Delivery Status</h3>
              <p className="text-caption text-slate-500 max-w-[200px] leading-relaxed">
                {activeOrder ? `Order #${activeOrder._id.slice(-6).toUpperCase()} is currently ${activeOrder.status.toLowerCase()}.` : 'No active orders in transit. Ready to deliver.'}
              </p>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-caption font-bold text-slate-600">{activeOrder ? activeOrder.status : 'All clear'}</span>
              <Link
                to="/customer/orders"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-caption font-bold transition-smooth cursor-pointer"
              >
                View Bills
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Active Delivery Timeline ────────────────────────── */}
        {activeOrder && (
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[24px] border border-slate-100 p-6 space-y-6 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-micro text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg font-bold">
                  {activeOrder.customerDetails?.pickupType === 'pickup' ? 'Store Pickup Timeline' : 'Delivery Progress Timeline'}
                </span>
                <h3 className="text-body font-bold text-slate-800 mt-1.5">Order: #{activeOrder._id.slice(-6).toUpperCase()}</h3>
              </div>
              <div className="text-right">
                <p className="text-caption text-slate-400">Status</p>
                <p className="text-body font-bold text-emerald-600">{activeOrder.status}</p>
              </div>
            </div>

            <div className="relative pt-6 pb-2">
              <div className="absolute top-[34px] left-8 right-8 h-1 bg-slate-100 rounded-full z-0" />
              <motion.div
                className="absolute top-[34px] left-8 h-1 bg-emerald-500 rounded-full z-0"
                initial={{ width: '0%' }}
                animate={{ width: `${(getTimelineStep(activeOrder.status) / 3) * 100}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              />

              <div className="relative z-10 flex justify-between items-center text-center">
                {(activeOrder.customerDetails?.pickupType === 'pickup'
                  ? [
                      { label: 'Placed', icon: ShoppingBag },
                      { label: 'Processing', icon: Package },
                      { label: 'Ready for Pickup', icon: Truck },
                      { label: 'Collected', icon: Check }
                    ]
                  : [
                      { label: 'Placed', icon: ShoppingBag },
                      { label: 'Packaged', icon: Package },
                      { label: 'Shipped', icon: Truck },
                      { label: 'Arrived', icon: Check }
                    ]
                ).map((step, idx) => {
                  const isActive = getTimelineStep(activeOrder.status) >= idx;
                  const isCurrent = getTimelineStep(activeOrder.status) === idx;
                  const Icon = step.icon;

                  return (
                    <div key={step.label} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCurrent
                        ? 'bg-emerald-600 border-emerald-600 text-white animate-pulse-glow'
                        : isActive
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-caption ${isActive ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Favorite Items Row ──────────────────────────── */}
        {wishlistProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-subhead text-slate-800 flex items-center gap-2 font-bold">
              <Heart className="w-4.5 h-4.5 text-red-500 fill-red-500" />
              Your Favorites
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar custom-scrollbar">
              {wishlistProducts.map((product) => (
                <div key={product._id} className="w-48 bg-white rounded-2xl border border-slate-100 p-3 shrink-0 card-hover-lift shadow-sm relative">
                  <div className="aspect-square bg-slate-50 overflow-hidden rounded-xl">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-xl">🥬</div>
                    )}
                  </div>
                  <div className="mt-2.5 space-y-1">
                    <h4 className="text-caption font-bold text-slate-800 truncate">{product.name}</h4>
                    <p className="text-micro text-slate-400 normal-case tracking-normal font-semibold">{product.unit}</p>
                    <div className="flex justify-between items-center pt-1.5">
                      <span className="text-caption font-extrabold text-emerald-800">Rs. {product.price}</span>
                      <button
                        onClick={() => { addToCart(product); }}
                        className="w-6.5 h-6.5 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-smooth cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Main Catalog Grid ───────────────────────────── */}
        <div ref={catalogRef} className="space-y-6 pt-4 border-t border-slate-200/60">

          {/* Search Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-subhead text-slate-900 font-bold">Explore Our Store</h2>
              <p className="text-caption text-slate-400 mt-0.5">Fresh groceries delivered straight to your home</p>
            </div>
            <div className="w-full sm:w-80 relative">
              <Search className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search fresh groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-body focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-smooth"
              />
            </div>
          </div>

          {/* Catalog grid */}
          <ProductGrid selectedCategory={selectedCategory} searchQuery={searchQuery} />
        </div>

        {/* ── Recent Purchase History ─────────────────────── */}
        <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-body font-bold text-slate-900">Recent Purchase Receipts</h3>
              <p className="text-caption text-slate-400 mt-0.5">Overview of your last completed orders</p>
            </div>
            <Link to="/customer/orders" className="text-caption font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 transition-smooth">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingOrders ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-caption text-slate-400 font-medium">
              No purchase history tracked yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {orders.slice(0, 3).map((order) => (
                <div key={order._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/20 transition-smooth">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 shrink-0">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="w-9 h-9 rounded-xl bg-emerald-50 border-2 border-white flex items-center justify-center text-micro text-emerald-700 font-extrabold overflow-hidden shadow-sm">
                          {item.name?.slice(0, 2)}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border-2 border-white flex items-center justify-center text-micro text-slate-500 font-bold shadow-sm">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-body font-bold text-slate-800">Order #{order._id.slice(-6).toUpperCase()}</span>
                      <p className="text-caption text-slate-400">
                        {order.items.length} items · {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-body font-extrabold text-slate-900">Rs. {order.totalPrice.toLocaleString()}</span>
                    <span className={`text-micro px-2 py-0.5 rounded-lg border ${order.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
