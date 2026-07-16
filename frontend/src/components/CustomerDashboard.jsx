import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Loader2, Truck, Clock, ShieldCheck, ChevronLeft, ChevronRight, TrendingUp,
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

const defaultSmallBanners = [
  {
    image_url: null,
    title: 'Celebrate World Chocolate Day',
    description: 'Get 25% Discount on premium chocolates and sweet treats.',
    badge: '🍫 25% OFF',
    buttonText: 'Shop Chocolates',
    target_link: '#catalog',
    gradient: 'linear-gradient(135deg, #7c2d12 0%, #451a03 100%)',
    textColor: 'text-white'
  },
  {
    image_url: null,
    title: 'Clean & Fresh Essentials',
    description: 'Up to 30% Off on selected personal care and household items.',
    badge: '🧴 UP TO 30% OFF',
    buttonText: 'Shop Unilever',
    target_link: '#catalog',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
    textColor: 'text-white'
  },
  {
    image_url: null,
    title: 'Good Knight Mosquito Protection',
    description: '30% Off on active defense vaporizers and insect sprays.',
    badge: '🦟 30% OFF',
    buttonText: 'Shop Defense',
    target_link: '#catalog',
    gradient: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
    textColor: 'text-white'
  },
  {
    image_url: null,
    title: 'Super Absorbent Core Venus',
    description: 'Special discounts on Venus baby care and wellness lines.',
    badge: '👶 BABY CARE SALE',
    buttonText: 'Browse Venus',
    target_link: '#catalog',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
    textColor: 'text-white'
  }
];


