import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Package, Clock, MapPin, ChevronLeft, ShoppingBag, Loader2 } from 'lucide-react';
import axios from 'axios';

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  'Out for Delivery': 'bg-purple-50 text-purple-700 border-purple-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function CustomerOrders() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchOrders = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/orders/myorders', config);
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        showToast('Failed to fetch orders', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate, showToast]);

  return (
    <div className="max-w-full w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-6 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <Link 
          to="/customer/dashboard" 
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Order History</h1>
          <p className="text-sm text-slate-400">Track and manage your grocery purchases</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Loading your orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No orders placed yet</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1 mb-6">
            Explore Maleesha Stores and fill your pantry with fresh ingredients.
          </p>
          <Link
            to="/customer/dashboard?tab=shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/10 active:scale-95 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order._id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md hover:border-slate-200/50 transition-all"
            >
              <div className="flex-1 space-y-4">
                {/* Header details */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-900 text-base">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    order.customerDetails?.pickupType === 'pickup' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}>
                    {order.customerDetails?.pickupType === 'pickup' ? 'Pickup' : 'Delivery'}
                  </span>
                </div>

                {/* Shipping Details */}
                {order.customerDetails?.pickupType === 'delivery' && (
                  <div className="flex items-start gap-2 bg-slate-50 p-3.5 rounded-xl text-xs text-slate-500 border border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <p className="font-bold text-slate-700">Delivery Address</p>
                      <p className="truncate mt-0.5">{order.customerDetails.deliveryAddress}</p>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</h4>
                  <div className="grid grid-cols-1 gap-1.5 pl-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm text-slate-700">
                        <span className="font-medium">{item.name} <span className="text-xs text-slate-400">({item.quantity} {item.unit})</span></span>
                        <span className="font-bold text-slate-800">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status and Pricing */}
              <div className="md:w-56 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6 flex flex-col justify-between items-stretch gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Amount</span>
                  <span className="text-2xl font-black text-emerald-800 tracking-tight block mt-1">
                    Rs. {order.totalPrice.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Status</span>
                  <span className={`w-full inline-flex items-center justify-center text-center text-xs font-bold px-3 py-2 rounded-xl border ${STATUS_STYLES[order.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
