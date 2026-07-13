import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import {
  ShoppingBag, LogIn, LogOut, ShoppingCart, Menu, X, Search, ChevronDown, Layers, UserPlus, MapPin
} from 'lucide-react';

export default function Navbar({ onCartOpen }) {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    return localStorage.getItem('maleesha_delivery_loc') || 'Colombo';
  });
  
  const dropdownRef = useRef(null);
  const searchParams = new URLSearchParams(location.search);
  const [searchVal, setSearchVal] = useState(searchParams.get('q') || '');

  // Keep search input synced with URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchVal(params.get('q') || '');
  }, [location.search]);

  // URL-driven logout handler to guarantee redirection to homepage without race conditions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('logout') === 'true') {
      if (user) {
        logout();
        showToast('Logged out successfully', 'success');
      }
      navigate('/', { replace: true });
    }
  }, [location.search, user, logout, navigate, showToast]);

  // Fetch categories for dropdown and secondary header links
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories in Navbar:', err);
      }
    };
    fetchCats();
  }, []);

  // Close categories menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCatMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationChange = (e) => {
    const val = e.target.value;
    setDeliveryLocation(val);
    localStorage.setItem('maleesha_delivery_loc', val);
    showToast(`Delivery location updated to: ${val}`, 'success');
  };

  const handleLogout = () => {
    navigate('/?logout=true');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (searchVal.trim()) {
      params.set('q', searchVal);
    } else {
      params.delete('q');
    }
    const targetPath = user && user.role === 'customer' ? '/customer/dashboard' : '/';
    navigate(`${targetPath}?${params.toString()}`);
  };

  const handleCategorySelect = (categoryId) => {
    setCatMenuOpen(false);
    const params = new URLSearchParams(location.search);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    const targetPath = user && user.role === 'customer' ? '/customer/dashboard' : '/';
    navigate(`${targetPath}?${params.toString()}`);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    if (onCartOpen) {
      onCartOpen();
    } else {
      navigate(user ? '/customer/cart' : '/login');
    }
  };

  const isCustomer = user && user.role === 'customer';
  const isAdmin = user && user.role === 'admin';
  const selectedCategory = searchParams.get('category') || null;

  return (
    <div className="flex flex-col w-full sticky top-0 z-40 bg-white shrink-0">
      
      {/* ── Main Row: Logo, Search, Profile, Cart ── */}
      <div className="bg-[#023e2b] text-white w-full border-b border-emerald-950/20">
        <div className="max-w-full w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-3.5 flex items-center justify-between gap-6">
          
          {/* Left Side: Logo & Search Bar */}
          <div className="flex items-center gap-6 md:gap-8 flex-1">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#ffcc00] flex items-center justify-center text-slate-900 shadow-md shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all">
                <ShoppingBag className="w-5.5 h-5.5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-white text-base tracking-tight">Maleesha Stores</span>
              </div>
            </Link>

            {/* Search Bar - Autocomplete visual style */}
            {!isAdmin && (
              <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md items-center bg-white border border-emerald-850/15 focus-within:ring-4 focus-within:ring-[#ffcc00]/25 rounded-xl overflow-hidden transition font-medium">
                <div className="pl-3.5 text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search for fresh fruits, vegetables, dairy, or bakery items..."
                  className="w-full pl-2.5 pr-4 py-2.5 text-xs bg-transparent outline-none border-none text-slate-800 placeholder-slate-400 focus:ring-0 focus:border-none font-semibold"
                />
                {searchVal && (
                  <button
                    type="button"
                    onClick={() => { setSearchVal(''); navigate(user && user.role === 'customer' ? '/customer/dashboard' : '/'); }}
                    className="text-slate-400 hover:text-slate-600 text-[10px] font-bold px-2"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#ffcc00] hover:bg-[#e6b800] text-slate-900 font-extrabold text-xs transition cursor-pointer self-stretch shrink-0"
                >
                  Search
                </button>
              </form>
            )}
          </div>

          {/* User Profile & Cart Drawer */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Cart triggers */}
            {!isAdmin && user && (
              <button
                onClick={handleCartClick}
                className="relative flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800/40 hover:bg-emerald-800/70 border border-emerald-700/30 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <ShoppingCart className="w-4.5 h-4.5 text-[#ffcc00]" />
                <span className="hidden sm:inline">My Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#ffcc00] text-slate-900 text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            {/* User Profile Auth Section */}
            {!user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1 px-3.5 py-2.5 bg-[#ffcc00] hover:bg-[#e6b800] text-slate-900 rounded-xl text-xs font-black transition shadow-md shadow-yellow-500/10 cursor-pointer"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end leading-none text-white">
                  <span className="text-xs font-bold">{user.name}</span>
                  <span className="text-[9px] text-white/70 capitalize mt-0.5">{user.role} profile</span>
                </div>
                <div className="relative group">
                  <div className="w-9 h-9 rounded-full bg-[#ffcc00] text-slate-900 font-extrabold flex items-center justify-center text-sm border border-yellow-450/40 cursor-pointer shadow-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Profile dropdown submenu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-100 shadow-xl py-2 z-50 invisible group-hover:visible hover:visible transition-all duration-200 origin-top-right">
                    {isCustomer ? (
                      <>
                        <Link to="/customer/dashboard" className="block px-4.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#023e2b] font-bold transition">Dashboard</Link>
                        <Link to="/customer/orders" className="block px-4.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#023e2b] font-bold transition">My Orders</Link>
                        <Link to="/customer/profile" className="block px-4.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#023e2b] font-bold transition">Profile Settings</Link>
                      </>
                    ) : isAdmin ? (
                      <>
                        <Link to="/admin/dashboard" className="block px-4.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#023e2b] font-bold transition">Admin Dashboard</Link>
                        <Link to="/admin/products" className="block px-4.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#023e2b] font-bold transition">Inventory Items</Link>
                        <Link to="/admin/banners" className="block px-4.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#023e2b] font-bold transition">Banners System</Link>
                      </>
                    ) : null}
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4.5 py-2 text-xs text-red-500 hover:bg-red-50 font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile menu toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-white hover:bg-white/10 transition cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── 3. Sub-Navbar Row: Yellow Category Button & Quick Links (Desktop) ── */}
      {!isAdmin && (
        <div className="bg-[#f8f9fa] border-b border-slate-200 py-1.5 hidden md:block shadow-sm">
          <div className="max-w-full w-full px-4 sm:px-8 lg:px-16 xl:px-24 flex items-center justify-between">
            <div className="flex items-center gap-6">
              
              {/* Yellow Categories Trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCatMenuOpen(!catMenuOpen)}
                  className="flex items-center gap-2 px-4.5 py-2 bg-[#ffcc00] hover:bg-[#e6b800] text-slate-900 rounded-xl text-xs font-black transition shadow-sm border border-yellow-400/20 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-slate-805" />
                  Shop By Category
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-700 transition-transform ${catMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {catMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
                    <button
                      onClick={() => handleCategorySelect(null)}
                      className="w-full text-left px-4.5 py-2.5 text-xs font-black text-slate-800 hover:bg-slate-50 hover:text-emerald-600 transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>🛒</span> All Categories
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleCategorySelect(cat._id)}
                        className="w-full text-left px-4.5 py-2 text-xs font-semibold text-slate-650 hover:bg-emerald-50/50 hover:text-emerald-700 transition flex items-center gap-2 cursor-pointer"
                      >
                        <span className="text-sm">
                          {cat.name.toLowerCase().includes('fruit') ? '🍎' :
                           cat.name.toLowerCase().includes('vegetable') ? '🥬' :
                           cat.name.toLowerCase().includes('dairy') ? '🥛' :
                           cat.name.toLowerCase().includes('bakery') ? '🍞' :
                           cat.name.toLowerCase().includes('beverage') ? '🧃' :
                           cat.name.toLowerCase().includes('pantry') ? '🥫' : '📁'}
                        </span>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Horizontal Category Navigation Bar */}
              <div className="flex items-center gap-5.5 select-none">
                {categories.slice(0, 7).map((cat) => {
                  const isActive = selectedCategory === cat._id;
                  return (
                    <button
                      key={cat._id}
                      onClick={() => handleCategorySelect(cat._id)}
                      className={`text-xs font-extrabold transition-colors cursor-pointer hover:text-[#023e2b] ${
                        isActive ? 'text-[#023e2b] border-b-2 border-[#023e2b] pb-0.5' : 'text-slate-650 hover:text-slate-900'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Store Hours */}
            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 select-none">
              <span className="text-slate-400">🕒</span> Store Hours: 8:00 AM - 9:00 PM
            </div>

          </div>
        </div>
      )}

      {/* Mobile Drawer Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 py-5 space-y-4 shadow-inner flex flex-col">
          
          {/* Mobile Search input */}
          {!isAdmin && (
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search supermarket..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>
          )}

          {/* Mobile Location Selector */}
          {!isAdmin && (
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-emerald-600" /> Deliver to:</span>
              <select
                value={deliveryLocation}
                onChange={handleLocationChange}
                className="bg-transparent border-none outline-none cursor-pointer text-emerald-700 font-extrabold focus:ring-0 p-0 text-xs"
              >
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
                <option value="Negombo">Negombo</option>
                <option value="Jaffna">Jaffna</option>
              </select>
            </div>
          )}

          {/* Menu links list */}
          <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  Sign Up
                </Link>
              </div>
            ) : isCustomer ? (
              <>
                <Link
                  to="/customer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-2.5 px-2 hover:bg-slate-50 rounded-lg transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/customer/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-2.5 px-2 hover:bg-slate-50 rounded-lg transition"
                >
                  My Orders
                </Link>
                <Link
                  to="/customer/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-2.5 px-2 hover:bg-slate-50 rounded-lg transition"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left py-2.5 px-2 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-650 transition cursor-pointer border-t border-slate-100 mt-2"
                >
                  Logout
                </button>
              </>
            ) : isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-2.5 px-2 hover:bg-slate-50 rounded-lg transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-2.5 px-2 hover:bg-slate-50 rounded-lg transition"
                >
                  Products Inventory
                </Link>
                <Link
                  to="/admin/banners"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-2.5 px-2 hover:bg-slate-50 rounded-lg transition"
                >
                  Promotional Banners
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left py-2.5 px-2 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-650 transition cursor-pointer border-t border-slate-100 mt-2"
                >
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}
