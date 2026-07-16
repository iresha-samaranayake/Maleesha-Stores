import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Heart } from 'lucide-react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useContext(CartContext);
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const cartItem = cart.find(item => item.product_id === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Local Wishlist State
  const [isFavorite, setIsFavorite] = useState(false);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/assets')) return url;
    return `http://localhost:5000${url}`;
  };

  useEffect(() => {
    const updateFavStatus = () => {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsFavorite(savedWishlist.includes(product._id));
    };
    updateFavStatus();
    window.addEventListener('storage', updateFavStatus);
    return () => window.removeEventListener('storage', updateFavStatus);
  }, [product._id]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !user.token) {
      showToast('Please log in to add items to your wishlist', 'info');
      navigate('/login');
      return;
    }
    
    let savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isCurrentlyFav = savedWishlist.includes(product._id);
    
    const config = {
      headers: { Authorization: `Bearer ${user.token}` }
    };
    
    if (isCurrentlyFav) {
      try {
        await axios.delete(`/api/auth/favorites/${product._id}`, config);
        savedWishlist = savedWishlist.filter(id => id !== product._id);
        setIsFavorite(false);
        localStorage.setItem('wishlist', JSON.stringify(savedWishlist));
        showToast(`${product.name} removed from favorites`, 'info');
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Failed to remove from favorites:', err);
        showToast('Could not remove from favorites', 'error');
      }
    } else {
      try {
        await axios.post('/api/auth/favorites', { productId: product._id }, config);
        savedWishlist.push(product._id);
        setIsFavorite(true);
        localStorage.setItem('wishlist', JSON.stringify(savedWishlist));
        showToast(`${product.name} added to favorites!`, 'success');
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Failed to add to favorites:', err);
        showToast('Could not add to favorites', 'error');
      }
    }
  };

  const handleIncrement = () => {
    if (quantityInCart < product.stock) {
      updateQuantity(product._id, quantityInCart + 1);
    }
  };

  const handleDecrement = () => {
    updateQuantity(product._id, quantityInCart - 1);
  };

  const handleAddToCart = () => {
    addToCart(product);
    // showToast(`Added ${product.name} to cart`, 'success');
  };

  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discountPercentage / 100))
    : product.price;

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 15px 20px -5px rgb(0 0 0 / 0.05), 0 5px 8px -6px rgb(0 0 0 / 0.05)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="bg-white rounded-[20px] border border-slate-200/60 shadow-sm flex flex-col justify-between group relative select-none w-full max-w-[210px] mx-auto"
    >
      
      {/* Dynamic Discount Badge (Circular Red Badge in Top Left) */}
      {hasDiscount && (
        <div className="absolute top-[-15px] left-[-15px] z-30 w-[50px] h-[50px] rounded-full bg-[#E32636] text-white font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center text-center shadow-md leading-none border-none outline-none">
          <span className="text-[14px] font-black">{product.discountPercentage}%</span>
          <span className="text-[9px] font-black mt-0.5">OFF</span>
        </div>
      )}

      {/* Image Block: Spanning the full width of the card's top section */}
      <div className="relative w-full aspect-[4/3] bg-[#ffffff] flex justify-center items-center shrink-0 overflow-hidden rounded-t-[20px] select-none">
        {product.image_url ? (
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-355 bg-slate-50 font-black text-xs uppercase select-none">
            {product.name?.slice(0, 3)}
          </div>
        )}

        {/* Floating Stock Overlay alert */}
        {(isOutOfStock || isLowStock) && (
          <div className="absolute bottom-1.5 z-20">
            {isOutOfStock ? (
              <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                Out of Stock
              </span>
            ) : (
              <span className="bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                Only {product.stock} Left
              </span>
            )}
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="p-3 pb-2.5 flex-1 flex flex-col justify-between gap-2 text-center">
        <div className="space-y-0.5">
          {/* Product Name */}
          <h3 className="font-bold text-xs sm:text-sm text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2 h-8 flex items-center justify-center">
            {product.name}
          </h3>

          {/* Quantity Unit Description */}
          <p className="text-[11px] text-slate-400 font-bold">
            {product.unitMeasurement}
          </p>
        </div>

        {/* Pricing & Wishlist Trigger */}
        <div className="flex flex-col items-center justify-center relative py-0.5 mt-auto min-h-[38px]">
          <div className="flex flex-col items-center justify-center">
            <span className="text-emerald-800 font-black text-sm tracking-tight leading-none">
              Rs. {discountedPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-slate-455 font-bold text-[10px] line-through leading-none mt-0.5">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Heart / Wishlist Icon positioned to the bottom right of pricing text block */}
          <button
            onClick={toggleWishlist}
            className="absolute right-0.5 bottom-0 text-slate-400 hover:text-red-500 transition-all cursor-pointer hover:scale-110 active:scale-95 p-1"
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>

      {/* Full-width Add to Cart Button attached flush to bottom edge */}
      <div className="w-full shrink-0">
        {isOutOfStock ? (
          <button
            disabled
            className="w-full py-2.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider rounded-b-[20px] cursor-not-allowed"
          >
            OUT OF STOCK
          </button>
        ) : quantityInCart > 0 ? (
          <div className="w-full flex items-center justify-between bg-[#064e3b] px-2.5 py-1 rounded-b-[20px]">
            <button
              onClick={handleDecrement}
              className="w-6 h-6 rounded-md flex items-center justify-center bg-[#054031] hover:bg-[#043024] text-white font-bold transition active:scale-95 cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-[#ffcc00] font-black text-[11px]">
              {quantityInCart}
            </span>
            <button
              onClick={handleIncrement}
              disabled={quantityInCart >= product.stock}
              className={`w-6 h-6 rounded-md flex items-center justify-center bg-[#054031] hover:bg-[#043024] text-white font-bold transition active:scale-95 cursor-pointer ${
                quantityInCart >= product.stock ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-[#064e3b] hover:bg-[#054031] text-[#ffcc00] text-[10px] font-black uppercase tracking-wider rounded-b-[20px] active:scale-[0.99] transition-all cursor-pointer"
          >
            ADD TO CART
          </button>
        )}
      </div>
    </motion.div>
  );
}
