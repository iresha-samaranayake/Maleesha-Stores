import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader2, Users, Search, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function AdminUsers() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/auth/users', config);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      showToast('Error loading customers list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300">
      
      {/* Search Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="🔍 Search customers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          />
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl border border-slate-200 shrink-0">
          <Users className="w-4 h-4" />
          <span>Total Members: {users.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Fetching registered customers...</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Customer Details</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Fulfillment Address</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Role Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/30 transition">
                      {/* Name Avatar */}
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm uppercase shrink-0">
                          {item.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.email}</p>
                        </div>
                      </td>
                      
                      {/* Contact Info */}
                      <td className="p-4 space-y-1">
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {item.email}
                        </p>
                        {item.phone && (
                          <p className="text-xs text-slate-600 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {item.phone}
                          </p>
                        )}
                      </td>

                      {/* Delivery Address */}
                      <td className="p-4 max-w-xs truncate">
                        {item.address ? (
                          <span className="text-xs text-slate-600 flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="truncate leading-normal">{item.address}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300 italic">No address provided</span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="p-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          item.role === 'admin' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.role}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-slate-400 font-medium">
                      <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      No customers match your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
