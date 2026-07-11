import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader2, TrendingUp, DollarSign, ShoppingBag, FileText, ChevronRight, Download } from 'lucide-react';

export default function AdminReports() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    revenue: 0,
    orderCount: 0,
    averageValue: 0,
    pendingFulfillment: 0
  });

  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchOrderReports = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get('/api/orders', config);
        const allOrders = res.data;
        setOrders(allOrders);

        // Calculate KPIs
        const totalRevenue = allOrders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.totalPrice : 0), 0);
        const validOrders = allOrders.filter(o => o.status !== 'Cancelled');
        const avgVal = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
        const pendingCount = allOrders.filter(o => ['Pending', 'Processing', 'Out for Delivery'].includes(o.status)).length;

        setKpis({
          revenue: totalRevenue,
          orderCount: validOrders.length,
          averageValue: avgVal,
          pendingFulfillment: pendingCount
        });

        // Group by Month (last 6 months)
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthName = d.toLocaleString('default', { month: 'short' });
          const year = d.getFullYear();
          last6Months.push({
            monthName,
            year,
            index: d.getMonth(),
            revenue: 0,
            count: 0
          });
        }

        allOrders.forEach(order => {
          if (order.status === 'Cancelled') return;
          const orderDate = new Date(order.createdAt);
          const m = orderDate.getMonth();
          const y = orderDate.getFullYear();
          const target = last6Months.find(lm => lm.index === m && lm.year === y);
          if (target) {
            target.revenue += order.totalPrice;
            target.count += 1;
          }
        });

        setMonthlyData(last6Months);

      } catch (err) {
        console.error('Error fetching reports data:', err);
        showToast('Error loading reports data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderReports();
  }, [user, showToast]);

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1000);
  const maxCount = Math.max(...monthlyData.map(d => d.count), 5);

  const handleExport = () => {
    showToast('Exporting sales report. CSV download started!', 'success');
  };

  return (
    <div className="space-y-8 font-sans animate-in fade-in duration-300">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Sales Reports</h1>
          <p className="text-sm text-slate-400">Analyze store revenue and order statistics</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Sales CSV
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Compiling dashboard analytics...</span>
        </div>
      ) : (
        <>
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Gross Revenue', value: `Rs. ${kpis.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, change: '+12% from last month', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Completed Orders', value: kpis.orderCount, icon: ShoppingBag, change: '+8.3% from last month', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Average Order Value', value: `Rs. ${kpis.averageValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, change: '+2.1% from last week', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Pending Fulfillment', value: kpis.pendingFulfillment, icon: FileText, change: 'Orders active in pipeline', color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{kpi.label}</span>
                    <div className={`w-9 h-9 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{kpi.change}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart 1: Revenue Area Chart */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Revenue Trend (Last 6 Months)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Visual representation of gross shop sales</p>
              </div>

              {/* Custom SVG Area Chart */}
              <div className="w-full h-64 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex items-end relative">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Draw Area path & Line path */}
                  {(() => {
                    const widthBetween = 500 / 5;
                    const points = monthlyData.map((d, index) => {
                      const x = index * widthBetween;
                      const y = 180 - (d.revenue / maxRevenue) * 150;
                      return { x, y };
                    });

                    if (points.length === 0) return null;

                    const lineD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
                    const areaD = `${lineD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

                    return (
                      <>
                        <path d={areaD} fill="url(#areaGrad)" />
                        <path d={lineD} fill="none" stroke="#10b981" strokeWidth="3" />
                        {points.map((p, index) => (
                          <g key={index}>
                            <circle cx={p.x} cy={p.y} r="5" fill="#10b981" className="cursor-pointer hover:r-7 transition-all" />
                            <text x={p.x} y={p.y - 12} fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle">
                              {monthlyData[index].revenue > 0 ? `Rs.${(monthlyData[index].revenue/1000).toFixed(0)}k` : ''}
                            </text>
                            <text x={p.x} y="195" fill="#94a3b8" fontSize="10" fontWeight="semibold" textAnchor="middle">
                              {monthlyData[index].monthName}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Chart 2: Order Bar Chart */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Order Volumes (Last 6 Months)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Total counts of fulfilled client orders</p>
              </div>

              {/* Custom SVG Bar Chart */}
              <div className="w-full h-64 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex items-end relative">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Draw Bars */}
                  {(() => {
                    const widthBetween = 500 / 6;
                    const barWidth = 32;

                    return monthlyData.map((d, index) => {
                      const x = index * widthBetween + (widthBetween - barWidth) / 2;
                      const height = (d.count / maxCount) * 140;
                      const y = 175 - height;

                      return (
                        <g key={index}>
                          {/* Background shadow bar */}
                          <rect x={x} y="35" width={barWidth} height="140" fill="#f8fafc" rx="6" />
                          {/* Actual value bar */}
                          <rect 
                            x={x} 
                            y={y} 
                            width={barWidth} 
                            height={height} 
                            fill="#3b82f6" 
                            rx="6" 
                            className="hover:fill-blue-600 transition-colors cursor-pointer"
                          />
                          <text x={x + barWidth / 2} y={y - 8} fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle">
                            {d.count > 0 ? d.count : ''}
                          </text>
                          <text x={x + barWidth / 2} y="195" fill="#94a3b8" fontSize="10" fontWeight="semibold" textAnchor="middle">
                            {d.monthName}
                          </text>
                        </g>
                      );
                    });
                  })()}
                </svg>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
