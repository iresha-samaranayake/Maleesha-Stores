import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import CheckoutForm from './components/CheckoutForm';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import UploadBillModal from './components/UploadBillModal';

function MainAppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isUploadBillOpen, setIsUploadBillOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdminToggle = (mode) => {
    setIsAdminView(mode);
    // Reset selections when shifting views
    setSelectedCategory(null);
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        onCartOpen={() => setIsCartOpen(true)}
        onUploadBillOpen={() => setIsUploadBillOpen(true)}
        onAdminToggle={handleAdminToggle}
        isAdminView={isAdminView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-1 bg-slate-50">
        {isAdminView ? (
          <AdminDashboard onBackToShop={() => handleAdminToggle(false)} />
        ) : (
          <>
            {/* Friendly store welcome banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-800 text-white py-14 px-4 sm:px-6 lg:px-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)] opacity-90 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_60%)] opacity-90 pointer-events-none" />
              <div className="relative max-w-6xl mx-auto text-center space-y-5">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/80 backdrop-blur rounded-full text-xs font-semibold tracking-wider uppercase border border-white/15">
                  🍃 Pure, Fresh & Local
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white max-w-3xl mx-auto">
                  Maleesha Stores
                </h1>
                <p className="mx-auto max-w-2xl text-sm sm:text-base text-emerald-100/85 leading-relaxed">
                  Your local neighborhood family grocery store. Enjoy fresh produce, dairy, bakery products, and daily essentials — delivered with care and great value.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button className="inline-flex items-center justify-center rounded-full bg-white text-emerald-900 px-6 py-3 text-sm font-semibold shadow-lg shadow-emerald-900/15 hover:bg-emerald-50 transition">
                    Shop Now
                  </button>
                  <button className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 text-white px-6 py-3 text-sm font-semibold hover:bg-white/15 transition">
                    Browse Categories
                  </button>
                </div>
              </div>
            </div>

            {/* Category tabs scroll */}
            <CategoryBar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Catalog Grid */}
            <ProductGrid
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
            />
          </>
        )}
      </main>

      <Footer />

      {/* Cart Slider */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Dialog Modal */}
      <CheckoutForm
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Upload Bill Modal */}
      <UploadBillModal 
        isOpen={isUploadBillOpen}
        onClose={() => setIsUploadBillOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainAppContent />
    </CartProvider>
  );
}
