import React, { useContext } from 'react';
import { ShoppingBag, Search, ShieldCheck } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import logoImg from '../assets/logo.png';

export default function Navbar({ onCartOpen, onAdminToggle, isAdminView, searchQuery, setSearchQuery }) {
  const { totalItems } = useContext(CartContext);

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          
          {/* Logo & Store Name */}
          <div className="flex items-center cursor-pointer" onClick={() => onAdminToggle(false)}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-200">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="ml-3">
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                Maleesha Stores
              </span>
              <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider block">
                Fresh Grocery
              </span>
            </div>
          </div>

          {/* Search bar (only show when not in admin view) */}
          {!isAdminView && (
            <div className="flex-1 max-w-md mx-4 relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fresh groceries (e.g. apple, rice)..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm bg-slate-50 focus:bg-white"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Admin View Toggle */}
            <button
              onClick={() => onAdminToggle(!isAdminView)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                isAdminView
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">{isAdminView ? 'Customer Mode' : 'Admin Panel'}</span>
            </button>

            {/* Cart Trigger */}
            {!isAdminView && (
              <button
                onClick={onCartOpen}
                className="relative flex items-center justify-center p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition shadow-sm"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search input (under header on small screens) */}
        {!isAdminView && (
          <div className="pb-4 relative sm:hidden">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groceries..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm bg-slate-50 focus:bg-white"
            />
          </div>
        )}
      </div>
    </nav>
  );
}
