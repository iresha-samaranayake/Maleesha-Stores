import React, { useState, useContext } from 'react';
import axios from 'axios';
import { X, CheckCircle, Truck, Store, ArrowRight, Loader } from 'lucide-react';
import { CartContext } from '../context/CartContext';

export default function CheckoutForm({ isOpen, onClose }) {
  const { cart, totalPrice, clearCart } = useContext(CartContext);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickupType: 'pickup', // pickup or delivery
    deliveryAddress: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.pickupType === 'delivery' && !formData.deliveryAddress) {
      setError('Please enter a delivery address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        items: cart,
        customerDetails: {
          name: formData.name,
          phone: formData.phone,
          pickupType: formData.pickupType,
          deliveryAddress: formData.pickupType === 'delivery' ? formData.deliveryAddress : undefined
        },
        totalPrice
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${apiUrl}/orders`, orderPayload);
      
      setOrderSuccess(res.data);
      clearCart();
    } catch (err) {
      console.error('Error submitting order:', err);
      setError(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-950">
            {orderSuccess ? 'Order Success' : 'Checkout & Fulfillment'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 no-scrollbar">
          {orderSuccess ? (
            /* Success View */
            <div className="text-center py-8 space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Order Placed Successfully!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Thank you, <span className="font-semibold text-slate-800">{orderSuccess.customerDetails?.name}</span>. 
                We have registered your order. We will contact you at <span className="font-semibold text-slate-800">{orderSuccess.customerDetails?.phone}</span> to verify details.
              </p>
              
              {/* Order summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left text-sm max-w-sm mx-auto">
                <div className="flex justify-between border-b border-slate-200 pb-2 mb-2 font-medium text-slate-400">
                  <span>Order Reference</span>
                  <span className="text-slate-700 font-mono text-xs uppercase">{orderSuccess._id.slice(-6)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Total Amount Paid</span>
                  <span className="text-emerald-700">Rs. {orderSuccess.totalPrice.toLocaleString()}</span>
                </div>
                <div className="mt-2 text-xs text-slate-400 text-center">
                  Fulfillment Mode: {orderSuccess.customerDetails?.pickupType === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold shadow hover:bg-emerald-700 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 bg-rose-50 text-rose-600 border border-rose-100 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              {/* Delivery type selectors */}
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition ${
                  formData.pickupType === 'pickup' 
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-500'
                }`}>
                  <input
                    type="radio"
                    name="pickupType"
                    value="pickup"
                    checked={formData.pickupType === 'pickup'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Store className="w-6 h-6 mb-2 text-emerald-600" />
                  <span className="text-sm">Store Pickup</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">Pick up at store</span>
                </label>

                <label className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition ${
                  formData.pickupType === 'delivery' 
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-500'
                }`}>
                  <input
                    type="radio"
                    name="pickupType"
                    value="delivery"
                    checked={formData.pickupType === 'delivery'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Truck className="w-6 h-6 mb-2 text-emerald-600" />
                  <span className="text-sm">Home Delivery</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">Delivered to door</span>
                </label>
              </div>

              {/* Form inputs */}
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 077 123 4567"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50 focus:bg-white transition"
                  />
                </div>

                {formData.pickupType === 'delivery' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Delivery Address *
                    </label>
                    <textarea
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      required
                      rows="3"
                      placeholder="Street name, landmark, town, etc."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50 focus:bg-white transition resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Order total info */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">Total Price</span>
                <span className="text-xl font-extrabold text-slate-900">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
