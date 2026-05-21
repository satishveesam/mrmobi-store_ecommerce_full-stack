import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { toast } from 'react-toastify';
import { MapPin, Trash2, Edit2, Settings, Loader2, Truck, ChevronDown, ChevronUp, Plus, BadgePercent, Sparkles, Tag } from 'lucide-react';
import { formatCurrency } from '../../utils/constants.js';

export default function ShippingManagement() {
  const [globalDeliveryFee, setGlobalDeliveryFee] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(0);

  const [savingStandard, setSavingStandard] = useState(false);

  const [quickLocations, setQuickLocations] = useState([]);
  const [newCityName, setNewCityName] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newLocFee, setNewLocFee] = useState('');
  const [newLocFreeThreshold, setNewLocFreeThreshold] = useState('');
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [resolvingPincode, setResolvingPincode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Accordion states
  const [standardExpanded, setStandardExpanded] = useState(false);
  const [announcementExpanded, setAnnouncementExpanded] = useState(false);
  const [collectionsExpanded, setCollectionsExpanded] = useState(false);
  const [addFormExpanded, setAddFormExpanded] = useState(false);

  // Announcement state
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTheme, setAnnouncementTheme] = useState('emerald');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Explore Collections state
  const [adminCollections, setAdminCollections] = useState([]);
  const [savingCollections, setSavingCollections] = useState(false);

  // Load settings
  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        setLoading(true);
        const [feeRes, threshRes, locsRes, announRes, colRes] = await Promise.all([
          api.get('/products/settings/global-delivery-fee'),
          api.get('/products/settings/free-delivery-threshold'),
          api.get('/products/settings/quick-delivery-locations'),
          api.get('/products/settings/announcement').catch(() => null),
          api.get('/products/settings/explore-collections').catch(() => null)
        ]);

        setGlobalDeliveryFee(feeRes.data?.globalDeliveryFee || 0);
        setFreeDeliveryThreshold(threshRes.data?.freeDeliveryThreshold || 0);
        setQuickLocations(locsRes.data || []);
        if (announRes && announRes.data) {
          setAnnouncementActive(announRes.data.active || false);
          setAnnouncementText(announRes.data.text || '');
          setAnnouncementTheme(announRes.data.theme || 'emerald');
          setAnnouncementLink(announRes.data.link || '');
        }
        if (colRes && colRes.data) {
          setAdminCollections(colRes.data);
        }
      } catch (err) {
        console.error('Failed to load shipping settings', err);
        toast.error('Failed to load configurations.');
      } finally {
        setLoading(false);
      }
    };

    loadAllSettings();
  }, []);

  // Pincode lookup
  useEffect(() => {
    if (newPincode.length === 6 && !editingLocationId) {
      const lookupPincode = async () => {
        setResolvingPincode(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${newPincode}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffices = data[0].PostOffice;
            if (postOffices && postOffices.length > 0) {
              const office = postOffices.find(off => 
                off.BranchType === 'Head Post Office' || off.BranchType === 'Sub Post Office'
              ) || postOffices[0];

              let block = (office.Block || '').trim();
              let village = (office.Name || '').trim();

              village = village
                .replace(/\s+(H\.?O\.?|S\.?O\.?|B\.?O\.?)$/i, '')
                .replace(/\s+(Head|Sub|Branch)\s+Office$/i, '')
                .trim();

              block = block
                .replace(/\s+(H\.?O\.?|S\.?O\.?|B\.?O\.?)$/i, '')
                .replace(/\s+(Head|Sub|Branch)\s+Office$/i, '')
                .trim();

              block = block.replace(/\s+(Urban|Rural)$/i, '').trim();

              let resolvedCity = '';
              if (block && village) {
                if (block.toLowerCase() === village.toLowerCase()) {
                  resolvedCity = block;
                } else if (village.toLowerCase().startsWith(block.toLowerCase())) {
                  const subArea = village.substring(block.length).replace(/^[\s,-]+/, '').trim();
                  resolvedCity = subArea ? `${block}, ${subArea}` : block;
                } else {
                  resolvedCity = `${block}, ${village}`;
                }
              } else {
                resolvedCity = block || village || office.Division || office.District || '';
              }

              const toTitleCase = (str) => {
                if (!str) return '';
                return str
                  .toLowerCase()
                  .split(/\s+/)
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
              };

              resolvedCity = toTitleCase(resolvedCity);

              if (resolvedCity) {
                setNewCityName(resolvedCity);
                toast.success(`Resolved: ${resolvedCity}`, { autoClose: 1500 });
              }
            }
          }
        } catch (err) {
          console.error('Pincode query failed', err);
        } finally {
          setResolvingPincode(false);
        }
      };

      lookupPincode();
    }
  }, [newPincode, editingLocationId]);

  const handleSaveStandardSettings = async () => {
    setSavingStandard(true);
    try {
      await Promise.all([
        api.post('/admin/settings/global-delivery-fee', { globalDeliveryFee: Number(globalDeliveryFee) }),
        api.post('/admin/settings/free-delivery-threshold', { freeDeliveryThreshold: Number(freeDeliveryThreshold) })
      ]);
      toast.success('Standard delivery settings saved!');
      setStandardExpanded(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings.');
    } finally {
      setSavingStandard(false);
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
      setAnnouncementExpanded(false);
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

  const handleSaveExploreCollections = async () => {
    setSavingCollections(true);
    try {
      await api.post('/admin/settings/explore-collections', adminCollections);
      toast.success('Explore collections saved successfully!');
      try {
        localStorage.setItem('mrmobi_cached_explore_collections', JSON.stringify(adminCollections));
      } catch {}
      setCollectionsExpanded(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save explore collections.');
    } finally {
      setSavingCollections(false);
    }
  };

  const handleEditClick = (loc) => {
    setEditingLocationId(loc.id);
    setNewCityName(String(loc.cityName || ''));
    setNewPincode(String(loc.pincode || ''));
    setNewLocFee(String(loc.deliveryFee !== undefined && loc.deliveryFee !== null ? loc.deliveryFee : ''));
    setNewLocFreeThreshold(String(loc.freeThreshold !== undefined && loc.freeThreshold !== null ? loc.freeThreshold : ''));
    setAddFormExpanded(true);
  };

  const handleCancelEdit = () => {
    setEditingLocationId(null);
    setNewCityName('');
    setNewPincode('');
    setNewLocFee('');
    setNewLocFreeThreshold('');
    setAddFormExpanded(false);
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) {
      toast.error('City Name required');
      return;
    }
    if (!/^[0-9]{6}$/.test(newPincode)) {
      toast.error('Pincode must be 6 digits');
      return;
    }
    const feeVal = Number(newLocFee);
    if (isNaN(feeVal) || feeVal < 0) {
      toast.error('Invalid delivery fee');
      return;
    }

    const threshVal = newLocFreeThreshold ? Number(newLocFreeThreshold) : 0;
    if (isNaN(threshVal) || threshVal < 0) {
      toast.error('Invalid free threshold');
      return;
    }

    setSavingLocation(true);
    try {
      const payload = {
        pincode: newPincode,
        deliveryFee: feeVal,
        cityName: newCityName.trim(),
        freeThreshold: threshVal
      };
      if (editingLocationId) {
        payload.id = editingLocationId;
      }

      const { data } = await api.post('/admin/settings/quick-delivery-locations', payload);
      toast.success(editingLocationId ? 'Location updated!' : 'Location whitelisted!');
      
      setQuickLocations(prev => {
        const existsIdx = prev.findIndex(loc => loc.id === data.id || loc.pincode === data.pincode);
        if (existsIdx > -1) {
          const updated = [...prev];
          updated[existsIdx] = data;
          return updated;
        }
        return [...prev, data];
      });

      handleCancelEdit();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save location');
    } finally {
      setSavingLocation(false);
    }
  };

  const handleDeleteLocation = async (id, cityName) => {
    if (!window.confirm(`Delete coverage for ${cityName || 'location'}?`)) return;
    try {
      await api.delete(`/admin/settings/quick-delivery-locations/${id}`);
      toast.success('Coverage removed');
      setQuickLocations(prev => prev.filter(loc => loc.id !== id));
      if (editingLocationId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete coverage');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center bg-slate-50/20 rounded-2xl border border-slate-100">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-slate-800" />
          <span className="text-[10px] text-slate-400 font-semibold">Loading logistics matrix...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-6 px-1 sm:px-0">
      {/* Sleek Minimalist Header */}
      <div className="bg-slate-950 p-4 rounded-2xl text-white shadow-sm border border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Settings className="w-4 h-4" />
          </span>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-tight leading-none uppercase">
              Shipping Configurations
            </h1>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">
              Click sections to expand delivery configurations and coverage overrides.
            </p>
          </div>
        </div>
      </div>

      {/* Baseline Settings Card (Collapsible) */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-sm transition-all overflow-hidden border-t-2 border-t-emerald-600">
        {/* Accordion Trigger Header */}
        <button
          type="button"
          onClick={() => setStandardExpanded(!standardExpanded)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition duration-150 text-left focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider leading-none">Standard Delivery Fallbacks</h3>
              <p className="text-[8px] text-slate-400 font-bold mt-0.5">Global fallback delivery fees & free waivers</p>
            </div>
          </div>
          <span className="text-slate-400 p-1 hover:text-slate-700 transition">
            {standardExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {/* Collapsible Content */}
        {standardExpanded && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/10 animate-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Standard Shipping Fee
                </label>
                <div className="relative group">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-455">₹</span>
                  <input
                    type="number"
                    value={globalDeliveryFee}
                    onChange={(e) => setGlobalDeliveryFee(e.target.value)}
                    className="w-full text-xs font-bold pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Free Shipping Order Min
                </label>
                <div className="relative group">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-455">₹</span>
                  <input
                    type="number"
                    value={freeDeliveryThreshold}
                    onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                    className="w-full text-xs font-bold pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveStandardSettings}
                disabled={savingStandard}
                className="w-full sm:w-auto px-4 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {savingStandard ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Announcement Ribbon Card (Collapsible) */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-sm transition-all overflow-hidden border-t-2 border-t-indigo-600">
        {/* Accordion Trigger Header */}
        <button
          type="button"
          onClick={() => setAnnouncementExpanded(!announcementExpanded)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition duration-150 text-left focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider leading-none">📢 Dynamic Announcement Ribbon</h3>
              <p className="text-[8px] text-slate-400 font-bold mt-0.5">Manage live homepage promo bars and alerts</p>
            </div>
          </div>
          <span className="text-slate-400 p-1 hover:text-slate-700 transition">
            {announcementExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {/* Collapsible Content */}
        {announcementExpanded && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/10 animate-in slide-in-from-top-1 duration-200 space-y-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Ribbon Text Message
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🎉 Special Offer: Flat 10% OFF today!"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Redirect Link URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /products or external URL"
                  value={announcementLink}
                  onChange={(e) => setAnnouncementLink(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
                Ribbon Theme Color Style
              </label>
              <div className="flex gap-2.5">
                {[
                  { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-50 text-emerald-800 border-emerald-250' },
                  { id: 'indigo', label: 'Indigo Blue', bg: 'bg-indigo-50 text-indigo-800 border-indigo-250' },
                  { id: 'rose', label: 'Rose Pink', bg: 'bg-rose-50 text-rose-800 border-rose-250' },
                  { id: 'amber', label: 'Amber Gold', bg: 'bg-amber-50 text-amber-800 border-amber-250' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setAnnouncementTheme(th.id)}
                    className={`flex-1 py-2 px-3 border rounded-xl text-[10px] font-black transition text-center ${th.bg} ${
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
                  announcementTheme === 'rose' ? 'bg-rose-50 border-rose-100 text-rose-805' :
                  announcementTheme === 'indigo' ? 'bg-indigo-50 border-indigo-100 text-indigo-805' :
                  announcementTheme === 'amber' ? 'bg-amber-50 border-amber-100 text-amber-805' :
                  'bg-emerald-50 border-emerald-100 text-emerald-805'
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
                className="w-full sm:w-auto px-4 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {savingAnnouncement ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Announcement'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Explore Collections Card (Collapsible) */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-sm transition-all overflow-hidden border-t-2 border-t-amber-600">
        <button
          type="button"
          onClick={() => setCollectionsExpanded(!collectionsExpanded)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition duration-150 text-left focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-600" />
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider leading-none">📂 Explore Collections (Homepage)</h3>
              <p className="text-[8px] text-slate-400 font-bold mt-0.5">Customize the 4 featured collections shown on the homepage</p>
            </div>
          </div>
          <span className="text-slate-400 p-1 hover:text-slate-700 transition">
            {collectionsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {collectionsExpanded && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/10 animate-in slide-in-from-top-1 duration-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adminCollections.map((col, idx) => (
                <div key={col.id || idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Collection {idx + 1}</span>
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
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Image URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={col.image}
                        onChange={(e) => handleAdminCollectionChange(idx, 'image', e.target.value)}
                        className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white text-slate-850"
                      />
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
                className="w-full sm:w-auto px-4 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {savingCollections ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Collections'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Coverage overrides card */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Pincode Coverage Rules</h3>
          </div>

          {/* Premium Form Toggle Trigger */}
          <button
            type="button"
            onClick={() => {
              if (addFormExpanded) {
                handleCancelEdit();
              } else {
                setAddFormExpanded(true);
              }
            }}
            className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition ${
              addFormExpanded 
                ? 'bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
            }`}
          >
            {addFormExpanded ? (
              'Close Form'
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Add Override</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* Collapsible Form Column */}
          {addFormExpanded && (
            <div className="bg-slate-50/60 border border-slate-150 p-4 rounded-xl space-y-3.5 animate-in slide-in-from-left duration-250 lg:col-span-1">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                {editingLocationId ? '✏️ Edit Override' : '➕ Add Override'}
              </h4>

              <form onSubmit={handleAddLocation} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Pincode</span>
                    {resolvingPincode && <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-600" />}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 533001"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
                    City Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kakinada"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
                    Custom Tariff
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-455">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 35"
                      value={newLocFee}
                      onChange={(e) => setNewLocFee(e.target.value)}
                      className="w-full text-xs font-bold pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
                    Free Threshold
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-455">₹</span>
                    <input
                      type="number"
                      placeholder="Optional (e.g. 499)"
                      value={newLocFreeThreshold}
                      onChange={(e) => setNewLocFreeThreshold(e.target.value)}
                      className="w-full text-xs font-bold pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1 text-xs">
                  <button
                    type="submit"
                    disabled={savingLocation || resolvingPincode}
                    className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition disabled:opacity-50"
                  >
                    {savingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : (editingLocationId ? 'Save' : 'Add')}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 border border-slate-250 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List Column (Takes FULL width when the form is collapsed!) */}
          <div className={`space-y-2 transition-all duration-300 ${addFormExpanded ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Active Whitelisted Zones ({quickLocations.length})
              </span>
              {!addFormExpanded && (
                <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">Compact Full View</span>
              )}
            </div>

            {quickLocations.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/20 border border-dashed border-slate-150 rounded-xl flex flex-col items-center justify-center gap-1.5">
                <MapPin className="w-5 h-5 text-slate-350" />
                <p className="text-[10px] font-bold text-slate-500">No coverage zones whitelisted yet.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[22rem] overflow-y-auto pr-0.5 no-scrollbar pb-1 ${!addFormExpanded ? 'lg:grid-cols-3' : ''}`}>
                {quickLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className={`p-2.5 border rounded-xl flex items-center justify-between transition hover:scale-[1.005] ${
                      editingLocationId === loc.id 
                        ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-900/5' 
                        : 'border-slate-150 bg-white hover:border-slate-250'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-extrabold text-slate-650 shrink-0">
                        📍
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-none">
                          {loc.pincode} - {loc.cityName || 'Zone'}
                        </p>
                        <div className="flex flex-col gap-0.5 mt-1 leading-none">
                          <p className="text-[9px] font-extrabold text-slate-600">
                            Tariff: <span className={loc.deliveryFee > 0 ? "text-slate-900 font-bold" : "text-emerald-650 font-bold"}>
                              {loc.deliveryFee > 0 ? formatCurrency(loc.deliveryFee) : 'FREE'}
                            </span>
                          </p>
                          {loc.deliveryFee > 0 && (
                            <p className="text-[8px] font-bold text-slate-450 flex items-center gap-0.5">
                              <BadgePercent className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                              <span>
                                {loc.freeThreshold > 0 
                                  ? `Free above ${formatCurrency(loc.freeThreshold)}` 
                                  : 'No free threshold'}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditClick(loc)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-350 transition"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLocation(loc.id, loc.cityName)}
                        className="p-1.5 rounded-lg border border-rose-100 bg-rose-50 text-rose-650 hover:bg-rose-100 hover:border-rose-250 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
