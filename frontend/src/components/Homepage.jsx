import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, ShoppingBag, Leaf, Apple, Cookie, Egg, CupSoda, Package, Layers,
  ChevronRight, ChevronLeft, Sparkles, Gift, Heart, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ProductGrid from './ProductGrid';

/* ── Category details helper ─────────────────────────────── */
const getCategoryDetails = (name) => {
  const l = name.toLowerCase();
  if (l.includes('vegetable')) return { icon: Leaf, emoji: '🥬', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  if (l.includes('fruit')) return { icon: Apple, emoji: '🍎', color: 'bg-rose-50 text-rose-600 border-rose-100' };
  if (l.includes('bakery') || l.includes('bread') || l.includes('croissant')) return { icon: Cookie, emoji: '🍞', color: 'bg-amber-50 text-amber-700 border-amber-100' };
  if (l.includes('dairy') || l.includes('egg') || l.includes('milk')) return { icon: Egg, emoji: '🥛', color: 'bg-blue-50 text-blue-600 border-blue-100' };
  if (l.includes('beverage') || l.includes('drink') || l.includes('tea') || l.includes('coffee')) return { icon: CupSoda, emoji: '🧃', color: 'bg-purple-50 text-purple-600 border-purple-100' };
  if (l.includes('pantry') || l.includes('staple') || l.includes('food')) return { icon: Package, emoji: '🥫', color: 'bg-orange-50 text-orange-600 border-orange-100' };
  return { icon: Layers, emoji: '🛒', color: 'bg-slate-50 text-slate-600 border-slate-100' };
};

/* ── Default Carousel Slides Fallback ────────────────────── */
const defaultCarouselSlides = [
  {
    image_url: '/assets/Gemini_Generated_Image_x5ra9hx5ra9hx5ra.png',
    badge: 'Order in Minutes, Delivered in Hours',
    title: 'Clean Eating Starts With Clean Shopping',
    description: 'Save time and energy with our easy online store. Browse thousands of items, fill your cart in minutes, and enjoy fast delivery to your home.',
    buttonText: 'Shop Now',
    target_link: '#catalog',
    is_fallback: true
  },
  {
    image_url: '/assets/jack-lee-IH65r4HEQWQ-unsplash.jpg',
    badge: 'Fresh Foods, Certified Organic Sourced',
    title: 'Need it fresh, fast, and easy? Shop with us',
    description: 'From farm-fresh produce to pantry must-haves—everything you need, delivered straight to your doorstep in pristine condition.',
    buttonText: 'Shop Now',
    target_link: '#catalog',
    is_fallback: true
  },
  {
    image_url: '/assets/Gemini_Generated_Image_yna1pgyna1pgyna1.png',
    badge: 'Artisan & Office Essentials',
    title: 'Sourced Selection & Direct Delivery',
    description: 'Explore our premium handpicked collections of daily essentials, organic spices, and pantry snacks sourced directly from local producers.',
    buttonText: 'Explore Now',
    target_link: '#catalog',
    is_fallback: true
  }
];

/* ── Default Small Promo Banners Fallback ────────────────── */
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

export default function Homepage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const catalogRef = useRef(null);
  const smallTrackRef = useRef(null);
  const categoryScrollRef = useRef(null);
  const [isGridView, setIsGridView] = useState(false);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/assets')) return url;
    return `http://localhost:5000${url}`;
  };

  // States
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Parse URL search params
  const searchParams = new URLSearchParams(location.search);
  const selectedCategory = searchParams.get('category') || null;
  const searchQuery = searchParams.get('q') || '';

  // Scroll to catalog when category/search triggers or catalog hash present
  useEffect(() => {
    if (selectedCategory || searchQuery || location.hash === '#catalog') {
      setTimeout(() => {
        catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [selectedCategory, searchQuery, location.hash]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

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

  // Filter banners by type
  const mainBanners = banners.filter(b => b.type === 'Main Carousel');
  const smallBanners = banners.filter(b => b.type === 'Small Promo');

  const dbSlides = mainBanners.map(b => ({
    image: b.image_url,
    target_link: b.target_link,
    is_db: true
  }));
  const staticSlides = defaultCarouselSlides.map(s => ({
    image: s.image_url,
    target_link: s.target_link,
    badge: s.badge,
    title: s.title,
    description: s.description,
    buttonText: s.buttonText,
    is_fallback: s.is_fallback
  }));
  const homepageSlides = [...dbSlides, ...staticSlides];
  const activeSlideIndex = currentSlideIndex < homepageSlides.length ? currentSlideIndex : 0;

  const displaySmallBanners = smallBanners.length > 0 ? smallBanners : defaultSmallBanners;

  const [smallBannerIndex, setSmallBannerIndex] = useState(0);

  // Duplicated arrays for infinite looping
  const smallBannersLoop = [...displaySmallBanners, ...displaySmallBanners];

  // Auto swapping main carousel — slide left every 10s
  useEffect(() => {
    if (homepageSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % homepageSlides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [homepageSlides.length]);

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

  const handleCategoryClick = (catId) => {
    const params = new URLSearchParams(location.search);
    if (catId) {
      params.set('category', catId);
    } else {
      params.delete('category');
    }
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="flex-1 flex flex-col font-sans bg-[#f6f6f6] pb-16">
      {/* ── Editorial Slider Hero Banner (Full-Width Edge-to-Edge) ── */}
      <div className="relative overflow-hidden w-full min-h-[240px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[390px] shadow-sm flex bg-white">
        <AnimatePresence>
          {homepageSlides.length > 0 && homepageSlides[activeSlideIndex] && (
            <motion.div
              key={activeSlideIndex}
              initial={{ x: '100%', opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0.9 }}
              transition={{ duration: 1.0, ease: 'easeInOut' }}
              className={`absolute inset-0 p-8 sm:p-12 md:p-16 flex flex-col justify-center text-left bg-cover bg-center ${homepageSlides[activeSlideIndex]?.target_link ? 'cursor-pointer' : ''
                }`}
              style={{ backgroundImage: `url(${getImageUrl(homepageSlides[activeSlideIndex]?.image)})` }}
              onClick={() => {
                if (homepageSlides[activeSlideIndex]?.target_link) {
                  handleBannerClick(homepageSlides[activeSlideIndex]?.target_link);
                }
              }}
            >
              {/* Dark overlay for readability */}
              {!homepageSlides[activeSlideIndex]?.is_db && (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/35 to-transparent z-0" />
              )}

              {/* Content panel */}
              {!homepageSlides[activeSlideIndex]?.is_db && (
                <div className="space-y-6 text-white max-w-xl text-left z-10">
                  {/* Badge */}
                  {homepageSlides[activeSlideIndex]?.badge && (
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full bg-white/15 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                        ✳ {homepageSlides[activeSlideIndex].badge}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  {homepageSlides[activeSlideIndex]?.title && (
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
                      {homepageSlides[activeSlideIndex].title}
                    </h1>
                  )}

                  {/* Description */}
                  {homepageSlides[activeSlideIndex]?.description && (
                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-md drop-shadow-sm">
                      {homepageSlides[activeSlideIndex].description}
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
                      {homepageSlides[activeSlideIndex]?.buttonText || 'Shop Now'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left Arrow Button */}
        {homepageSlides.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlideIndex((prev) => (prev === 0 ? homepageSlides.length - 1 : prev - 1));
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center transition z-25 cursor-pointer shadow-lg border border-slate-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Arrow Button */}
        {homepageSlides.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlideIndex((prev) => (prev + 1) % homepageSlides.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center transition z-25 cursor-pointer shadow-lg border border-slate-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Pagination Dots at bottom-left */}
        {homepageSlides.length > 1 && (
          <div className="absolute bottom-6 left-8 sm:left-12 md:left-16 z-20 flex items-center gap-2.5">
            {homepageSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex(idx);
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

      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1 flex flex-col gap-8">
        {/* ── Category Section ── */}
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
              <span className="text-xs text-slate-450 font-bold">Loading shelves...</span>
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
                  onClick={() => handleCategoryClick(null)}
                  className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
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
                      onClick={() => handleCategoryClick(cat._id)}
                      className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
                    >
                      <div className={`w-[110px] h-[110px] rounded-[18px] flex items-center justify-center border transition-all duration-300 overflow-hidden ${isSelected
                        ? 'bg-slate-50 border-2 border-slate-900 scale-105 shadow-md'
                        : 'bg-white border border-slate-200 hover:border-slate-400 hover:scale-105 shadow-sm'
                        }`}>
                        {cat.image_url ? (
                          <img
                            src={cat.image_url.startsWith('http') ? cat.image_url : `http://localhost:5000${cat.image_url}`}
                            alt={cat.name}
                            className="w-full h-full object-contain p-2.5 rounded-[18px]"
                          />
                        ) : (
                          <span className="text-5xl select-none">{details.emoji}</span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-650 group-hover:text-slate-850 text-center leading-tight uppercase tracking-wider">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Secondary Promotional Banners (4-Item Sliding Carousel) ── */}
        {displaySmallBanners.length > 0 && (() => {
          const total = smallBannersLoop.length; // doubled length
          const trackWidthPct = (total / 4) * 100; // each card = 25% of visible area
          const cardWidthPct = 100 / total; // each card as % of the track
          const shiftPct = smallBannerIndex * cardWidthPct;
          return (
            <div className="relative w-full py-2">
              {/* Left Arrow */}
              <button
                onClick={() => setSmallBannerIndex((prev) => (prev <= 0 ? displaySmallBanners.length - 1 : prev - 1))}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200 shadow-md cursor-pointer z-10 transition"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => setSmallBannerIndex((prev) => prev + 1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200 shadow-md cursor-pointer z-10 transition"
                aria-label="Next banner"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Sliding Track */}
              <div className="overflow-hidden mx-10">
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
                        className="px-2 flex-shrink-0"
                        style={{ width: `${cardWidthPct}%` }}
                      >
                        <div
                          onClick={() => handleBannerClick(banner.target_link)}
                          className="rounded-xl overflow-hidden relative aspect-[16/8] w-full shadow-sm border border-slate-200/50 cursor-pointer transform hover:-translate-y-1 hover:shadow-md transition-all duration-300 group"
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
                            <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                              <div className="space-y-1 text-left">
                                <span className="text-[8px] bg-white/20 border border-white/10 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                  {banner.badge || 'PROMO'}
                                </span>
                                <h4 className="text-xs sm:text-sm font-black text-white pt-1 leading-snug drop-shadow-sm line-clamp-1">
                                  {banner.title}
                                </h4>
                                <p className="text-[9px] text-white/80 leading-normal line-clamp-2 font-medium">
                                  {banner.description}
                                </p>
                              </div>
                              <span className="text-[9px] font-black text-white group-hover:underline flex items-center gap-1">
                                {banner.buttonText || 'Shop Now'} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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

        {/* ── Product Catalog Section ── */}
        <div className="space-y-4 pt-4" ref={catalogRef} id="catalog">
          {/* Distinct Product Section Banner */}
          <div className="w-full bg-[#064e3b] rounded-2xl py-6 px-4 text-center shadow-md relative overflow-hidden">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider relative z-10">
              {selectedCategory
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
              {(selectedCategory || searchQuery) && (
                <button
                  onClick={() => navigate('/')}
                  className="text-xs text-emerald-755 hover:text-emerald-850 font-bold border border-emerald-200 hover:border-emerald-300 px-3.5 py-1.5 rounded-xl bg-emerald-50/50 transition cursor-pointer"
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

          <ProductGrid
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            isGridView={isGridView}
          />
        </div>

      </div>
    </div>
  );
}
