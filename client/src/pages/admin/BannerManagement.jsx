import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants.js';
import { toast } from 'react-toastify';
import { Trash2, Plus, Image as ImageIcon, ExternalLink, Layers } from 'lucide-react';
import { bannerService } from '../../services/bannerService.js';
import { productService } from '../../services/productService.js';
import Loader from '../../components/common/Loader.jsx';

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBanner, setNewBanner] = useState({ title: '', imageUrl: '', targetUrl: '', type: 'MAIN' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchBannersAndProducts = async () => {
    try {
      const [bannerRes, productRes] = await Promise.all([
        bannerService.getAllBanners(),
        productService.getProducts()
      ]);
      setBanners(bannerRes);
      setProducts(productRes.data || productRes);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannersAndProducts();
  }, []);

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('files', files[0]); // Only need one image for banner

    setUploading(true);
    try {
      const token = localStorage.getItem('mrmobi_token');
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      if (response.data && response.data.length > 0) {
        setNewBanner({ ...newBanner, imageUrl: response.data[0] });
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Image upload failed', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!newBanner.imageUrl) {
      toast.error('Image URL is required');
      return;
    }
    setSubmitting(true);
    try {
      await bannerService.createBanner(newBanner);
      toast.success('Banner added successfully');
      setNewBanner({ title: '', imageUrl: '', targetUrl: '', type: 'MAIN' });
      setShowForm(false);
      const bannerRes = await bannerService.getAllBanners();
      setBanners(bannerRes);
    } catch (error) {
      toast.error('Failed to add banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await bannerService.deleteBanner(id);
      toast.success('Banner deleted');
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const bannerTypes = [
    { value: 'MAIN', label: 'Main Carousel (Large)', desc: 'Large sliding banners at the top.' },
    { value: 'SECONDARY', label: 'Grid Banner (Small)', desc: 'Small banners in the 3-column grid.' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Marketing Banners</h1>
          <p className="text-xs text-slate-500 font-medium">Control the visual storytelling of your storefront.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-emerald-700 hover:shadow transition-all active:scale-[0.98]"
        >
          <Plus size={15} />
          <span>{showForm ? 'Close Form' : 'Create New Banner'}</span>
        </button>
      </div>

      {/* Form Area */}
      {showForm && (
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Configuration</h2>
              <button onClick={() => setShowForm(false)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium">Cancel</button>
           </div>
           <form onSubmit={handleAddBanner} className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Quick Fill from Inventory</label>
              <select
                className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800 cursor-pointer"
                onChange={(e) => {
                  const pId = e.target.value;
                  if (!pId) return;
                  const p = products.find(prod => prod.id.toString() === pId);
                  if (p) {
                    setNewBanner({ ...newBanner, title: p.name, imageUrl: p.imageUrl, targetUrl: `/product/${p.id}` });
                  }
                }}
              >
                <option value="">-- Choose a Product to Auto-fill --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Banner Placement Type *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                 {bannerTypes.map(type => (
                   <div 
                    key={type.value}
                    onClick={() => setNewBanner({ ...newBanner, type: type.value })}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col gap-0.5 ${
                      newBanner.type === type.value 
                      ? 'border-emerald-600 bg-emerald-50/30' 
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                    }`}
                   >
                      <div className="flex items-center gap-1.5">
                         <Layers size={13} className={newBanner.type === type.value ? 'text-emerald-600' : 'text-slate-400'} />
                         <span className="text-xs font-semibold text-slate-800">{type.label}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-tight">{type.desc}</p>
                   </div>
                 ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Upload Image or Paste URL *</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  className="flex-1 text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800"
                  placeholder="https://... or /uploads/..."
                  value={newBanner.imageUrl}
                  onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full sm:w-auto text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border file:border-emerald-100 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                />
              </div>
              {uploading && <p className="text-[10px] text-emerald-600 mt-1 font-bold animate-pulse">Uploading image...</p>}
              {newBanner.imageUrl && (
                <div className="mt-2 relative h-20 rounded-lg overflow-hidden border border-slate-150 bg-slate-50">
                  <img src={newBanner.imageUrl.startsWith('http') ? newBanner.imageUrl : `${API_BASE_URL.replace('/api', '')}${newBanner.imageUrl}`} alt="Preview" className="h-full w-full object-contain" />
                </div>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Display Title (Optional)</label>
              <input
                type="text"
                className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800"
                placeholder="Summer Sale 2024"
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Navigation Link (Optional)</label>
              <input
                type="text"
                className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800"
                placeholder="/products?category=Mobiles"
                value={newBanner.targetUrl}
                onChange={(e) => setNewBanner({ ...newBanner, targetUrl: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 pt-1.5 flex justify-end">
              <button 
                type="submit" 
                disabled={submitting} 
                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Publish Banner'}
              </button>
            </div>
           </form>
        </div>
      )}

      {/* Grid Area */}
      <div className="space-y-6">
        {['MAIN', 'SECONDARY'].map(type => {
          const typeBanners = banners.filter(b => (type === 'MAIN' ? (b.type === 'MAIN' || !b.type) : b.type === type));
          return (
            <div key={type} className="space-y-3">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="text-emerald-500" size={16} />
                <h2 className="text-sm font-bold text-slate-900">
                  {type === 'MAIN' ? 'Main Carousel Banners' : 'Secondary Grid Banners'}
                </h2>
                <span className="ml-2 px-1.5 py-0.2 bg-slate-150 rounded text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                   {typeBanners.length} Active
                </span>
              </div>

              {loading ? (
                <Loader />
              ) : typeBanners.length === 0 ? (
                <div className="rounded-xl bg-slate-50/50 border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-xs text-slate-400 font-medium italic">No {type.toLowerCase()} banners configured yet.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {typeBanners.map((banner) => (
                    <div key={banner.id} className="group bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                      <div className="relative h-24 bg-slate-50">
                        <img src={banner.imageUrl} alt={banner.title || 'Banner'} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="absolute right-2 top-2 h-7 w-7 rounded-lg bg-white/95 backdrop-blur-sm flex items-center justify-center text-rose-500 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                          title="Delete Banner"
                        >
                          <Trash2 size={13} />
                        </button>
                        <div className="absolute left-2 top-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[8px] font-bold text-white uppercase tracking-wider">
                           {type}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-xs text-slate-800 truncate mb-0.5" title={banner.title}>
                          {banner.title || 'Untitled Banner'}
                        </h3>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                           <ExternalLink size={10} />
                           <span className="truncate" title={banner.targetUrl}>{banner.targetUrl || 'No Target Link'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
