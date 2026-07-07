import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, CheckCircle, Clock, XCircle, Image as ImageIcon } from 'lucide-react';

export default function AdminBillsView({ newBills }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/bills');
      setBills(res.data.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [newBills]); // Refetch when a new bill comes in

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bills/${id}`, { status });
      fetchBills();
    } catch (error) {
      console.error('Error updating bill status:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'Processing': return <RefreshCw className="w-5 h-5 text-blue-500" />;
      case 'Completed': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'Cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Customer Bills</h2>
          <p className="text-sm text-slate-500 mt-1">Manage grocery bills uploaded by customers.</p>
        </div>
        <button 
          onClick={fetchBills}
          className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="p-4 font-semibold">Customer</th>
              <th className="p-4 font-semibold">Phone</th>
              <th className="p-4 font-semibold">Bill Image</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bills.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>No bills uploaded yet.</p>
                </td>
              </tr>
            ) : (
              bills.map((bill) => (
                <tr key={bill._id} className="hover:bg-slate-50 transition group">
                  <td className="p-4 font-medium text-slate-800">{bill.customerName}</td>
                  <td className="p-4 text-slate-600">{bill.customerPhone}</td>
                  <td className="p-4">
                    <a 
                      href={bill.imageUrl.startsWith('http') ? bill.imageUrl : `http://localhost:5000${bill.imageUrl}`} 
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition"
                    >
                      <ImageIcon className="w-4 h-4" />
                      View Bill
                    </a>
                  </td>
                  <td className="p-4 text-slate-500 text-sm">
                    {new Date(bill.createdAt).toLocaleDateString()} <br/>
                    <span className="text-xs">{new Date(bill.createdAt).toLocaleTimeString()}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusClass(bill.status)}`}>
                      {getStatusIcon(bill.status)}
                      {bill.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={bill.status}
                      onChange={(e) => updateStatus(bill._id, e.target.value)}
                      className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
