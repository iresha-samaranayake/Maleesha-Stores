import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { login, user, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === 'admin' ? '/admin' : '/customer/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);


  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      showToast('Welcome to Maleesha Stores!', 'success');
      login(response.data);
    } catch (err) {
      console.error('Login error:', err);
      showToast(err.response?.data?.message || 'Invalid credentials. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockGoogleLogin = () => {
    showToast('Google login integration coming soon!', 'info');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="text-sm font-semibold tracking-wide">Validating session...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen">

      {/* Left side: Premium Grocery Lifestyle Illustration (Visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center shrink-0">
        <div
          className="absolute inset-0 bg-cover bg-center select-none filter brightness-[0.75] contrast-[1.05]"
          style={{ backgroundImage: "url('/assets/login_lifestyle_illustration.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/60 to-transparent mix-blend-multiply" />

        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-[80px] animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-teal-500/10 blur-[90px] animate-float pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 p-12 max-w-lg space-y-6 text-white"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4" />
            100% Quality & Fresh
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white font-sans md:text-5xl">
            Healthy living, <br />
            delivered to your doorstep.
          </h1>

          <p className="text-slate-300 text-base leading-relaxed font-light">
            Skip the queues! Discover the finest handpicked farm-fresh vegetables, dairy, pantry staples, and baked treats. Delivered straight to your home.
          </p>

          <div className="flex items-center gap-6 pt-4 border-t border-white/10 text-xs font-semibold text-slate-400">
            <div>
              <p className="text-white text-lg font-black">20 min</p>
              <p>Average Delivery</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-white text-lg font-black">15,000+</p>
              <p>Happy Customers</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side: Modern glass login card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md bg-slate-900/65 border border-white/10 rounded-[28px] p-8 md:p-10 shadow-2xl backdrop-blur-xl space-y-8 relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

          <div className="text-center space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <ShoppingBag className="w-5.5 h-5.5" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">Maleesha Stores</span>
            </Link>
            <h2 className="text-2xl font-black text-white tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-400 font-semibold">Enter your credentials to access your portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: null }));
                  }}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-950/40 border ${validationErrors.email ? 'border-red-500' : 'border-slate-800 hover:border-slate-700'
                    } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <Link
                  to="#"
                  onClick={() => showToast('Password reset link coming soon!', 'warning')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  readOnly
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: null }));
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full pl-11 pr-11 py-3 bg-slate-950/40 border ${validationErrors.password ? 'border-red-500' : 'border-slate-800 hover:border-slate-700'
                    } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-xs text-red-400 font-medium">{validationErrors.password}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-950/40 text-emerald-500 focus:ring-emerald-500 transition cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 text-xs font-bold text-slate-400 cursor-pointer select-none">
                Remember my email
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
              <span className="bg-slate-950/20 px-3">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleMockGoogleLogin}
            className="w-full flex items-center justify-center gap-2 py-3 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition active:scale-[0.98] cursor-pointer bg-slate-950/20"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.53 15.02 1 12 1 7.24 1 3.21 3.73 1.25 7.69l3.85 2.99C6.01 7.42 8.78 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.97 3.7-8.62z" />
              <path fill="#FBBC05" d="M5.1 10.68c-.24-.73-.38-1.5-.38-2.31s.14-1.58.38-2.31L1.25 3.07C.45 4.67 0 6.46 0 8.37s.45 3.7 1.25 5.3l3.85-2.99z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.73-2.89c-1.04.7-2.38 1.11-4.23 1.11-3.22 0-5.99-2.38-6.96-5.64l-3.85 2.99C3.21 20.27 7.24 23 12 23z" />
            </svg>
            Google Credentials
          </button>

          <div className="text-center text-xs font-semibold text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold transition">
              Create one now
            </Link>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
