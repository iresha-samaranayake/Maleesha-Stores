import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, ShoppingBag, Leaf, Apple, Cookie, Egg, CupSoda, Package, Layers,
  ChevronRight, ChevronLeft, Sparkles, Gift, Heart, ArrowRight
} from 'lucide-react';

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
    image_url: '/assets/Gemini_Generated_Image_dqtqk0dqtqk0dqtq.png',
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
  const mainTrackRef = useRef(null);
  const smallTrackRef = useRef(null);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
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

  const carouselSlides = mainBanners.length > 0 ? mainBanners : defaultCarouselSlides;
  const displaySmallBanners = smallBanners.length > 0 ? smallBanners : defaultSmallBanners;

  const [smallBannerIndex, setSmallBannerIndex] = useState(0);

  // Duplicated arrays for infinite looping
  const mainSlidesLoop = [...carouselSlides, ...carouselSlides];
  const smallBannersLoop = [...displaySmallBanners, ...displaySmallBanners];

  // Auto swapping main carousel — slide left every 10s
  useEffect(() => {
    if (carouselSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  // Snap main carousel back to first copy when it reaches the duplicate set
  useEffect(() => {
    if (currentSlideIndex >= carouselSlides.length) {
      const timeout = setTimeout(() => {
        if (mainTrackRef.current) {
          mainTrackRef.current.style.transition = 'none';
        }
        setCurrentSlideIndex(currentSlideIndex - carouselSlides.length);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (mainTrackRef.current) {
              mainTrackRef.current.style.transition = '';
            }
          });
        });
      }, 650);
      return () => clearTimeout(timeout);
    }
  }, [currentSlideIndex, carouselSlides.length]);

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

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => prev + 1);
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
      {/* ── Main Hero Carousel Slider (Full-Width Edge-to-Edge) ── */}
      <div className="relative overflow-hidden w-full h-[240px] sm:h-[300px] md:h-[350px] lg:h-[390px] shadow-sm bg-white group">
          {/* CSS translateX sliding track */}
          <div
            ref={mainTrackRef}
            className="flex transition-transform duration-[600ms] ease-in-out h-full"
            style={{
              width: `${mainSlidesLoop.length * 100}%`,
              transform: `translateX(-${(currentSlideIndex * 100) / mainSlidesLoop.length}%)`,
            }}
          >
            {mainSlidesLoop.map((slide, idx) => (
              <div
                key={`main-slide-${idx}`}
                className="relative flex-shrink-0 h-full cursor-pointer"
                style={{ width: `${100 / mainSlidesLoop.length}%` }}
                onClick={() => handleBannerClick(slide.target_link)}
              >
                <img
                  src={getImageUrl(slide.image_url)}
                  alt={slide.title || 'Hero Banner'}
                  className="absolute inset-0 w-full h-full object-fill z-0"
                />
                {(slide.is_fallback || slide.title) && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/35 to-transparent z-10" />
                    <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-12 md:p-16 z-20">
                      <div className="space-y-4 sm:space-y-6 text-white max-w-xl select-none text-left">
                        {slide.badge && (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/15 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                              ✳ {slide.badge}
                            </span>
                          </div>
                        )}
                        {slide.title && (
                          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
                            {slide.title}
                          </h1>
                        )}
                        {slide.description && (
                          <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-md drop-shadow-sm hidden sm:block">
                            {slide.description}
                          </p>
                        )}
                        <div className="pt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleBannerClick(slide.target_link); }}
                            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition active:scale-95 cursor-pointer inline-flex items-center gap-2"
                          >
                            <ShoppingBag className="w-4 h-4 text-emerald-600" />
                            {slide.buttonText || 'Shop Now'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          {carouselSlides.length > 1 && (
            <button
              onClick={handlePrevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-800 flex items-center justify-center transition opacity-0 group-hover:opacity-100 z-30 cursor-pointer shadow-lg border border-slate-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow Button */}
          {carouselSlides.length > 1 && (
            <button
              onClick={handleNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-800 flex items-center justify-center transition opacity-0 group-hover:opacity-100 z-30 cursor-pointer shadow-lg border border-slate-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1 flex flex-col gap-8">
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

        {/* ── 3. Centered "Shop by Category" Circles ── */}
        <div className="bg-white rounded-2xl border border-slate-205/65 p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="text-left">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">Shop by Category</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Explore our daily grocery shelves and popular items</p>
            </div>
            <button
              onClick={() => handleCategoryClick(null)}
              className="text-xs font-bold text-emerald-650 hover:text-emerald-700 transition"
            >
              View More &rarr;
            </button>
          </div>

          {loadingCategories ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-xs text-slate-450 font-bold">Loading shelves...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 justify-center">

              {/* All Categories Item */}
              <button
                onClick={() => handleCategoryClick(null)}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className={`w-16 h-16 rounded-[12px] flex items-center justify-center border transition-all duration-300 overflow-hidden ${selectedCategory === null
                  ? 'bg-slate-50 border-2 border-blue-950 scale-105 shadow-md'
                  : 'bg-white border border-blue-950/20 hover:border-blue-950/60 hover:scale-105 shadow-sm'
                  }`}>
                  <span className="text-2xl select-none">🍏</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-650 group-hover:text-slate-850 text-center leading-snug uppercase tracking-wide">
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
                    className="flex flex-col items-center gap-2 cursor-pointer group"
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
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 group-hover:text-slate-850 text-center leading-tight uppercase tracking-wider">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Product Catalog Section ── */}
        <div className="space-y-4 pt-4" ref={catalogRef} id="catalog">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-3 text-left">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                {selectedCategory
                  ? `${categories.find(c => c._id === selectedCategory)?.name || 'Category Products'}`
                  : searchQuery
                    ? `Search: "${searchQuery}"`
                    : 'Farmed Fruits & Daily Fresh Groceries'}
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Premium selected, clean and washed foods. Delivered within hours.
              </p>
            </div>

            {/* Clear filters trigger */}
            {(selectedCategory || searchQuery) && (
              <button
                onClick={() => navigate('/')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold border border-emerald-200 hover:border-emerald-300 px-3.5 py-1.5 rounded-xl bg-emerald-50/50 transition cursor-pointer self-start sm:self-auto"
              >
                Clear all filters
              </button>
            )}
          </div>

          <ProductGrid selectedCategory={selectedCategory} searchQuery={searchQuery} />
        </div>

      </div>
    </div>
  );
}
