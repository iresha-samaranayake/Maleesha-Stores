import React, { useContext, useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, Heart, Star, Flame, Clock } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useContext(CartContext);
  const { showToast } = useToast();

  const cartItem = cart.find(item => item.product_id === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Local Wishlist State
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsFavorite(savedWishlist.includes(product._id));
  }, [product._id]);

  const toggleWishlist = (e) => {
    e.stopPropagation();
    let savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (savedWishlist.includes(product._id)) {
      savedWishlist = savedWishlist.filter(id => id !== product._id);
      setIsFavorite(false);
      showToast(`${product.name} removed from favorites`, 'info');
    } else {
      savedWishlist.push(product._id);
      setIsFavorite(true);
      showToast(`${product.name} added to favorites!`, 'success');
    }
    localStorage.setItem('wishlist', JSON.stringify(savedWishlist));
  };

  const handleIncrement = () => {
    if (quantityInCart < product.stock) {
      updateQuantity(product._id, quantityInCart + 1);
    }
  };

  const handleDecrement = () => {
    updateQuantity(product._id, quantityInCart - 1);
  };

  // Mock pricing calculations for premium design (original price + discount %)
  const discountPercent = product.price > 500 ? 15 : product.price > 150 ? 10 : 8;
  const originalPrice = Math.round(product.price * (1 + discountPercent / 100));

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="bg-white rounded-[24px] border border-slate-100/80 shadow-sm overflow-hidden flex flex-col justify-between group relative select-none"
    >



      {/* Heart / Wishlist Trigger */}
      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 shadow-sm backdrop-blur-sm transition-all cursor-pointer hover:scale-110 active:scale-95"
      >
        <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
      </button>

      {/* Image Block */}
      <div className="relative aspect-[16/15] bg-slate-50/50 overflow-hidden border-b border-slate-100/50 shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100/50 font-bold text-xs uppercase tracking-widest">
            {product.name?.slice(0, 3)}
          </div>
        )}

        {/* Floating Stock Overlay alerts */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex flex-wrap gap-1">
          {isOutOfStock ? (
            <span className="bg-rose-500/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500/95 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
              Only {product.stock} Left!
            </span>
          ) : (
            <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-emerald-400" />
              15 mins
            </span>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Category Tag & Ratings bar */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-md uppercase tracking-widest">
              {product.category_id?.name || 'Fresh'}
            </span>
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="text-[10px] font-bold text-slate-700">4.8</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-extrabold text-sm text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>

          {/* Quantity Unit Description */}
          <p className="text-xs text-slate-400 font-semibold">
            {product.unit || 'per unit'}
          </p>

          {/* Stock bar indicator */}
          {isLowStock && (
            <div className="space-y-1 pt-0.5">
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(product.stock / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pricing & CTA Controls */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100/50">

          {/* Price Tags */}
          <div className="flex flex-col">
            <span className="text-emerald-800 font-black text-base tracking-tight leading-none">
              Rs. {product.price.toLocaleString()}
            </span>
          </div>

          {/* Cart triggers */}
          <div className="shrink-0">
            {isOutOfStock ? (
              <button
                disabled
                className="bg-slate-50 text-slate-300 p-2.5 rounded-xl border border-slate-100 cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            ) : quantityInCart > 0 ? (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 p-0.5 rounded-xl shadow-inner">
                <button
                  onClick={handleDecrement}
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition active:scale-95 shadow-sm font-bold cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-slate-800 font-black text-xs px-1.5 min-w-[14px] text-center">
                  {quantityInCart}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantityInCart >= product.stock}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition active:scale-95 shadow-sm font-bold cursor-pointer ${quantityInCart >= product.stock ? 'opacity-30 cursor-not-allowed' : ''
                    }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product)}
                className="w-9 h-9 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-600/10 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

        </div>

      </div>

    </motion.div>
  );
}