export default function CustomerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addToCart } = useCart();

  const location = useLocation();
  const catalogRef = useRef(null);
  const categoryScrollRef = useRef(null);

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
  const searchParams = new URLSearchParams(location.search);
  const selectedCategory = searchParams.get('category') || null;
  const urlSearchQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [isGridView, setIsGridView] = useState(false);

  // Small Promo Banners state & refs
  const smallTrackRef = useRef(null);
  const [smallBannerIndex, setSmallBannerIndex] = useState(0);
  const wishlistRef = useRef(null);

  // Sync searchQuery state with URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('q') || '');
  }, [location.search]);

  // Sync scroll on catalog if navigated with scroll parameter or category/search changed
  useEffect(() => {
    if (selectedCategory || searchQuery || location.search.includes('scroll=catalog') || location.search.includes('tab=shop')) {
      setTimeout(() => {
        catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [selectedCategory, location.search]);

  // Scroll to catalog if tab=wishlist is active (since favorites are displayed in catalog)
  useEffect(() => {
    if (location.search.includes('tab=wishlist') && catalogRef.current) {
      setTimeout(() => {
        catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [location.search]);

  // Handle local category changes
  const handleCategoryClick = (catId) => {
    const params = new URLSearchParams(location.search);
    if (catId) {
      params.set('category', catId);
    } else {
      params.delete('category');
    }
    navigate(`/customer/dashboard?${params.toString()}`);
  };

  // Handle search changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const params = new URLSearchParams(location.search);
    if (value.trim()) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    navigate(`/customer/dashboard?${params.toString()}`, { replace: true });
  };

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

  useEffect(() => {
    const handleStorage = () => {
      fetchWishlistProducts();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user]);

  // Filter and configure small promotional banners
  const smallBanners = banners.filter(b => b.type === 'Small Promo');
  const displaySmallBanners = smallBanners.length > 0 ? smallBanners : defaultSmallBanners;
  const smallBannersLoop = [...displaySmallBanners, ...displaySmallBanners];

  // Auto swapping small promo banners — one card at a time, every 3 seconds
  useEffect(() => {
    if (displaySmallBanners.length === 0) return;
    const timer = setInterval(() => {
      setSmallBannerIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, [displaySmallBanners.length]);

  // Snap small banners back when reaching the duplicate set
  useEffect(() => {
    if (smallBannerIndex >= displaySmallBanners.length) {
      const timeout = setTimeout(() => {
        if (smallTrackRef.current) {
          smallTrackRef.current.style.transition = 'none';
        }
        setSmallBannerIndex(smallBannerIndex - displaySmallBanners.length);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (smallTrackRef.current) {
              smallTrackRef.current.style.transition = '';
            }
          });
        });
      }, 550);
      return () => clearTimeout(timeout);
    }
  }, [smallBannerIndex, displaySmallBanners.length]);

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

      {/* ── Secondary Promotional Banners (Full-Width) ── */}
      {displaySmallBanners.length > 0 && (() => {
        const total = smallBannersLoop.length;
        const trackWidthPct = (total / 3) * 100; // 3 visible cards instead of 4 to make them larger
        const cardWidthPct = 100 / total;
        const shiftPct = smallBannerIndex * cardWidthPct;
        return (
          <div className="relative w-full py-4 bg-white border-b border-slate-100 overflow-hidden">
            {/* Left Arrow */}
            <button
              onClick={() => setSmallBannerIndex((prev) => (prev <= 0 ? displaySmallBanners.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center border border-slate-200 shadow-md cursor-pointer z-10 transition hover:scale-105 active:scale-95"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => setSmallBannerIndex((prev) => prev + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center border border-slate-200 shadow-md cursor-pointer z-10 transition hover:scale-105 active:scale-95"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Sliding Track */}
            <div className="overflow-hidden mx-16">
              <div
                ref={smallTrackRef}
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  width: `${trackWidthPct}%`,
                  transform: `translateX(-${shiftPct}%)`,
                }}
              >
                {smallBannersLoop.map((banner, index) => {
                  const hasImage = !!banner.image_url;
                  return (
                    <div
                      key={`sb-${index}`}
                      className="px-3 flex-shrink-0"
                      style={{ width: `${cardWidthPct}%` }}
                    >
                      <div
                        onClick={() => handleBannerClick(banner.target_link)}
                        className="rounded-2xl overflow-hidden relative aspect-[16/8.5] w-full shadow-md border border-slate-200/50 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                        style={{
                          background: hasImage
                            ? 'none'
                            : (banner.gradient || 'linear-gradient(135deg, #10b981 0%, #059669 100%)'),
                        }}
                      >
                        {hasImage && (
                          <img
                            src={getImageUrl(banner.image_url)}
                            alt="Promo Banner"
                            className="absolute inset-0 w-full h-full object-fill group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        {!hasImage && (
                          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                            <div className="space-y-2 text-left">
                              <span className="text-[10px] bg-white/20 border border-white/10 text-white px-2.5 py-0.5 rounded font-black uppercase tracking-wider">
                                {banner.badge || 'PROMO'}
                              </span>
                              <h4 className="text-sm sm:text-base font-black text-white pt-1 leading-snug drop-shadow-sm line-clamp-1">
                                {banner.title}
                              </h4>
                              <p className="text-[11px] text-white/80 leading-normal line-clamp-2 font-medium">
                                {banner.description}
                              </p>
                            </div>
                            <span className="text-[11px] font-black text-white group-hover:underline flex items-center gap-1.5">
                              {banner.buttonText || 'Shop Now'} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1 flex flex-col gap-10">

        {/* ── Category Section (Slider Carousel) ── */}
        <div className="space-y-6">
          {/* Centered Dark Banner for Category Section Header */}
          <div className="w-full bg-slate-900 rounded-2xl py-4 px-4 text-center shadow-md relative overflow-hidden">
            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
              Shop by Category
            </h3>
          </div>

          {loadingCategories ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-xs text-slate-400 font-bold">Loading shelves...</span>
            </div>
          ) : (
            <div className="relative w-full px-10">
              {/* Left Navigation Arrow */}
              <button
                onClick={() => categoryScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow border border-slate-200 transition z-10 cursor-pointer"
                aria-label="Previous categories"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right Navigation Arrow */}
              <button
                onClick={() => categoryScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow border border-slate-200 transition z-10 cursor-pointer"
                aria-label="Next categories"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Category Carousel Slider Track */}
              <div
                ref={categoryScrollRef}
                className="flex flex-row gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 w-full flex-nowrap"
              >
                {/* All Categories Item */}
                <button
                  onClick={() => { handleCategoryClick(null); }}
                  className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0 bg-transparent border-none outline-none"
                >
                  <div className={`w-[110px] h-[110px] rounded-[18px] flex items-center justify-center border transition-all duration-300 overflow-hidden ${selectedCategory === null
                    ? 'bg-slate-50 border-2 border-slate-900 scale-105 shadow-md'
                    : 'bg-white border border-slate-200 hover:border-slate-400 hover:scale-105 shadow-sm'
                    }`}>
                    <span className="text-5xl select-none">🍏</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-655 group-hover:text-slate-850 text-center leading-snug uppercase tracking-wide">
                    All Items
                  </span>
                </button>

                {/* Individual Category Items */}
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat._id;
                  const details = getCategoryDetails(cat.name);
                  return (
                    <button
                      key={cat._id}
                      onClick={() => { handleCategoryClick(cat._id); }}
                      className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0 bg-transparent border-none outline-none"
                    >
                      <div className={`w-[110px] h-[110px] rounded-[18px] flex items-center justify-center border transition-all duration-300 overflow-hidden ${isSelected
                        ? 'bg-slate-50 border-2 border-slate-900 scale-105 shadow-md'
                        : 'bg-white border border-slate-200 hover:border-slate-400 hover:scale-105 shadow-sm'
                        }`}>
                        {cat.image_url ? (
                          <img
                            src={cat.image_url.startsWith('http') ? cat.image_url : `http://localhost:5000${cat.image_url}`}
                            alt={cat.name}
                            className="w-full h-full object-contain p-1.5 rounded-[12px]"
                          />
                        ) : (
                          <span className="text-5xl select-none">{details.emoji}</span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-655 group-hover:text-slate-850 text-center leading-snug uppercase tracking-wide">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Bento Grid Promo Cards (Styling inspired by mockup) ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden" animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Card 1: Fulfillment / Active Order Promo Card */}
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

          {/* Card 2: Recent Purchase Receipts */}
          <motion.div
            variants={itemVariants}
            className="rounded-[24px] text-slate-800 bg-white border border-slate-150 flex flex-col justify-between min-h-[180px] shadow-sm card-hover-lift overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#fafbfe]">
              <div>
                <h3 className="text-body font-bold text-slate-900">Recent Purchase Receipts</h3>
                <p className="text-micro text-slate-400 mt-0.5">Overview of your last completed orders</p>
              </div>
              <Link to="/customer/orders" className="text-caption font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 transition-smooth">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar max-h-[120px]">
              {loadingOrders ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                </div>
              ) : orders.length === 0 ? (
                <div className="p-6 text-center text-caption text-slate-400 font-medium">
                  No purchase history tracked yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {orders.slice(0, 2).map((order) => (
                    <div key={order._id} className="p-3 flex justify-between items-center gap-2 hover:bg-slate-50/20 transition-smooth">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex -space-x-1.5 shrink-0">
                          {order.items.slice(0, 2).map((item, i) => (
                            <div key={i} className="w-7 h-7 rounded-lg bg-emerald-50 border border-white flex items-center justify-center text-[8px] text-emerald-700 font-extrabold overflow-hidden shadow-xs">
                              {item.name?.slice(0, 2)}
                            </div>
                          ))}
                        </div>
                        <div className="min-w-0 leading-none">
                          <span className="text-caption font-bold text-slate-800 block truncate">Order #{order._id.slice(-6).toUpperCase()}</span>
                          <span className="text-[10px] text-slate-450 mt-0.5 block">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-caption font-extrabold text-slate-900">Rs. {order.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

        {/* ── Main Catalog Grid ───────────────────────────── */}
        <div ref={catalogRef} className="space-y-6 pt-4 border-t border-slate-200/60">

          {/* Distinct Product Section Banner */}
          <div className="w-full bg-[#064e3b] rounded-2xl py-6 px-4 text-center shadow-md relative overflow-hidden">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider relative z-10">
              {location.search.includes('tab=wishlist')
                ? 'Your Favorites'
                : selectedCategory
                  ? categories.find(c => c._id === selectedCategory)?.name || 'Category Products'
                  : searchQuery
                    ? `Search: "${searchQuery}"`
                    : 'All Products'}
            </h2>
          </div>

          {/* Controls Row (View More and Clear Filters) */}
          <div className="flex justify-between items-center gap-4 py-2 px-1">
            <div>
              {/* Clear filters trigger if active */}
              {(selectedCategory || searchQuery || location.search.includes('tab=wishlist')) && (
                <button
                  onClick={() => navigate('/customer/dashboard')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold border border-emerald-200 hover:border-emerald-300 px-3.5 py-1.5 rounded-xl bg-emerald-50/50 transition cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Green View More Button positioned on the right */}
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition duration-150 active:scale-95 cursor-pointer shadow-sm"
            >
              {isGridView ? 'View Slider' : 'View More'}
            </button>
          </div>

          {/* Catalog grid */}
          <ProductGrid selectedCategory={selectedCategory} searchQuery={searchQuery} isGridView={isGridView} showFavoritesOnly={location.search.includes('tab=wishlist')} />
        </div>
      </div>
    </div>
  );
}
