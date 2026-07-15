import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import AuthLayout from './components/AuthLayout';
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';

// Protectors
import { ProtectedRoute, RoleProtectedRoute } from './components/ProtectedRoute';

// Guest/Auth Pages
import Login from './components/Login';
import Register from './components/Register';

// Public Homepage
import Homepage from './components/Homepage';

// Customer Pages
import CustomerDashboard from './components/CustomerDashboard';
import CustomerOrders from './components/CustomerOrders';
import CustomerCart from './components/CustomerCart';
import CustomerCheckout from './components/CustomerCheckout';
import ProfileSettings from './components/ProfileSettings';
import PaymentGateway from './components/PaymentGateway';

// Admin Pages
import AdminDashboard from './components/AdminDashboard';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import AdminUsers from './components/AdminUsers';
import AdminCategories from './components/AdminCategories';
import AdminBanners from './components/AdminBanners';
import AdminReports from './components/AdminReports';

// Home Redirect Component
function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/customer/dashboard" replace />;
}

function MainAppContent() {
  return (
    <Routes>
      {/* Public routes wrapped in CustomerLayout */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/customer/cart" element={<CustomerCart />} />
        <Route path="/customer/checkout" element={<CustomerCheckout />} />
        <Route path="/checkout/payment-gateway" element={<PaymentGateway />} />
      </Route>

      {/* Guest/Auth routes wrapped in AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Customer Protected routes wrapped in CustomerLayout */}
      <Route element={<RoleProtectedRoute allowedRoles={['customer']} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/profile" element={<ProfileSettings />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
        </Route>
      </Route>

      {/* Admin Protected routes wrapped in AdminLayout */}
      <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/banners" element={<AdminBanners />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/profile" element={<ProfileSettings />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <MainAppContent />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
