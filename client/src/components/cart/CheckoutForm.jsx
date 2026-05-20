import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Hash, History } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import { authService } from '../../services/authService.js';
import { toast } from 'react-toastify';

export default function CheckoutForm({ onSubmit }) {
  const [saveLoading, setSaveLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ 
    customerName: user?.fullName || '', 
    mobile: user?.mobile || '', 
    address: user?.address || '', 
    city: '',
    state: '',
    pincode: '' 
  });
  const [previousAddresses, setPreviousAddresses] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    if (previousAddresses.length === 0) {
      setIsAddingNew(true);
    }
  }, [previousAddresses]);

  useEffect(() => {
    if (isAuthenticated) {
      authService.getAddresses().then(res => {
        const data = res.data || [];
        const addresses = data.map(item => typeof item === 'string' ? item : `${item.addressLine}, ${item.city}, ${item.state} - Pincode: ${item.pincode}`);
        setPreviousAddresses(addresses);
      }).catch(console.error);
    }
  }, [isAuthenticated]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveLoading(true);
    
    const fullAddress = `${form.address}, ${form.city}, ${form.state}`;
    
    try {
      await authService.addAddress({ 
        fullName: form.customerName,
        mobile: form.mobile,
        pincode: form.pincode,
        addressLine: form.address,
        city: form.city,
        state: form.state,
        type: 'HOME',
        isDefault: false
      });
      toast.success('Address saved to profile!');
    } catch (error) {
      console.error('Failed to save address', error);
    } finally {
      setSaveLoading(false);
    }
    
    onSubmit({ 
      customerName: form.customerName,
      mobile: form.mobile,
      address: fullAddress,
      pincode: form.pincode
    });
  };

  return (
    <div className="space-y-4">
      {/* List of saved addresses */}
      {!isAddingNew && previousAddresses.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-black flex items-center gap-2">
            <History size={18} /> Select Delivery Address
          </h2>
          <div className="grid gap-3">
            {previousAddresses.map((addr, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-gray-100 hover:border-green-200 bg-gray-50/50 hover:bg-green-50 transition flex justify-between items-center">
                <div className="text-sm text-gray-600 flex-1 min-w-0">
                  {addr}
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    const pincodeMatch = addr.match(/Pincode:\s*(\d{6})/);
                    const cleanAddr = addr.replace(/, Pincode:\s*\d{6}/, '');
                    onSubmit({
                      customerName: user?.fullName || '',
                      mobile: user?.mobile || '',
                      address: cleanAddr,
                      pincode: pincodeMatch ? pincodeMatch[1] : ''
                    });
                  }}
                  className="btn-primary py-1.5 px-4 text-xs"
                >
                  Deliver Here
                </button>
              </div>
            ))}
          </div>
          <button 
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="mt-4 w-full border-2 border-dashed border-gray-200 rounded-lg p-3 text-sm font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition"
          >
            + Add New Address
          </button>
        </div>
      )}

      {/* Form (Show if adding new or no addresses) */}
      {(isAddingNew || previousAddresses.length === 0) && (
        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-soft">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-black flex items-center gap-2">
              <MapPin className="text-green-600" /> New Shipping Details
            </h2>
            {previousAddresses.length > 0 && (
              <button 
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-sm font-bold text-gray-600 hover:text-gray-900"
              >
                Back to Saved
              </button>
            )}
          </div>
          
          <div className="grid gap-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input className="form-input pl-10" required placeholder="Full Name *" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                className="form-input pl-10" 
                required 
                placeholder="Mobile Number *" 
                value={form.mobile} 
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit mobile number"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea 
                className="form-input pl-10 min-h-24" 
                required 
                placeholder="Flat, House no., Building, Company, Apartment *" 
                value={form.address} 
                onChange={(e) => setForm({ ...form, address: e.target.value })} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input className="form-input" required placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="relative">
                <input className="form-input" required placeholder="State *" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>

            <div className="relative">
              <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                className="form-input pl-10" 
                required 
                placeholder="Pincode *" 
                value={form.pincode} 
                onChange={(e) => setForm({ ...form, pincode: e.target.value })} 
                pattern="[0-9]{6}"
                title="Please enter a valid 6-digit pincode"
              />
            </div>

            <button className="btn-primary h-12 mt-2 w-full text-lg" disabled={saveLoading}>
              {saveLoading ? 'Confirming...' : 'Confirm Details'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
