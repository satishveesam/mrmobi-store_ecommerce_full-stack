import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import { updateUser } from '../../redux/slices/authSlice';
import ProfileLayout from '../../components/user/ProfileLayout';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    gender: user?.gender || '', // Need to add gender to backend/entity if needed, for now just UI
    email: user?.username || '',
    mobile: user?.mobile || ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authService.getProfile();
        dispatch(updateUser(data));
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.fullName?.split(' ')[0] || '',
        lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
        gender: user.gender || '',
        email: user.username || '',
        mobile: user.mobile || ''
      });
    }
  }, [user]);

  const handleUpdate = async (field) => {
    setLoading(true);
    try {
      const payload = {
        fullName: field === 'personal' ? `${formData.firstName} ${formData.lastName}`.trim() : user.fullName,
        mobile: field === 'mobile' ? formData.mobile : user.mobile,
        gender: formData.gender,
      };

      const { data } = await authService.updateProfile(payload);
      console.log('Update response from server:', data);
      
      // Update Redux state with actual data from server
      dispatch(updateUser({ 
        fullName: data.fullName,
        mobile: data.mobile,
        gender: data.gender
      }));
      
      toast.success('Updated successfully');
      if (field === 'personal') setIsEditingPersonal(false);
      if (field === 'email') setIsEditingEmail(false);
      if (field === 'mobile') setIsEditingMobile(false);
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileLayout>
      <div className="max-w-[700px] space-y-12">
        
        {/* Personal Information */}
        <section className="space-y-6">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
            <button 
              onClick={() => setIsEditingPersonal(!isEditingPersonal)}
              className="text-blue-600 font-bold text-sm hover:underline"
            >
              {isEditingPersonal ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text"
              disabled={!isEditingPersonal}
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="First Name"
              className={`h-11 border px-4 outline-none transition-all rounded-sm text-sm ${isEditingPersonal ? 'bg-white border-blue-600' : 'bg-gray-100 border-gray-200 cursor-not-allowed'}`}
            />
            <input 
              type="text"
              disabled={!isEditingPersonal}
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Last Name"
              className={`h-11 border px-4 outline-none transition-all rounded-sm text-sm ${isEditingPersonal ? 'bg-white border-blue-600' : 'bg-gray-100 border-gray-200 cursor-not-allowed'}`}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Your Gender</p>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  disabled={!isEditingPersonal}
                  checked={formData.gender === 'male'}
                  onChange={() => setFormData({...formData, gender: 'male'})}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm">Male</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  disabled={!isEditingPersonal}
                  checked={formData.gender === 'female'}
                  onChange={() => setFormData({...formData, gender: 'female'})}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm">Female</span>
              </label>
            </div>
          </div>

          {isEditingPersonal && (
            <button 
              onClick={() => handleUpdate('personal')}
              className="bg-blue-600 text-white px-10 h-11 font-bold rounded-sm shadow-sm hover:bg-blue-700 transition text-sm"
            >
              SAVE
            </button>
          )}
        </section>

        {/* Email Address */}
        <section className="space-y-4">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-gray-900">Email Address</h2>
            <button 
              onClick={() => setIsEditingEmail(!isEditingEmail)}
              className="text-blue-600 font-bold text-sm hover:underline"
            >
              {isEditingEmail ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          <div className="max-w-[400px]">
            <input 
              type="email"
              disabled={!isEditingEmail}
              value={formData.email}
              readOnly={!isEditingEmail}
              className={`h-11 w-full border px-4 outline-none transition-all rounded-sm text-sm ${isEditingEmail ? 'bg-white border-blue-600' : 'bg-gray-100 border-gray-200 cursor-not-allowed'}`}
            />
          </div>
          {isEditingEmail && (
            <button className="bg-blue-600 text-white px-10 h-11 font-bold rounded-sm shadow-sm hover:bg-blue-700 transition text-sm">
              SAVE
            </button>
          )}
        </section>

        {/* Mobile Number */}
        <section className="space-y-4">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-gray-900">Mobile Number</h2>
            <button 
              onClick={() => setIsEditingMobile(!isEditingMobile)}
              className="text-blue-600 font-bold text-sm hover:underline"
            >
              {isEditingMobile ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          <div className="max-w-[400px]">
            <input 
              type="text"
              disabled={!isEditingMobile}
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              className={`h-11 w-full border px-4 outline-none transition-all rounded-sm text-sm ${isEditingMobile ? 'bg-white border-blue-600' : 'bg-gray-100 border-gray-200 cursor-not-allowed'}`}
            />
          </div>
          {isEditingMobile && (
            <button 
              onClick={() => handleUpdate('mobile')}
              className="bg-blue-600 text-white px-10 h-11 font-bold rounded-sm shadow-sm hover:bg-blue-700 transition text-sm"
            >
              SAVE
            </button>
          )}
        </section>

      </div>
    </ProfileLayout>
  );
}
