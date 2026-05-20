import { useState, useEffect } from 'react';
import { Plus, MoreVertical, MapPin, User, Phone, Pin, Home, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import ProfileLayout from '../../components/user/ProfileLayout';

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

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    pincode: '',
    addressLine: '',
    village: '',
    city: '',
    state: '',
    type: 'HOME', // HOME or WORK
    isDefault: false
  });

  const fetchAddresses = async () => {
    try {
      const { data } = await authService.getAddresses();
      setAddresses(data);
    } catch (error) {
      toast.error('Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleEdit = (addr) => {
    setFormData({
      fullName: addr.fullName,
      mobile: addr.mobile,
      pincode: addr.pincode,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      type: addr.type,
      isDefault: addr.isDefault
    });
    setEditingId(addr.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await authService.deleteAddress(id);
      toast.success('Address deleted');
      fetchAddresses();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handlePincodeChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, pincode: value });

    if (value.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            village: postOffice.Name,
            city: postOffice.District,
            state: postOffice.State
          }));
          toast.success('Location detected!');
        }
      } catch (error) {
        console.error('Failed to fetch location from pincode', error);
      }
    }
  };

  const handleUseLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          const addr = data.address;
          const doorNo = addr.house_number ? `Door No: ${addr.house_number}, ` : '';
          setFormData(prev => ({
            ...prev,
            pincode: addr.postcode || '',
            city: addr.city || addr.town || addr.village || addr.county || '',
            state: addr.state || '',
            addressLine: `${doorNo}${data.display_name || ''}`,
            village: addr.suburb || addr.neighbourhood || ''
          }));
          toast.success('Location detected!');
        } catch (error) {
          console.error('Failed to reverse geocode', error);
          toast.error('Failed to get address');
        }
      }, (error) => {
        console.error('Geolocation error', error);
        toast.error('Permission denied or location unavailable');
      });
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const handleSubmit = async (e) => {
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
      setFormData({
        fullName: '', mobile: '', pincode: '', addressLine: '',
        city: '', state: '', type: 'HOME', isDefault: false
      });
      fetchAddresses();
    } catch (error) {
      toast.error('Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileLayout>
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Manage Addresses</h2>

        {/* Add New Address Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center sm:justify-start gap-3 p-3 sm:p-4 border border-gray-200 text-blue-600 font-bold text-xs sm:text-sm uppercase rounded-sm hover:bg-gray-50 transition"
          >
            <Plus size={20} />
            ADD NEW ADDRESS
          </button>
        )}

        {/* Address Form */}
        {showAddForm && (
          <div className="bg-blue-50/30 border border-gray-100 p-4 sm:p-6 rounded-sm space-y-4 sm:space-y-6">
            <h3 className="text-blue-600 font-bold text-xs sm:text-sm uppercase">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-2">
                {/* Name */}
                <div className="relative">
                  <User className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                  <input 
                    className="form-input !pl-9 h-8 border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg text-xs" 
                    required 
                    placeholder="Full Name *" 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                  />
                </div>

                {/* Mobile */}
                <div className="relative">
                  <Phone className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                  <input 
                    className="form-input !pl-9 h-8 border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg text-xs" 
                    required 
                    placeholder="Mobile Number *" 
                    value={formData.mobile} 
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
                  />
                </div>

                {/* Pincode & Use Location */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Pin className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                    <input 
                      className="form-input !pl-9 h-8 border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg text-xs" 
                      required 
                      placeholder="Pincode *" 
                      value={formData.pincode} 
                      onChange={handlePincodeChange} 
                      pattern="[0-9]{6}"
                      title="Please enter a valid 6-digit pincode"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleUseLocation} 
                    className="border border-blue-600 text-blue-600 px-2 h-8 rounded-lg text-xs font-bold hover:bg-blue-50 transition flex-shrink-0 flex items-center gap-1"
                  >
                    <MapPin size={12} />
                    Use Location
                  </button>
                </div>

                {/* Address */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                  <textarea 
                    className="form-input !pl-9 pt-1.5 min-h-16 border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg text-xs" 
                    required 
                    placeholder="Flat, House no., Building, Company, Apartment *" 
                    value={formData.addressLine} 
                    onChange={(e) => setFormData({...formData, addressLine: e.target.value})} 
                  />
                </div>

                {/* Village & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <input 
                      className="form-input h-8 border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg text-xs" 
                      required 
                      placeholder="Village Name *" 
                      value={formData.village} 
                      onChange={(e) => setFormData({...formData, village: e.target.value})} 
                    />
                  </div>
                  <div className="relative">
                    <input 
                      className="form-input h-8 border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg text-xs" 
                      required 
                      placeholder="City *" 
                      value={formData.city} 
                      onChange={(e) => setFormData({...formData, city: e.target.value})} 
                    />
                  </div>
                </div>

                {/* State */}
                <div className="relative">
                  <select 
                    className="form-input h-8 border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg bg-white text-xs" 
                    required 
                    value={formData.state} 
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  >
                    <option value="" disabled>Select State *</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Address Type (HOME/WORK) */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500">Address Type</p>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, type: 'HOME'})} 
                      className={`flex-1 h-8 rounded-lg border font-bold text-xs transition flex items-center justify-center gap-1 ${formData.type === 'HOME' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Home size={14} />
                      Home
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, type: 'WORK'})} 
                      className={`flex-1 h-8 rounded-lg border font-bold text-xs transition flex items-center justify-center gap-1 ${formData.type === 'WORK' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      <MapPin size={14} />
                      Work
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-12 h-8 font-bold text-xs rounded-lg shadow-sm hover:bg-blue-700 transition"
                  >
                    SAVE
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setEditingId(null); }}
                    className="w-full sm:w-auto text-blue-600 font-bold text-xs hover:underline"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        <div className="space-y-3 sm:space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="group border border-gray-100 p-4 sm:p-6 rounded-sm relative hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="bg-gray-100 text-[10px] font-black text-gray-500 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    {addr.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <button onClick={() => handleEdit(addr)} className="text-blue-600 font-bold text-xs uppercase hover:underline">Edit</button>
                  <button onClick={() => handleDelete(addr.id)} className="text-red-500 font-bold text-xs uppercase hover:underline">Delete</button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <span className="font-bold text-gray-900 text-sm">{addr.fullName}</span>
                  <span className="font-bold text-gray-900 text-sm">{addr.mobile}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {addr.addressLine}, {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                </p>
              </div>
            </div>
          ))}

          {!loading && addresses.length === 0 && !showAddForm && (
            <div className="text-center py-12 sm:py-20 bg-gray-50 rounded-sm">
              <MapPin size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
              <p className="text-xs sm:text-sm text-gray-500">No addresses found. Add one now!</p>
            </div>
          )}
        </div>

      </div>
    </ProfileLayout>
  );
}
