import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// ProtectedRoute — ensures user is authenticated. If not, redirect to /login.
export const ProtectedRoute = ({ children }) => {
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

  return children ? children : <Outlet />;
};

// RoleProtectedRoute — ensures user is authenticated AND matches the role requirements.
export const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const { showToast } = useToast();

  const userRole = user?.role ? user.role.toLowerCase() : '';
  const normalizedRoles = allowedRoles.map(r => r.toLowerCase());
  const isAuthorized = user && normalizedRoles.includes(userRole);

  useEffect(() => {
    if (!loading && user && !isAuthorized) {
      if (userRole === 'customer') {
        showToast('Access Denied', 'error');
      }
    }
  }, [user, loading, isAuthorized, userRole, showToast]);

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

  if (!isAuthorized) {
    if (userRole === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    } else if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};
