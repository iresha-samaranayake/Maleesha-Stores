import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import UploadBillModal from './UploadBillModal';
import CheckoutForm from './CheckoutForm';
import { FileImage } from 'lucide-react';

export default function CustomerLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUploadBillOpen, setIsUploadBillOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative">
      <Navbar
        onCartOpen={() => setIsCartOpen(true)}
        onUploadBillOpen={() => setIsUploadBillOpen(true)}
      />
      <main className="flex-1 flex flex-col pb-16">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Action Button (FAB) to Upload Grocery List Receipt */}
      <button
        onClick={() => setIsUploadBillOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-full shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group border border-emerald-500/20"
        title="Upload manual grocery list receipt"
      >
        <FileImage className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
        
        {/* Hover Tooltip */}
        <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all origin-right bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-md">
          Upload Grocery List 📝
        </span>
      </button>
      
      {/* Shared drawers/modals for customer quick actions */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
      <CheckoutForm isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <UploadBillModal isOpen={isUploadBillOpen} onClose={() => setIsUploadBillOpen(false)} />
    </div>
  );
}
