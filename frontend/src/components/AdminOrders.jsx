import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FileText, FileImage, Loader2, User, Phone, MapPin, 
  ShoppingBag, Check, RefreshCw 
} from 'lucide-react';
import AdminBillsView from './AdminBillsView';

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  'Out for Delivery': 'bg-purple-50 text-purple-700 border-purple-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminOrders() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('orders'); // orders, bills
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/orders', config);
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      showToast('Error loading orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.put(`/api/orders/${id}/status`, { status }, config);
      setOrders(orders.map(o => o._id === id ? res.data : o));
      showToast('Order status updated successfully', 'success');
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast('Error updating status', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 gap-4 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Fulfillment Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'bills'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileImage className="w-4 h-4" />
          Receipt Uploads
        </button>
      </div>

      {activeTab === 'orders' ? (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="text-sm font-medium">Fetching orders list...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl text-slate-400 font-medium">
              No orders placed in store yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => (
                <div 
                  key={order._id}
                  className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md hover:border-slate-300/40 transition-all"
                >
                  <div className="flex-1 space-y-4">
                    {/* Title Details */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-slate-900 text-base">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border tracking-wider ${
                        order.customerDetails?.pickupType === 'pickup' 
                          ? 'bg-amber-50 text-amber-700 border-amber-100' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}>
                        {order.customerDetails?.pickupType === 'pickup' ? 'Pickup' : 'Delivery'}
                      </span>
                    </div>

                    {/* Customer Info Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800">{order.customerDetails?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold">{order.customerDetails?.phone}</span>
                      </div>
                      {order.customerDetails?.pickupType === 'delivery' && (
                        <div className="flex items-start gap-2 sm:col-span-2 border-t border-slate-200/60 pt-2 mt-1">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{order.customerDetails?.deliveryAddress}</span>
                        </div>
                      )}
                    </div>

                    {/* Items breakdowns */}
                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items Summary</h4>
                      <div className="space-y-1.5 pl-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-slate-600">
                            <span>
                              {item.name}{' '}
                              <span className="text-slate-400 font-semibold">(x{item.quantity} {item.unit})</span>
                            </span>
                            <span className="font-bold text-slate-800">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing / Update Controls */}
                  <div className="md:w-60 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6 flex flex-col justify-between items-stretch gap-5">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Billing</span>
                      <span className="text-2xl font-black text-emerald-800 tracking-tight block mt-1">
                        Rs. {order.totalPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400 uppercase">Change Fulfill Status</label>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending Validation</option>
                        <option value="Processing">Processing / Packaged</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Completed">Completed / Dispatched</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Receipt uploads tab */
        <div className="animate-in fade-in duration-300">
          <AdminBillsView />
        </div>
      )}
    </div>
  );
}
