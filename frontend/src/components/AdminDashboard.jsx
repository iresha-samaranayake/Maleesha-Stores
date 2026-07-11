import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import { 
  Package, ShoppingBag, Users, Layers, TrendingUp, DollarSign,
  Loader2, Bell, ShieldAlert, Check, ChevronRight, ArrowRight
} from 'lucide-react';

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  'Out for Delivery': 'bg-purple-50 text-purple-700 border-purple-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Data States
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [catRes, prodRes, ordRes, userRes] = await Promise.all([
        axios.get('/api/categories', config),
        axios.get('/api/products', config),
        axios.get('/api/orders', config),
        axios.get('/api/auth/users', config)
      ]);
      
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setOrders(ordRes.data);
      setCustomers(userRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      showToast('Error loading dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      
      // Configure WebSocket for real-time order/bill alerts
      const socket = io('http://localhost:5000');
      
      socket.on('new-bill', (bill) => {
        // Add to notification stack
        const newNotif = {
          id: Math.random().toString(),
          message: `New manual receipt uploaded by ${bill.customerName}!`,
          time: new Date().toLocaleTimeString(),
          type: 'bill'
        };
        setNotifications(prev => [newNotif, ...prev]);
        showToast(`Receipt upload alert from ${bill.customerName}!`, 'info');
      });

      return () => socket.disconnect();
    }
  }, [user]);

  // Calculations
  const grossSales = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalPrice : 0), 0);
  const customerCount = customers.filter(u => u.role === 'customer').length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-300">
      
      {/* Real-time Notifications Bar */}
      {notifications.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Unresolved receipt uploads ({notifications.length})</span>
          </div>
          <div className="space-y-1">
            {notifications.map(notif => (
              <div key={notif.id} className="flex justify-between items-center text-xs text-amber-700">
                <span>{notif.message}</span>
                <span className="font-semibold text-[10px] text-amber-500">{notif.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Assembling store KPIs...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total Products', value: products.length, icon: Package, link: '/admin/products', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Total Customers', value: customerCount, icon: Users, link: '/admin/users', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Orders', value: orders.length, icon: ShoppingBag, link: '/admin/orders', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Store Sales', value: `Rs. ${grossSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, link: '/admin/reports', color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Link 
                  key={kpi.label} 
                  to={kpi.link}
                  className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{kpi.label}</span>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Sub-panels: Recent Orders & Quick Management links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Orders List (Table) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Recent Store Orders</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Quick lookup of latest customer checkouts</p>
                  </div>
                  <Link to="/admin/orders" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 transition">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4 pl-6">Order Reference</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Total Price</th>
                        <th className="p-4">Fulfillment</th>
                        <th className="p-4 pr-6">Status Badge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-slate-50/20 transition">
                          <td className="p-4 pl-6 font-mono font-bold text-slate-800 uppercase">
                            #{order._id.slice(-6)}
                          </td>
                          <td className="p-4 font-semibold text-slate-800">
                            {order.customerDetails?.name || 'Walk-in'}
                          </td>
                          <td className="p-4 font-bold text-slate-900">
                            Rs. {order.totalPrice.toLocaleString()}
                          </td>
                          <td className="p-4 capitalize font-semibold text-slate-500">
                            {order.customerDetails?.pickupType}
                          </td>
                          <td className="p-4 pr-6">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_STYLES[order.status] || 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-6">
              
              {/* Quick Admin Actions card */}
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Operations Control</h3>
                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <Link
                    to="/admin/products"
                    className="flex items-center justify-between p-3.5 border border-slate-100 hover:border-emerald-200 rounded-xl bg-slate-50/40 hover:bg-emerald-50 hover:text-emerald-700 transition font-semibold group cursor-pointer"
                  >
                    <span>Manage Product Catalog</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/admin/categories"
                    className="flex items-center justify-between p-3.5 border border-slate-100 hover:border-emerald-200 rounded-xl bg-slate-50/40 hover:bg-emerald-50 hover:text-emerald-700 transition font-semibold group cursor-pointer"
                  >
                    <span>Edit Grocery Categories</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/admin/reports"
                    className="flex items-center justify-between p-3.5 border border-slate-100 hover:border-emerald-200 rounded-xl bg-slate-50/40 hover:bg-emerald-50 hover:text-emerald-700 transition font-semibold group cursor-pointer"
                  >
                    <span>View Financial Reports</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Dynamic Categories Card */}
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Categories</h3>
                  <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">{categories.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categories.slice(0, 8).map((cat) => (
                    <span key={cat._id} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-xl font-semibold border border-slate-200/40">
                      {cat.name}
                    </span>
                  ))}
                  {categories.length > 8 && (
                    <span className="text-xs bg-slate-50 text-slate-400 px-2 py-1 rounded-xl font-semibold border border-dashed border-slate-200">
                      +{categories.length - 8} more
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}
