import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Truck, Store, ArrowRight, ChevronLeft, Loader2, CheckCircle, Package, Calendar, Phone, User, MapPin } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function CustomerCheckout() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    pickupType: 'pickup', // pickup or delivery
    deliveryAddress: user?.address || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = formData.pickupType === 'delivery' ? (cartSubtotal > 1500 ? 0 : 250) : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast('Please fill in name and phone number', 'error');
      return;
    }
    if (formData.pickupType === 'delivery' && !formData.deliveryAddress) {
      showToast('Please enter a delivery address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: item.quantity
        })),
        customerDetails: {
          name: formData.name,
          phone: formData.phone,
          pickupType: formData.pickupType,
          deliveryAddress: formData.pickupType === 'delivery' ? formData.deliveryAddress : undefined
        },
        totalPrice: cartTotal
      };

      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      const { data } = await axios.post('/api/orders', orderPayload, config);
      setOrderSuccess(data);
      clearCart();
      showToast('Order placed successfully!', 'success');
    } catch (err) {
      console.error('Checkout error:', err);
      showToast(err.response?.data?.message || 'Failed to submit order. Try again', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-md w-full mx-auto px-4 py-12 text-center space-y-6 font-sans animate-in fade-in duration-500">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Order Successful!</h2>
        <p className="text-sm text-slate-500 leading-relaxed px-2">
          Thank you, <span className="font-semibold text-slate-800">{orderSuccess.customerDetails?.name}</span>.
          Your order has been registered. We will contact you at <span className="font-semibold text-slate-800">{orderSuccess.customerDetails?.phone}</span> to verify delivery details.
        </p>

        {/* Order Details card */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-100 text-left text-xs space-y-4 shadow-sm max-w-sm mx-auto">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-400 font-semibold uppercase">Order Reference</span>
            <span className="text-slate-800 font-bold font-mono uppercase">{orderSuccess._id.slice(-6)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-400 font-semibold uppercase">Fulfillment</span>
            <span className="text-slate-800 font-bold capitalize">{orderSuccess.customerDetails?.pickupType}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-400 font-semibold uppercase">Contact Phone</span>
            <span className="text-slate-800 font-semibold">{orderSuccess.customerDetails?.phone}</span>
          </div>
          {orderSuccess.customerDetails?.deliveryAddress && (
            <div className="border-b border-slate-100 pb-3">
              <span className="text-slate-400 font-semibold uppercase block mb-1">Delivery Address</span>
              <span className="text-slate-700 leading-relaxed font-medium block">{orderSuccess.customerDetails?.deliveryAddress}</span>
            </div>
          )}
          <div className="flex justify-between pt-1">
            <span className="text-slate-800 font-bold text-sm">Amount Paid</span>
            <span className="text-emerald-800 font-black text-base">Rs. {orderSuccess.totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/customer/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/10 active:scale-95 cursor-pointer"
        >
          Return to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-full w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-8 space-y-8 font-sans animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200/60 pb-5">
        <button
          onClick={() => navigate('/customer/cart')}
          className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Complete your grocery placement details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Side: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">

            {/* Segmented controls for Pickup vs Delivery */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Fulfillment Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, pickupType: 'pickup' }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-sm font-bold transition cursor-pointer ${formData.pickupType === 'pickup'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 shadow-sm'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/30'
                    }`}
                >
                  <Store className="w-5 h-5" />
                  <span>Store Pickup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, pickupType: 'delivery' }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-sm font-bold transition cursor-pointer ${formData.pickupType === 'delivery'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 shadow-sm'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/30'
                    }`}
                >
                  <Truck className="w-5 h-5" />
                  <span>Home Delivery</span>
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Recipient name"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +94769370767"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {formData.pickupType === 'delivery' && (
                <div className="space-y-1.5 animate-in slide-in-from-top-3 duration-250">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <textarea
                      name="deliveryAddress"
                      required
                      rows="3"
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      placeholder="Street number, city, postal index details"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3.5 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/10 transition-all cursor-pointer disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Place Order
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Order Items Panel */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Fulfillment Cart</h3>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.product_id} className="py-3 flex justify-between items-center text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Quantity: x{item.quantity} {item.unit}</p>
                  </div>
                  <span className="font-extrabold text-slate-800 shrink-0">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Fulfillment Fee</span>
                <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-bold uppercase">FREE</span> : `Rs. ${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-800">
                <span>Final Billing</span>
                <span className="text-emerald-800 font-black">Rs. {cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
