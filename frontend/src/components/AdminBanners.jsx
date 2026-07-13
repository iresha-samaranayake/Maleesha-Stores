import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, Edit, Trash2, X, Loader2, Image, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react';
import axios from 'axios';

export default function AdminBanners() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form/Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    type: 'Main Carousel',
    target_link: '',
    is_active: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `http://localhost:5000${url}`;
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/banners/admin', config);
      setBanners(res.data);
    } catch (err) {
      console.error('Error fetching admin banners:', err);
      showToast('Error loading banner list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBanners();
    }
  }, [user]);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setBannerForm({
      type: 'Main Carousel',
      target_link: '',
      is_active: true
    });
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowForm(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner._id);
    setBannerForm({
      type: banner.type,
      target_link: banner.target_link || '',
      is_active: banner.is_active
    });
    setSelectedFile(null);
    setPreviewUrl(banner.image_url);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleActive = async (banner) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const updatedStatus = !banner.is_active;
      
      const res = await axios.put(`/api/banners/${banner._id}`, { is_active: updatedStatus }, config);
      
      setBanners(banners.map(b => b._id === banner._id ? res.data : b));
      showToast(`Banner marked as ${updatedStatus ? 'Active' : 'Inactive'}`, 'success');
    } catch (err) {
      console.error('Error toggling banner status:', err);
      showToast('Failed to update banner status', 'error');
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();

    if (!editingBanner && !selectedFile) {
      showToast('Please upload a banner image file', 'error');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('type', bannerForm.type);
      formData.append('target_link', bannerForm.target_link);
      formData.append('is_active', bannerForm.is_active);
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingBanner) {
        const res = await axios.put(`/api/banners/${editingBanner}`, formData, config);
        setBanners(banners.map(b => b._id === editingBanner ? res.data : b));
        showToast('Banner updated successfully!', 'success');
      } else {
        const res = await axios.post('/api/banners', formData, config);
        setBanners([res.data, ...banners]);
        showToast('Banner uploaded successfully!', 'success');
      }
      setShowForm(false);
    } catch (err) {
      console.error('Error saving banner:', err);
      showToast(err.response?.data?.message || 'Error occurred while saving banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/banners/${id}`, config);
      setBanners(banners.filter(b => b._id !== id));
      showToast('Banner removed successfully', 'success');
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting banner:', err);
      showToast('Failed to delete banner', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Banner Campaigns</h1>
          <p className="text-xs text-slate-500 mt-1">Manage public homepage carousel slides and grid promotions.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Campaign Banner
        </button>
      </div>

      {/* Main layout lists */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center justify-center text-slate-400 gap-2 shadow-sm min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="text-xs font-semibold">Loading campaign data...</span>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center justify-center text-slate-400 gap-3 shadow-sm min-h-[300px]">
          <Image className="w-12 h-12 stroke-[1.2] text-slate-300" />
          <h3 className="font-bold text-slate-700 text-sm">No promotional banners</h3>
          <p className="text-xs max-w-xs text-center leading-relaxed">
            Upload custom banners to customize your grocery homepage layout. The public store is currently running on default layout slides.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-2 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl transition font-bold"
          >
            Create Your First Banner
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Target Destination</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {banners.map((banner) => (
                  <tr key={banner._id} className="hover:bg-slate-50/50 transition">
                    
                    {/* Preview Thumbnail */}
                    <td className="px-6 py-4">
                      <div className="w-24 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200/60 shrink-0">
                        <img
                          src={getImageUrl(banner.image_url)}
                          alt="Banner Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        banner.type === 'Main Carousel'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {banner.type}
                      </span>
                    </td>

                    {/* Target Link */}
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {banner.target_link ? (
                        <span className="flex items-center gap-1 hover:text-emerald-600 transition">
                          {banner.target_link}
                          <a href={banner.target_link} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-medium">None</span>
                      )}
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className="flex items-center gap-1.5 focus:outline-none transition-all cursor-pointer"
                        title={banner.is_active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {banner.is_active ? (
                          <>
                            <ToggleRight className="w-8 h-8 text-emerald-500 fill-emerald-500/10" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-8 h-8 text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(banner)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-xl transition cursor-pointer"
                          title="Edit Banner"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(banner._id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload/Edit Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold text-slate-800">
                {editingBanner ? 'Edit Campaign Banner' : 'Upload Campaign Banner'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBanner} className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
              
              {/* Type Select */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Banner Category</label>
                <select
                  value={bannerForm.type}
                  onChange={(e) => setBannerForm({ ...bannerForm, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 outline-none transition"
                >
                  <option value="Main Carousel">Main Carousel (Large Top Slider)</option>
                  <option value="Small Promo">Small Promo (Grid Row Cards)</option>
                </select>
              </div>

              {/* Destination URL */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Destination Target Link</label>
                <input
                  type="text"
                  value={bannerForm.target_link}
                  onChange={(e) => setBannerForm({ ...bannerForm, target_link: e.target.value })}
                  placeholder="e.g. /?category=fresh-fruits-id or https://example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 outline-none transition"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Link destination when clicked. Supports internal routes or absolute external URLs.</p>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between py-2 border-y border-slate-100 text-left">
                <div>
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Banner Visibility Status</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Turn promotions on/off immediately without deleting data.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBannerForm({ ...bannerForm, is_active: !bannerForm.is_active })}
                  className="focus:outline-none transition cursor-pointer"
                >
                  {bannerForm.is_active ? (
                    <ToggleRight className="w-10 h-10 text-emerald-500 fill-emerald-500/10" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-slate-300" />
                  )}
                </button>
              </div>

              {/* Image Uploader */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Upload Banner Graphic</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="banner-file"
                />
                
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500/80 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50/50 transition flex flex-col items-center justify-center gap-2.5 min-h-[160px]"
                >
                  {previewUrl ? (
                    <div className="relative w-full max-h-[140px] overflow-hidden rounded-xl">
                      <img src={getImageUrl(previewUrl)} alt="Upload preview" className="w-full h-full object-contain mx-auto" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-650 text-white rounded-lg shadow transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Image className="w-10 h-10 text-slate-350 stroke-[1.2]" />
                      <div>
                        <p className="text-xs text-slate-700 font-bold">Choose a file to upload</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">Supports PNG, JPG, JPEG, or WEBP up to 5MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 text-xs font-bold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingBanner ? 'Save Changes' : 'Upload Banner'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Remove Campaign Banner</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete this promotional banner? This action will permanently remove the data and media from the server.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                Keep Banner
              </button>
              <button
                onClick={() => handleDeleteBanner(deleteConfirmId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
