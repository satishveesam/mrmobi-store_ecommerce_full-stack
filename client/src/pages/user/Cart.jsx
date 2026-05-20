import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CartItem from '../../components/cart/CartItem.jsx';
import CartSummary from '../../components/cart/CartSummary.jsx';
import { authService } from '../../services/authService.js';
import useAuth from '../../hooks/useAuth.js';
import {
  X, Home, MapPin, User, Phone, Pin, ShoppingBag, ArrowLeft, Plus
} from 'lucide-react';
import { toast } from 'react-toastify';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const emptyForm = {
  customerName: '', mobile: '', address: '',
  village: '', city: '', state: '', pincode: '', type: 'HOME'
};

export default function Cart() {
  const items = useSelector((state) => state.cart.items);
  const { user, isAuthenticated } = useAuth();

  // Raw address objects from API
  const [addressObjects, setAddressObjects] = useState([]);
  const [selectedAddrObj, setSelectedAddrObj] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [form, setForm] = useState({ ...emptyForm, customerName: user?.fullName || '', mobile: user?.mobile || '' });

  const fetchAddresses = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await authService.getAddresses();
      setAddressObjects(data || []);
      if (data?.length > 0 && !selectedAddrObj) {
        const def = data.find((a) => a.isDefault) || data[0];
        setSelectedAddrObj(def);
      }
    } catch { /* silent */ }
  };

  useEffect(() => { fetchAddresses(); }, [isAuthenticated]);

  // Pincode lookup
  const handlePincodeChange = async (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, pincode: value }));
    if (value.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0].Status === 'Success') {
          const po = data[0].PostOffice[0];
          setForm((prev) => ({ ...prev, village: po.Name, city: po.District, state: po.State }));
          toast.success('Location auto-filled!');
        }
      } catch { /* silent */ }
    }
  };

  // GPS location
  const handleUseLocation = () => {
    if (!('geolocation' in navigator)) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1`);
        const data = await res.json();
        const addr = data.address;
        setForm((prev) => ({
          ...prev,
          pincode: addr.postcode || '',
          city: addr.city || addr.town || addr.village || addr.county || '',
          state: addr.state || '',
          address: data.display_name || '',
          village: addr.suburb || addr.neighbourhood || '',
        }));
        toast.success('Location detected!');
      } catch { toast.error('Failed to get address'); }
    }, () => toast.error('Location permission denied'));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const saved = await authService.addAddress({
        fullName: form.customerName,
        mobile: form.mobile,
        pincode: form.pincode,
        addressLine: form.address,
        village: form.village,
        city: form.city,
        state: form.state,
        type: form.type,
        isDefault: false,
      });
      toast.success('Address saved!');
      setIsAddingNew(false);
      setForm({ ...emptyForm, customerName: user?.fullName || '', mobile: user?.mobile || '' });
      await fetchAddresses();
    } catch { toast.error('Failed to save address'); }
    finally { setSaveLoading(false); }
  };

  // Empty state
  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag size={36} className="text-gray-300" />
        </div>
        <h1 className="text-xl font-black text-gray-900 mb-1">Your cart is empty</h1>
        <p className="text-sm text-gray-400 mb-6">Looks like you haven't added anything yet.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-blue-700 transition"
        >
          <ShoppingBag size={16} /> Browse Products
        </Link>
      </div>
    );
  }

  const addrLabel = selectedAddrObj
    ? `${selectedAddrObj.addressLine}, ${selectedAddrObj.city} — ${selectedAddrObj.pincode}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">

        {/* Page Title */}
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} className="text-blue-600" />
          <h1 className="text-lg sm:text-xl font-black text-gray-900">
            My Cart <span className="text-sm font-bold text-gray-400">({items.length} item{items.length > 1 ? 's' : ''})</span>
          </h1>
        </div>

        {/* ── Delivery Address Bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-50 flex items-center justify-center">
              <MapPin size={15} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              {selectedAddrObj ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-gray-900">Deliver to: {selectedAddrObj.fullName}</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 uppercase">
                      {selectedAddrObj.type === 'HOME' ? '🏠' : '🏢'} {selectedAddrObj.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{addrLabel}</p>
                </>
              ) : (
                <p className="text-xs text-gray-500 font-medium">No delivery address selected</p>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 border border-blue-500 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition"
            >
              {selectedAddrObj ? 'Change' : 'Add Address'}
            </button>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex flex-col lg:flex-row gap-4">

          {/* Cart Items */}
          <div className="flex-1 space-y-3 min-w-0">
            {items.map((item) => <CartItem key={item.id} item={item} />)}
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline mt-1"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:w-72 xl:w-80">
            <div className="lg:sticky lg:top-4">
              <CartSummary items={items} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Address Modal (bottom-sheet on mobile) ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-end sm:items-center justify-center" onClick={() => !isAddingNew && setShowModal(false)}>
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal drag handle (mobile visual) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 20px)' }}>
              {isAddingNew ? (
                /* ── Add New Address Form ── */
                <form onSubmit={handleSaveAddress} className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-base font-black text-gray-900">Add New Address</h2>
                  </div>

                  {/* Name + Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                      <input
                        required placeholder="Full Name *"
                        value={form.customerName}
                        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                      <input
                        required placeholder="Mobile *" pattern="[0-9]{10}"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Pincode + GPS */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Pin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                      <input
                        required placeholder="Pincode *" pattern="[0-9]{6}"
                        value={form.pincode}
                        onChange={handlePincodeChange}
                        className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <button
                      type="button" onClick={handleUseLocation}
                      className="flex items-center gap-1 px-2.5 py-2 border border-blue-500 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 transition whitespace-nowrap"
                    >
                      <MapPin size={12} /> Use GPS
                    </button>
                  </div>

                  {/* Address */}
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <textarea
                      required placeholder="Flat, House no., Building *"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      rows={2}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white resize-none"
                    />
                  </div>

                  {/* Village + City */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      required placeholder="Village / Area *"
                      value={form.village}
                      onChange={(e) => setForm({ ...form, village: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                    <input
                      required placeholder="City *"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  {/* State */}
                  <select
                    required value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="" disabled>Select State *</option>
                    {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>

                  {/* Type */}
                  <div className="flex gap-2">
                    {['HOME', 'WORK'].map((t) => (
                      <button key={t} type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        className={`flex-1 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition ${form.type === t ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {t === 'HOME' ? <Home size={12} /> : <MapPin size={12} />} {t}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit" disabled={saveLoading}
                    className="w-full py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {saveLoading ? 'Saving...' : 'Save Address'}
                  </button>
                </form>
              ) : (
                /* ── Address List ── */
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-black text-gray-900">Delivery Address</h2>
                    <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Add new button */}
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-blue-300 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-50 transition mb-3"
                  >
                    <Plus size={14} /> Add New Address
                  </button>

                  {/* Saved addresses */}
                  {addressObjects.length === 0 ? (
                    <div className="py-6 text-center">
                      <MapPin size={28} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400">No saved addresses yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">Saved Addresses</p>
                      {addressObjects.map((addr) => {
                        const isSelected = selectedAddrObj?.id === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => { setSelectedAddrObj(addr); setShowModal(false); }}
                            className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50/60' : 'border-gray-100 hover:border-gray-300'}`}
                          >
                            {/* Radio */}
                            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase ${addr.type === 'HOME' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {addr.type === 'HOME' ? '🏠' : '🏢'} {addr.type}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Default</span>
                                )}
                              </div>
                              <p className="text-sm font-black text-gray-900">{addr.fullName}</p>
                              <p className="text-xs text-gray-500">{addr.mobile}</p>
                              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                {addr.addressLine}{addr.village ? `, ${addr.village}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
