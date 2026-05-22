import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import CartSummary from '../../components/cart/CartSummary.jsx';
import { orderService } from '../../services/orderService.js';
import { authService } from '../../services/authService.js';
import { clearCart, clearCartAsync, updateQuantityAsync, removeFromCartAsync } from '../../redux/slices/cartSlice.js';
import {
  Minus, Plus, Trash2, MapPin, Home, Phone, User, Pin,
  PlusCircle, ChevronDown, ChevronUp, Pencil, X, CheckCircle2
} from 'lucide-react';
import { redirectToWhatsApp } from '../../utils/whatsapp.js';
import { formatCurrency } from '../../utils/constants.js';

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
  fullName: '', mobile: '', pincode: '', addressLine: '',
  village: '', city: '', state: '', type: 'HOME', isDefault: false
};

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [addrLoading, setAddrLoading] = useState(true);
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  // If user clicked "Buy Now" on a single item, only checkout that item
  const buyNowItem = location.state?.buyNowItem ?? null;
  const isBuyNow = !!buyNowItem;
  const items = isBuyNow
    ? [{ ...buyNowItem, quantity: buyNowItem.quantity ?? 1 }]
    : cartItems;

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showAllAddresses, setShowAllAddresses] = useState(false);

  // Fetch addresses on mount
  const fetchAddresses = async () => {
    try {
      const { data } = await authService.getAddresses();
      setAddresses(data);
      // Auto-select default or first address
      const def = data.find((a) => a.isDefault) || data[0];
      if (def) setSelectedAddressId(def.id);
    } catch {
      toast.error('Failed to fetch addresses');
    } finally {
      setAddrLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Get selected address object
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Check if any item in order has 0 / null stock
  const outOfStockItems = items.filter((item) => item.stock !== null && item.stock !== undefined && item.stock <= 0);
  const hasOutOfStock = outOfStockItems.length > 0;

  // Place order
  const handlePlaceOrder = async () => {
    if (!items.length) return toast.error('Cart is empty');
    if (!selectedAddress) return toast.error('Please select or add a delivery address');
    if (hasOutOfStock) {
      const names = outOfStockItems.map((i) => i.name).join(', ');
      return toast.error(`Remove out-of-stock item(s) before ordering: ${names}`);
    }

    // ── Client-side pre-flight validation (mirrors backend @NotBlank constraints) ──
    const custName = (selectedAddress.fullName || '').trim();
    const custMobile = (selectedAddress.mobile || '').trim();
    const addrLine = (selectedAddress.addressLine || '').trim();
    const city = (selectedAddress.city || '').trim();
    const state = (selectedAddress.state || '').trim();
    const pincode = (selectedAddress.pincode || '').trim();

    if (!custName)   return toast.error('Address is missing Full Name');
    if (!custMobile) return toast.error('Address is missing Mobile number');
    if (!addrLine)   return toast.error('Address line is empty');
    if (!city)       return toast.error('City is missing in the selected address');
    if (!state)      return toast.error('State is missing in the selected address');

    // Build safe address string
    const village = (selectedAddress.village || '').trim();
    const fullAddress = [addrLine, village, city, state, pincode]
      .filter(Boolean)
      .join(', ');

    // Validate each cart item has a valid product id and quantity
    for (const item of items) {
      if (!item.id) return toast.error(`Invalid product in cart: ${item.name || 'unknown'}`);
      const qty = Number(item.quantity);
      if (!qty || qty < 1) return toast.error(`Invalid quantity for: ${item.name}`);
    }

    setLoading(true);
    try {
      const orderPayloads = items.map((item) => ({
        productId: Number(item.id),
        customerName: custName,
        mobile: custMobile,
        address: fullAddress,
        quantity: Number(item.quantity) || 1,
      }));

      await orderService.placeBulkOrders(orderPayloads);

      toast.success('Order placed successfully! 🎉');

      // Buy Now: only remove the ordered item; Normal checkout: clear full cart
      if (isBuyNow) {
        await dispatch(removeFromCartAsync(buyNowItem.id));
      } else {
        await dispatch(clearCartAsync());
      }

      redirectToWhatsApp({
        customerName: custName,
        mobile: custMobile,
        address: fullAddress,
        pincode,
      }, items);

    } catch (error) {
      // Backend GlobalExceptionHandler returns { "status": 4xx, "error": "..." }
      // Validation errors return { "error": "Validation failed", "fields": {...} }
      const data = error.response?.data;
      const serverMsg = data?.error       // e.g. "Insufficient stock for product: X"
        || data?.message                  // fallback key
        || (typeof data === 'string' ? data : null)
        || error.message
        || 'Order failed. Please try again.';
      console.error('Order error:', data || error);
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = (productId, newQty) => {
    dispatch(updateQuantityAsync({ productId, quantity: Math.max(1, newQty) }));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCartAsync(productId));
  };

  // Address form handlers
  const handlePincodeChange = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, pincode: value }));
    if (value.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0].Status === 'Success') {
          const po = data[0].PostOffice[0];
          setFormData((prev) => ({ ...prev, village: po.Name, city: po.District, state: po.State }));
          toast.success('Location auto-filled!');
        }
      } catch { /* silent */ }
    }
  };

  const handleUseLocation = () => {
    if (!('geolocation' in navigator)) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
        const data = await res.json();
        const addr = data.address;
        setFormData((prev) => ({
          ...prev,
          pincode: addr.postcode || '',
          city: addr.city || addr.town || addr.village || addr.county || '',
          state: addr.state || '',
          addressLine: data.display_name || '',
          village: addr.suburb || addr.neighbourhood || '',
        }));
        toast.success('Location detected!');
      } catch { toast.error('Failed to get address'); }
    }, () => toast.error('Location permission denied'));
  };

  const handleEditAddress = (addr) => {
    setFormData({
      fullName: addr.fullName, mobile: addr.mobile, pincode: addr.pincode,
      addressLine: addr.addressLine, village: addr.village || '', city: addr.city,
      state: addr.state, type: addr.type, isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowAddForm(true);
    setShowAllAddresses(true);
  };

  const handleAddressFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await authService.updateAddress(editingId, formData);
        toast.success('Address updated');
      } else {
        await authService.addAddress(formData);
        toast.success('Address added');
      }
      setShowAddForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      await fetchAddresses();
    } catch { toast.error('Failed to save address'); }
    finally { setLoading(false); }
  };

  const visibleAddresses = showAllAddresses ? addresses : addresses.slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">

        {/* Header */}
        <div className="flex items-center gap-2">
          <MapPin className="text-blue-600" size={20} />
          <h1 className="text-lg sm:text-xl font-black text-gray-900">Checkout</h1>
        </div>

        {/* Buy Now banner */}
        {isBuyNow && (
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            <span className="text-lg">⚡</span>
            <div>
              <p className="text-xs font-black text-amber-800">Buy Now — Express Checkout</p>
              <p className="text-[11px] text-amber-600">
                Only <span className="font-bold">{buyNowItem.name}</span> will be ordered. Your other cart items are safe.
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Column */}
          <div className="flex-1 space-y-4 min-w-0">

            {/* ── DELIVERY ADDRESS SECTION ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Section Header */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                <h2 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] font-black flex items-center justify-center">1</span>
                  Delivery Address
                </h2>
                {!showAddForm && (
                  <button
                    onClick={() => { setShowAddForm(true); setEditingId(null); setFormData(emptyForm); }}
                    className="flex items-center gap-1 text-blue-600 font-bold text-xs hover:text-blue-700 transition"
                  >
                    <PlusCircle size={14} />
                    Add New
                  </button>
                )}
              </div>

              <div className="p-3 sm:p-4 space-y-3">
                {/* Add / Edit Address Form */}
                {showAddForm && (
                  <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-blue-700 font-black text-xs uppercase tracking-wider">
                        {editingId ? 'Edit Address' : 'New Address'}
                      </h3>
                      <button
                        onClick={() => { setShowAddForm(false); setEditingId(null); setFormData(emptyForm); }}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={handleAddressFormSubmit} className="space-y-2.5">
                      {/* Name + Mobile */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                          <input
                            required
                            placeholder="Full Name *"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                          <input
                            required
                            placeholder="Mobile Number *"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            pattern="[0-9]{10}"
                            title="Enter valid 10-digit mobile"
                            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </div>
                      </div>

                      {/* Pincode + Location */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Pin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                          <input
                            required
                            placeholder="Pincode *"
                            value={formData.pincode}
                            onChange={handlePincodeChange}
                            pattern="[0-9]{6}"
                            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleUseLocation}
                          className="flex items-center gap-1 px-2.5 py-2 border border-blue-500 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 transition whitespace-nowrap"
                        >
                          <MapPin size={12} /> Use Location
                        </button>
                      </div>

                      {/* Address Line */}
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                        <textarea
                          required
                          placeholder="Flat, House no., Building, Area *"
                          value={formData.addressLine}
                          onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                          rows={2}
                          className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white resize-none"
                        />
                      </div>

                      {/* Village + City */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          required
                          placeholder="Village / Area *"
                          value={formData.village}
                          onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                        <input
                          required
                          placeholder="City *"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                      </div>

                      {/* State */}
                      <select
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="" disabled>Select State *</option>
                        {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>

                      {/* Address Type */}
                      <div className="flex gap-2">
                        {['HOME', 'WORK'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: t })}
                            className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 ${formData.type === t ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                          >
                            {t === 'HOME' ? <Home size={12} /> : <MapPin size={12} />}
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Save Button */}
                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-2 bg-blue-600 text-white text-xs font-black rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                        >
                          {loading ? 'Saving...' : editingId ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowAddForm(false); setEditingId(null); setFormData(emptyForm); }}
                          className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Address List */}
                {addrLoading ? (
                  <div className="py-8 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-400 mt-2">Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 && !showAddForm ? (
                  <div className="py-8 text-center">
                    <MapPin size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400 mb-3">No saved addresses yet</p>
                    <button
                      onClick={() => { setShowAddForm(true); setFormData(emptyForm); }}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      + Add your first address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visibleAddresses.map((addr) => {
                      const isSelected = addr.id === selectedAddressId;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`rounded-xl border-2 p-3 sm:p-4 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/60 shadow-sm'
                              : 'border-gray-100 bg-gray-50/50 hover:border-gray-300'
                          }`}
                        >
                          {/* Top row: radio + badge(s) + edit button */}
                          <div className="flex items-center gap-2 mb-2">
                            {/* Radio dot */}
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>

                            {/* Type badge */}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              addr.type === 'HOME'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {addr.type === 'HOME' ? '🏠' : '🏢'} {addr.type}
                            </span>

                            {addr.isDefault && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
                                Default
                              </span>
                            )}

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Edit button — right-aligned, no absolute positioning */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-300 transition flex-shrink-0"
                              title="Edit address"
                            >
                              <Pencil size={12} />
                            </button>
                          </div>

                          {/* Address details */}
                          <div className="pl-6">
                            <p className="font-black text-gray-900 text-sm">{addr.fullName}</p>
                            <p className="text-xs text-gray-500 font-medium">{addr.mobile}</p>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              {addr.addressLine}
                              {addr.village && `, ${addr.village}`}
                              {`, ${addr.city}, ${addr.state}`}
                            </p>
                            <p className="text-xs font-bold text-gray-700 mt-0.5">PIN: {addr.pincode}</p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Show More / Less */}
                    {addresses.length > 2 && (
                      <button
                        onClick={() => setShowAllAddresses(!showAllAddresses)}
                        className="w-full py-2 text-xs text-blue-600 font-bold flex items-center justify-center gap-1 hover:bg-blue-50 rounded-lg transition"
                      >
                        {showAllAddresses ? (
                          <><ChevronUp size={14} /> Show Less</>
                        ) : (
                          <><ChevronDown size={14} /> Show {addresses.length - 2} More Address{addresses.length - 2 > 1 ? 'es' : ''}</>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── ORDER REVIEW SECTION ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-2">
                  <span className="w-5 h-5 bg-gray-600 text-white rounded-full text-[10px] font-black flex items-center justify-center">2</span>
                  Order Review
                </h2>
              </div>

              <div className="p-3 sm:p-4 space-y-2">
                {items.map((item) => {
                  const itemOOS = item.stock !== null && item.stock !== undefined && item.stock <= 0;
                  return (
                  <div
                    key={item.id}
                    className={`flex gap-3 items-center justify-between py-2 border-b last:border-0 ${
                      itemOOS ? 'border-red-100 bg-red-50/30 rounded-lg px-2' : 'border-gray-50'
                    }`}
                  >
                    <div className="flex gap-2.5 items-center flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.images?.length > 0 ? item.images[0] : (item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80')}
                          alt={item.name}
                          className={`h-12 w-12 rounded-xl object-cover border border-gray-100 ${itemOOS ? 'grayscale opacity-60' : ''}`}
                        />
                        {itemOOS && (
                          <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-white/40">
                            <span className="text-[8px] font-black text-red-600 leading-tight text-center">OUT OF{'\n'}STOCK</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${itemOOS ? 'text-gray-400' : 'text-gray-900'}`}>{item.name}</p>
                        {itemOOS ? (
                          <span className="text-[10px] font-black text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">
                            ⚠ Out of Stock
                          </span>
                        ) : (
                          <p className="text-[11px] text-gray-500">{formatCurrency(Number(item.discountedPrice ?? item.price ?? 0))}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Qty controls — disabled if OOS */}
                      <div className={`flex items-center rounded-lg border bg-gray-50 h-7 ${itemOOS ? 'opacity-40 pointer-events-none' : 'border-gray-200'}`}>
                        <button className="px-1.5 text-gray-600 hover:text-blue-600" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} disabled={itemOOS}>
                          <Minus size={11} />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button className="px-1.5 text-gray-600 hover:text-blue-600" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} disabled={itemOOS}>
                          <Plus size={11} />
                        </button>
                      </div>
                      {/* Remove */}
                      <button
                        className="rounded-lg bg-red-50 p-1.5 text-red-400 hover:bg-red-100 transition"
                        onClick={() => handleRemove(item.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                      <span className={`text-xs font-black min-w-[52px] text-right ${itemOOS ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {formatCurrency(Number(item.discountedPrice ?? item.price ?? 0) * item.quantity)}
                      </span>
                    </div>
                  </div>
                  );
                })}

                {items.length === 0 && (
                  <div className="py-6 text-center text-xs text-gray-400">Your cart is empty.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column — Order Summary (sticky on desktop) */}
          <div className="lg:w-72 xl:w-80">
            <div className="lg:sticky lg:top-4 space-y-3">
              <CartSummary
                items={items}
                isCheckout={true}
                onPlaceOrder={handlePlaceOrder}
                canPlaceOrder={!!selectedAddress && items.length > 0 && !loading && !hasOutOfStock}
                deliveryPincode={selectedAddress?.pincode}
                loading={loading}
              />

              {/* Selected Address Preview (shown under summary) */}
              {selectedAddress && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" /> Delivering To
                  </p>
                  <p className="text-sm font-black text-gray-900">{selectedAddress.fullName}</p>
                  <p className="text-xs text-gray-500">{selectedAddress.mobile}</p>
                  <p className="text-xs text-gray-600 mt-1 leading-snug">
                    {selectedAddress.addressLine}, {selectedAddress.city}, {selectedAddress.state} — {selectedAddress.pincode}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
