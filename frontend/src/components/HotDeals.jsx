import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader2, ShoppingBag, Flame, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductGrid from './ProductGrid';

export default function HotDeals() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGridView, setIsGridView] = useState(true);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/assets')) return url;
    return `http://localhost:5000${url}`;
  };

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

  // Filter banners to get only active Hot Deals banners
  const activeDealsBanners = banners.filter(b => b.type === 'Hot Deals' && b.is_active);

  // Auto-swap hot deals carousel every 6s
  useEffect(() => {
    if (activeDealsBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % activeDealsBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeDealsBanners.length]);

  const activeSlideIndex = currentSlideIndex < activeDealsBanners.length ? currentSlideIndex : 0;

  return (
    <div className="flex-1 flex flex-col font-sans bg-[#fbfbfa] pb-16">
      
      {/* ── Hot Deals Hero Slider (Conditional Rendering) ── */}
      <AnimatePresence>
        {activeDealsBanners.length > 0 && activeDealsBanners[activeSlideIndex] && (
          <div className="relative overflow-hidden w-full min-h-[240px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[390px] shadow-sm flex bg-slate-900 shrink-0">
            <motion.div
              key={activeSlideIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${getImageUrl(activeDealsBanners[activeSlideIndex].image_url)})` }}
            >
              {/* Optional dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/20 to-transparent" />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 sm:p-12 md:p-16 flex flex-col justify-center text-left text-white max-w-xl space-y-4 z-10">
                <span className="inline-flex items-center gap-1 bg-[#E32636] border border-red-500/25 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse-glow w-max">
                  🔥 LIMITED DEALS
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-md">
                  Unbeatable Fresh Savings
                </h1>
                <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-sm drop-shadow-md">
                  Premium selected items with maximum price drops. Stock is limited, shop before it sells out!
                </p>
              </div>
            </motion.div>

            {/* Slider Dots */}
            {activeDealsBanners.length > 1 && (
              <div className="absolute bottom-6 left-8 sm:left-12 md:left-16 z-20 flex items-center gap-2">
                {activeDealsBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeSlideIndex === idx ? 'w-7 bg-[#E32636]' : 'w-2.5 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* ── Main Catalog Grid ── */}
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1 flex flex-col gap-8">
        
        <div className="space-y-4 pt-4">
          
          {/* Section Header */}
          <div className="w-full bg-gradient-to-r from-red-600 to-amber-500 rounded-2xl py-8 px-6 text-left shadow-lg relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-8 h-8 text-white animate-pulse" />
                Hot Deals & Sales
              </h2>
              <p className="text-xs text-red-50/90 font-medium">Browse our highest discount organic fresh grocery products</p>
            </div>
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="px-5 py-2 bg-white/20 hover:bg-white/30 border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition duration-150 active:scale-95 cursor-pointer shadow-sm self-start sm:self-auto"
            >
              {isGridView ? 'View Slider' : 'View More'}
            </button>
          </div>

          <ProductGrid
            onlyDiscounts={true}
            isGridView={isGridView}
          />
        </div>

      </div>
    </div>
  );
}
