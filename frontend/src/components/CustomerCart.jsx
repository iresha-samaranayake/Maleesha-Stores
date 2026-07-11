import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Trash2, Plus, Minus, ChevronLeft, ShoppingBag, ArrowRight, Sparkles, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerCart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleIncrement = (item) => {
    updateQuantity(item.product_id, item.quantity + 1);
  };

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.product_id, item.quantity - 1);
    } else {
      removeFromCart(item.product_id);
      showToast(`${item.name} removed from cart`, 'info');
    }
  };

  const handleRemove = (item) => {
    removeFromCart(item.product_id);
    showToast(`${item.name} removed from cart`, 'info');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your shopping cart?')) {
      clearCart();
      showToast('Shopping cart cleared', 'info');
    }
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = cartSubtotal > 1500 ? 0 : 250;
  const cartTotal = cartSubtotal + (cartItems.length > 0 ? deliveryFee : 0);

  // Free delivery progress tracking
  const targetForFreeDelivery = 1500;
  const progressPercent = Math.min((cartSubtotal / targetForFreeDelivery) * 100, 100);
  const remainingForFree = Math.max(0, targetForFreeDelivery - cartSubtotal);

  return (
    <div className="max-w-full w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-8 space-y-8 font-sans animate-in fade-in duration-300">

      {/* Back button header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Review your selected fresh items</p>
          </div>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={handleClearCart}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white border border-slate-100 rounded-[32px] shadow-sm flex flex-col items-center justify-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="text-lg font-black text-slate-800">Your cart is empty</h2>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Looks like you haven't added any groceries to your cart yet. Explore the market and find fresh products!
          </p>
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="mt-2 flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/10 active:scale-95 cursor-pointer"
          >
            Explore Fresh Groceries
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left panel: Cart Items Card list */}
          <div className="lg:col-span-2 space-y-4">

            {/* Free Delivery Promo Bar */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  {remainingForFree > 0
                    ? `Spend Rs. ${remainingForFree.toLocaleString()} more for FREE delivery!`
                    : '🎉 Congratulations! You have unlocked FREE Delivery!'}
                </span>
                <span className="font-extrabold text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Target: Rs. 1,500
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100/60">
              <AnimatePresence initial={false}>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.product_id}
                    exit={{ opacity: 0, height: 0, padding: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-5 flex items-center gap-4 hover:bg-slate-50/10 transition"
                  >
                    {/* Image Placeholder */}
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 font-extrabold text-sm uppercase shrink-0 border border-emerald-100/50">
                      {item.name?.slice(0, 2)}
                    </div>

                    {/* Description details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{item.name}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.unit || 'each'}</p>
                      <p className="text-xs font-black text-slate-900 mt-1">Rs. {item.price}</p>
                    </div>

                    {/* Action controls */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/50 p-0.5 rounded-xl">
                      <button
                        onClick={() => handleDecrement(item)}
                        className="p-1 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm transition cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black text-slate-800 w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleIncrement(item)}
                        className="p-1 rounded-lg text-slate-500 hover:bg-white hover:shadow-sm transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Item Subtotal & Trash bin */}
                    <div className="flex items-center gap-4 text-right">
                      <span className="text-sm font-black text-slate-800 w-20">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      <button
                        onClick={() => handleRemove(item)}
                        className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right panel: Stripe-like pricing summary cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">Order Summary</h2>

              <div className="space-y-3 text-xs text-slate-500 border-b border-slate-100 pb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-bold text-slate-800">Rs. {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-slate-800">
                    {deliveryFee === 0 ? <span className="text-emerald-600 font-extrabold uppercase">FREE</span> : `Rs. ${deliveryFee}`}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100/50 p-2.5 rounded-xl font-medium leading-relaxed">
                    💡 Save money! Add Rs. {remainingForFree.toLocaleString()} more worth of items to get FREE Delivery!
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-slate-600 font-bold">Total Amount</span>
                <span className="text-xl font-black text-emerald-800">Rs. {cartTotal.toLocaleString()}</span>
              </div>

              <button
                onClick={() => navigate('/customer/checkout')}
                className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/10 transition-all cursor-pointer mt-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
