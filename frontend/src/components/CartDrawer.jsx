import React, { useContext } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { CartContext } from '../context/CartContext';

export default function CartDrawer({ isOpen, onClose, onCheckout }) {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useContext(CartContext);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between h-full transform transition duration-300">
          
          {/* Header */}
          <div className="px-4 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-950">Your Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <ShoppingBag className="w-12 h-12 stroke-[1.2]" />
                <p className="text-sm font-medium">Your cart is empty</p>
                <button
                  onClick={onClose}
                  className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition font-semibold"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.product_id}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 group transition hover:border-slate-200"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold bg-slate-100">
                        Grocer
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Per {item.unit} • Rs. {item.price.toLocaleString()}
                    </p>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 px-2 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (item.quantity < item.stock) {
                              updateQuantity(item.product_id, item.quantity + 1);
                            }
                          }}
                          disabled={item.quantity >= item.stock}
                          className={`w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition font-bold ${
                            item.quantity >= item.stock ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex flex-col items-end justify-between self-stretch">
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="p-1 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                    <span className="text-emerald-700 font-extrabold text-sm mt-auto">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Footer Summary / Checkout action */}
          {cart.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-6 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Subtotal</span>
                <span className="text-xl font-black text-slate-900">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Taxes and fulfillment costs calculated at checkout. Delivery is handled locally by store staff.
              </p>
              
              <button
                onClick={onCheckout}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold shadow-md shadow-emerald-100 transition group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
