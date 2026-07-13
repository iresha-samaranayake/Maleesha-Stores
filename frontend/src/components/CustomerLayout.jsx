import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import UploadBillModal from './UploadBillModal';
import CheckoutForm from './CheckoutForm';
import { FileImage } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

export default function CustomerLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUploadBillOpen, setIsUploadBillOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    if (user && user.role === 'customer') {
      const intendedActionStr = sessionStorage.getItem('intendedAction');
      if (intendedActionStr) {
        try {
          const action = JSON.parse(intendedActionStr);
          if (action.type === 'ADD_TO_CART' && action.product) {
            addToCart(action.product);
            showToast(`Added ${action.product.name} to cart!`, 'success');
          } else if (action.type === 'UPLOAD_BILL') {
            setIsUploadBillOpen(true);
            showToast('Opening list uploader...', 'info');
          }
        } catch (e) {
          console.error('Error executing intended action:', e);
        } finally {
          sessionStorage.removeItem('intendedAction');
        }
      }
    }
  }, [user, addToCart, showToast]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative">
      <Navbar
        onCartOpen={() => setIsCartOpen(true)}
        onUploadBillOpen={() => {
          if (!user) {
            sessionStorage.setItem('intendedAction', JSON.stringify({ type: 'UPLOAD_BILL' }));
            showToast('Please log in to upload your grocery list', 'info');
            navigate('/login');
          } else {
            setIsUploadBillOpen(true);
          }
        }}
      />
      <main className="flex-1 flex flex-col pb-16">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Action Button (FAB) to Upload Grocery List Receipt */}
      <button
        onClick={() => {
          if (!user) {
            sessionStorage.setItem('intendedAction', JSON.stringify({ type: 'UPLOAD_BILL' }));
            showToast('Please log in to upload your grocery list', 'info');
            navigate('/login');
          } else {
            setIsUploadBillOpen(true);
          }
        }}
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
          if (!user) {
            showToast('Please log in or sign up to complete checkout', 'info');
            navigate('/login');
          } else {
            setIsCheckoutOpen(true);
          }
        }}
      />
      <CheckoutForm isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <UploadBillModal isOpen={isUploadBillOpen} onClose={() => setIsUploadBillOpen(false)} />
    </div>
  );
}
