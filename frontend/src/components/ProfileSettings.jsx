import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Lock, Phone, MapPin, Eye, EyeOff,
  Save, ArrowLeft, Loader2, CheckCircle, ShieldCheck, ShoppingBag
} from 'lucide-react';
import axios from 'axios';

export default function ProfileSettings() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  if (!user) {
    return null;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const body = { name, email, phone, address };
      if (newPassword) body.password = newPassword;
      const { data } = await axios.put('/api/auth/profile', body, config);
      login(data);
      setSuccess(true);
      setNewPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/?logout=true');
  };

  return (
    <div className="max-w-full w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard')}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
      </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar — Profile Card */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Avatar Banner */}
              <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-500 relative">
                <div className="absolute -bottom-8 left-6">
                  <div className="w-16 h-16 rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-2xl">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 pt-12 pb-6">
                <h2 className="text-lg font-extrabold text-slate-900">{user.name}</h2>
                <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
                <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold ${user.role === 'admin' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {user.role === 'admin' ? '👑 Administrator' : '🛒 Customer'}
                </span>
                {phone && (
                  <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {phone}
                  </div>
                )}
                {address && (
                  <div className="flex items-start gap-2 mt-2 text-sm text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed">{address}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100 p-4">
                <nav className="space-y-1">
                  {[
                    { id: 'personal', label: 'Personal Info', icon: User },
                    { id: 'contact', label: 'Contact & Address', icon: MapPin },
                    { id: 'security', label: 'Security', icon: Lock },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                          activeTab === tab.id
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <form onSubmit={handleSave}>
              {/* Success / Error Banners */}
              {success && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium mb-5 animate-fade-in">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  Profile updated successfully!
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-5">
                  {error}
                </div>
              )}

              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Update your name and email address</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact & Address Tab */}
              {activeTab === 'contact' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Contact & Address</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Your phone number is used to match your orders</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder="+94 77 123 4567"
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">💡 Must match the phone used in your orders to see history</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Default Delivery Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          rows={3}
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                          placeholder="123 Main Street, Colombo 07"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Security</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Leave blank to keep your current password</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="Enter new password (min 6 chars)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
                    <p className="font-semibold mb-1">Account Role: {user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                    <p className="text-amber-600 text-xs">Your role determines your access level and cannot be changed here.</p>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-70 shadow-md shadow-emerald-500/20"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
  );
}
