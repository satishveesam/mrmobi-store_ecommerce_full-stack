import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2, Plus, Sparkles, Tag, Trash2, Home } from 'lucide-react';

export default function HomepageSettings() {
  const cachedSettings = (() => {
    try {
      const data = localStorage.getItem('mrmobi_cached_homepage_settings');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  const [loading, setLoading] = useState(cachedSettings === null);

  // Announcement state
  const [announcementActive, setAnnouncementActive] = useState(cachedSettings?.announcementActive || false);
  const [announcementText, setAnnouncementText] = useState(cachedSettings?.announcementText || '');
  const [announcementTheme, setAnnouncementTheme] = useState(cachedSettings?.announcementTheme || 'emerald');
  const [announcementLink, setAnnouncementLink] = useState(cachedSettings?.announcementLink || '');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Product selector and catalog list state
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  // Explore Collections state
  const [adminCollections, setAdminCollections] = useState(cachedSettings?.adminCollections || []);
  const [savingCollections, setSavingCollections] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);

  // Load settings
  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        if (!cachedSettings) {
          setLoading(true);
        }
        const [announRes, colRes, prodRes] = await Promise.all([
          api.get('/products/settings/announcement').catch(() => null),
          api.get('/products/settings/explore-collections').catch(() => null),
          api.get('/products').catch(() => null)
        ]);

        const freshAnnounActive = announRes?.data?.active || false;
        const freshAnnounText = announRes?.data?.text || '';
        const freshAnnounTheme = announRes?.data?.theme || 'emerald';
        const freshAnnounLink = announRes?.data?.link || '';
        const freshCollections = colRes?.data || [];

        setAnnouncementActive(freshAnnounActive);
        setAnnouncementText(freshAnnounText);
        setAnnouncementTheme(freshAnnounTheme);
        setAnnouncementLink(freshAnnounLink);
        setAdminCollections(freshCollections);

        if (prodRes && prodRes.data) {
          setProducts(prodRes.data);
          const match = freshAnnounLink?.match(/\/product\/(\d+)/);
          if (match) {
            setSelectedProductId(match[1]);
          }
        }

        const freshData = {
          announcementActive: freshAnnounActive,
          announcementText: freshAnnounText,
          announcementTheme: freshAnnounTheme,
          announcementLink: freshAnnounLink,
          adminCollections: freshCollections
        };
        localStorage.setItem('mrmobi_cached_homepage_settings', JSON.stringify(freshData));
      } catch (err) {
        console.error('Failed to load homepage settings', err);
        toast.error('Failed to load configurations.');
      } finally {
        setLoading(false);
      }
    };

    loadAllSettings();
  }, []);

  const handleProductSelectChange = (productId) => {
    setSelectedProductId(productId);
    if (productId) {
      setAnnouncementLink(`/product/${productId}`);
      const selectedProd = products.find(p => String(p.id) === String(productId));
      if (selectedProd) {
        setAnnouncementText(`🔥 Hot Deal: Buy ${selectedProd.name} now at best price!`);
      }
    } else {
      setAnnouncementLink('');
    }
  };

  const handleSaveAnnouncementSettings = async () => {
    setSavingAnnouncement(true);
    try {
      await api.post('/admin/settings/announcement', {
        active: announcementActive,
        text: announcementText,
        theme: announcementTheme,
        link: announcementLink
      });
      toast.success('Announcement ribbon saved successfully!');

      const freshData = {
        announcementActive,
        announcementText,
        announcementTheme,
        announcementLink,
        adminCollections
      };
      localStorage.setItem('mrmobi_cached_homepage_settings', JSON.stringify(freshData));
    } catch (err) {
      console.error(err);
      toast.error('Failed to save announcement settings.');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleAdminCollectionChange = (idx, field, value) => {
    setAdminCollections(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleCollectionImageUpload = async (idx, e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingIdx(idx);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'deidbiy4i';
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'mrmobi_store';

      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('upload_preset', uploadPreset);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      if (response.data && response.data.secure_url) {
        handleAdminCollectionChange(idx, 'image', response.data.secure_url);
        toast.success('Collection image uploaded successfully!');
      }
    } catch (error) {
      console.error('Cloudinary upload failed', error);
      toast.error('Failed to upload image to Cloudinary');
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleAddNewCollection = () => {
    setAdminCollections(prev => [
      ...prev,
      {
        id: prev.length + 1,
        title: '',
        image: ''
      }
    ]);
    toast.info('New collection added to configure!');
  };

  const handleRemoveCollection = (idx) => {
    setAdminCollections(prev => {
      const filtered = prev.filter((_, i) => i !== idx);
      return filtered.map((col, i) => ({ ...col, id: i + 1 }));
    });
    toast.warning('Collection slot removed.');
  };

  const handleSaveExploreCollections = async () => {
    setSavingCollections(true);
    try {
      await api.post('/admin/settings/explore-collections', adminCollections);
      toast.success('Explore collections saved successfully!');
      
      const freshData = {
        announcementActive,
        announcementText,
        announcementTheme,
        announcementLink,
        adminCollections
      };
      localStorage.setItem('mrmobi_cached_homepage_settings', JSON.stringify(freshData));
    } catch (err) {
      console.error(err);
      toast.error('Failed to save explore collections.');
    } finally {
      setSavingCollections(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-650" />
        <p className="text-slate-500 font-bold animate-pulse">Syncing homepage configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Home className="w-7 h-7 text-amber-600" />
          <span>Homepage Page Settings</span>
        </h1>
        <p className="text-[9px] sm:text-sm text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          Manage dynamic promotion alerts and featured category showcase
        </p>
      </div>

      {/* Dynamic Announcement Ribbon Card */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-sm transition-all overflow-hidden border-t-2 border-t-indigo-600 p-4 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider leading-none">📢 Dynamic Announcement Ribbon</h3>
            <p className="text-[8px] text-slate-400 font-bold mt-0.5">Manage live homepage promo bars and alerts</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-150">
          <span className="text-[10px] font-black text-slate-650 uppercase tracking-wider">Live Active Status</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={announcementActive}
              onChange={(e) => setAnnouncementActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-650"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
              Ribbon Text Message
            </label>
            <input
              type="text"
              placeholder="e.g. 🎉 Special Offer: Flat 10% OFF today!"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Pin to Catalog Product</span>
              <span className="text-[7px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Quick Select</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductSelectChange(e.target.value)}
              className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white text-slate-800"
            >
              <option value="">-- Choose Product to Promote --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.price})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
              Redirect Link URL (Auto-set or Custom)
            </label>
            <input
              type="text"
              placeholder="e.g. /products or external URL"
              value={announcementLink}
              onChange={(e) => {
                setAnnouncementLink(e.target.value);
                const match = e.target.value.match(/\/product\/(\d+)/);
                if (match) {
                  setSelectedProductId(match[1]);
                } else {
                  setSelectedProductId('');
                }
              }}
              className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white text-slate-800"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
            Ribbon Theme Color Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-50 text-emerald-800 border-emerald-250' },
              { id: 'indigo', label: 'Indigo Blue', bg: 'bg-indigo-50 text-indigo-800 border-indigo-250' },
              { id: 'rose', label: 'Rose Pink', bg: 'bg-rose-50 text-rose-800 border-rose-250' },
              { id: 'amber', label: 'Amber Gold', bg: 'bg-amber-50 text-amber-800 border-amber-250' },
              { id: 'purple', label: 'Royal Purple', bg: 'bg-purple-50 text-purple-800 border-purple-250' },
              { id: 'cyan', label: 'Ocean Cyan', bg: 'bg-cyan-50 text-cyan-800 border-cyan-250' },
              { id: 'crimson', label: 'Rich Crimson', bg: 'bg-red-50 text-red-800 border-red-250' },
              { id: 'dark', label: 'Carbon Black', bg: 'bg-slate-900 text-white border-slate-955' },
            ].map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => setAnnouncementTheme(th.id)}
                className={`py-2 px-3 border rounded-xl text-[10px] font-black transition text-center ${th.bg} ${
                  announcementTheme === th.id 
                    ? 'ring-2 ring-slate-950 scale-[1.03] shadow-sm' 
                    : 'opacity-65 hover:opacity-100 hover:scale-[1.01]'
                }`}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Interactive Preview */}
        <div className="p-3 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl space-y-1.5">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Live Storefront Preview</span>
          {announcementActive ? (
            <div className={`py-2 px-4 rounded-xl text-[10px] font-bold tracking-wide flex items-center justify-center gap-1.5 transition-all shadow-sm border ${
              announcementTheme === 'rose' ? 'bg-rose-50 border-rose-100 text-rose-800' :
              announcementTheme === 'indigo' ? 'bg-indigo-50 border-indigo-100 text-indigo-800' :
              announcementTheme === 'amber' ? 'bg-amber-50 border-amber-100 text-amber-800' :
              announcementTheme === 'purple' ? 'bg-purple-50 border-purple-100 text-purple-800' :
              announcementTheme === 'cyan' ? 'bg-cyan-50 border-cyan-100 text-cyan-800' :
              announcementTheme === 'crimson' ? 'bg-red-50 border-red-100 text-red-800' :
              announcementTheme === 'dark' ? 'bg-slate-900 border-slate-950 text-white' :
              'bg-emerald-50 border-emerald-100 text-emerald-800'
            }`}>
              <Sparkles className="w-3 h-3 animate-bounce shrink-0" />
              <span>{announcementText || 'Your message will appear here...'}</span>
              {announcementLink && (
                <span className="underline font-black text-[8px] uppercase ml-1">Shop Now</span>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-slate-450 text-center py-2 font-bold italic">Announcement bar is currently disabled.</p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={handleSaveAnnouncementSettings}
            disabled={savingAnnouncement}
            className="w-full sm:w-auto px-5 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {savingAnnouncement ? <Loader2 className="w-3.5 h-3.5 animate-spin animate-spin" /> : 'Save Announcement'}
          </button>
        </div>
      </div>

      {/* Explore Collections Card */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-sm transition-all overflow-hidden border-t-2 border-t-amber-600 p-4 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider leading-none">📂 Explore Collections (Homepage)</h3>
              <p className="text-[8px] text-slate-400 font-bold mt-0.5">Customize featured category blocks shown on the homepage</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddNewCollection}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-black transition flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Collection</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {adminCollections.map((col, idx) => (
            <div key={col.id || idx} className="p-3.5 bg-slate-50/55 border border-slate-200 rounded-xl space-y-2 relative group">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Collection {idx + 1}</span>
                {adminCollections.length > 4 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCollection(idx)}
                    className="text-red-500 hover:text-red-700 p-0.5 transition"
                    title="Remove Collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Collection Name (Related Category Name)</label>
                  <input
                    type="text"
                    placeholder="e.g. Mobiles"
                    value={col.title}
                    onChange={(e) => handleAdminCollectionChange(idx, 'title', e.target.value)}
                    className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  {col.image && (
                    <img
                      src={col.image}
                      alt={col.title}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-sm shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Collection Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        id={`col-upload-${idx}`}
                        className="hidden"
                        onChange={(e) => handleCollectionImageUpload(idx, e)}
                      />
                      <label
                        htmlFor={`col-upload-${idx}`}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl text-[10px] font-extrabold text-slate-650 hover:bg-slate-50 cursor-pointer transition w-full animate-in fade-in"
                      >
                        {uploadingIdx === idx ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-650" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <span>📷 Choose Image</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={handleSaveExploreCollections}
            disabled={savingCollections}
            className="w-full sm:w-auto px-5 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {savingCollections ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Collections'}
          </button>
        </div>
      </div>
    </div>
  );
}
