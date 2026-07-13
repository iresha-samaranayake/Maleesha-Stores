import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Layers,
  BarChart3, LogOut, Menu, X, Bell, Image
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    navigate('/?logout=true');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/users', icon: Users },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Banners', path: '/admin/banners', icon: Image },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col border-r border-slate-800`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-700/25">M</div>
            <span className="font-bold text-white text-base tracking-tight">Maleesha Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Support active highlighting when path exactly matches or starts with path (except dashboard)
            const isActive = item.path === '/admin/dashboard' 
              ? location.pathname === item.path || location.pathname === '/admin'
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/20'
                    : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white leading-none truncate">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-none">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="hidden md:block text-lg font-bold text-slate-800">
              {navItems.find(item => {
                if (item.path === '/admin/dashboard') {
                  return location.pathname === item.path || location.pathname === '/admin';
                }
                return location.pathname.startsWith(item.path);
              })?.label || 'Admin Panel'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
            </button>

            {/* Profile Header Widget */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-700">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Main Content Panel */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
