import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  ShoppingBag, LogIn, LogOut, ShoppingCart, Menu, X
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const isCustomer = user && user.role === 'customer';
  const isAdmin = user && user.role === 'admin';

  return (
    <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-100/80 shrink-0">
      <div className="max-w-full w-full px-4 sm:px-8 lg:px-16 xl:px-24">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-800 text-base tracking-tight">Maleesha Stores</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              /* Before login: Logo and Login button only */
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/15"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            ) : isCustomer ? (
              /* After Customer login: Dashboard, Shop, Orders, Cart, Profile, Logout */
              <>
                <Link
                  to="/customer/dashboard"
                  className={`text-xs font-bold transition ${location.pathname === '/customer/dashboard' && !location.search.includes('tab=shop') ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/customer/dashboard?tab=shop"
                  className={`text-xs font-bold transition ${location.search.includes('tab=shop') ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Shop
                </Link>
                <Link
                  to="/customer/orders"
                  className={`text-xs font-bold transition ${location.pathname === '/customer/orders' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Orders
                </Link>
                <Link
                  to="/customer/cart"
                  className={`relative text-xs font-bold transition flex items-center gap-1 ${location.pathname === '/customer/cart' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  Cart
                  {totalItems > 0 && (
                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <Link
                  to="/customer/profile"
                  className={`text-xs font-bold transition ${location.pathname === '/customer/profile' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : isAdmin ? (
              /* After Admin login: Dashboard, Products, Orders, Customers, Categories, Reports, Logout */
              <>
                <Link
                  to="/admin/dashboard"
                  className={`text-xs font-bold transition ${location.pathname === '/admin/dashboard' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/products"
                  className={`text-xs font-bold transition ${location.pathname === '/admin/products' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Products
                </Link>
                <Link
                  to="/admin/orders"
                  className={`text-xs font-bold transition ${location.pathname === '/admin/orders' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Orders
                </Link>
                <Link
                  to="/admin/users"
                  className={`text-xs font-bold transition ${location.pathname === '/admin/users' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Customers
                </Link>
                <Link
                  to="/admin/categories"
                  className={`text-xs font-bold transition ${location.pathname === '/admin/categories' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Categories
                </Link>
                <Link
                  to="/admin/reports"
                  className={`text-xs font-bold transition ${location.pathname === '/admin/reports' ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Reports
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : null}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 py-4 space-y-3 shadow-inner flex flex-col">
          {!user ? (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
            >
              Login
            </Link>
          ) : isCustomer ? (
            <>
              <Link
                to="/customer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1 transition"
              >
                Dashboard
              </Link>
              <Link
                to="/customer/dashboard?tab=shop"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1 transition"
              >
                Shop
              </Link>
              <Link
                to="/customer/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1 transition"
              >
                Orders
              </Link>
              <Link
                to="/customer/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1 transition flex items-center gap-1.5"
              >
                Cart
                {totalItems > 0 && (
                  <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link
                to="/customer/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1 transition"
              >
                Profile Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left py-2 text-sm font-bold text-red-500 hover:text-red-600 transition cursor-pointer border-t border-slate-100 pt-2.5"
              >
                Logout
              </button>
            </>
          ) : isAdmin ? (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1 transition"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/products"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1 transition"
              >
                Products
              </Link>
              <Link
                to="/admin/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1 transition"
              >
                Orders
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1 transition"
              >
                Customers
              </Link>
              <Link
                to="/admin/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1 transition"
              >
                Categories
              </Link>
              <Link
                to="/admin/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1 transition"
              >
                Reports
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left py-2 text-sm font-bold text-red-500 hover:text-red-600 transition cursor-pointer border-t border-slate-100 pt-2.5"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>
      )}

    </nav>
  );
}
