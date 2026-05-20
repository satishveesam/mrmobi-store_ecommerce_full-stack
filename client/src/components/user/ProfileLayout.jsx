import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { User, ShoppingBag, MapPin, ChevronRight, Power } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

export default function ProfileLayout({ children }) {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-[#f1f3f6] min-h-screen py-4 md:py-8">
      <div className="container-page max-w-[1248px] grid lg:grid-cols-[280px_1fr] gap-4">
        
        {/* Sidebar */}
        <aside className="space-y-4">
          {/* User Header */}
          <div className="bg-white p-3 flex items-center gap-4 shadow-sm rounded-sm">
            <img 
              src="/logo.png" 
              alt="Website Logo" 
              className="h-12 w-12 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-medium">Hello,</span>
              <span className="text-base font-bold truncate max-w-[160px]">{user?.fullName || user?.username?.split('@')[0]}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="bg-white shadow-sm rounded-sm overflow-hidden">
            
            {/* My Orders Section */}
            {!['/addresses', '/profile'].includes(location.pathname) && (
              <Link 
                to="/my-orders"
                className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition group"
              >
                <div className="flex items-center gap-4 uppercase font-bold text-gray-500 text-sm group-hover:text-blue-600 transition">
                  <ShoppingBag size={20} className="text-blue-600" />
                  <span>My Orders</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </Link>
            )}

            {/* Account Settings Section */}
            <div className="border-b border-gray-100">
              <div className="flex items-center gap-4 p-4 uppercase font-bold text-gray-500 text-sm">
                <User size={20} className="text-blue-600" />
                <span>Account Settings</span>
              </div>
              <div className="flex flex-col">
                <Link 
                  to="/profile"
                  className={`pl-14 py-3 text-sm transition ${isActive('/profile') ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 hover:text-blue-600'}`}
                >
                  Profile Information
                </Link>
                <Link 
                  to="/addresses"
                  className={`pl-14 py-3 text-sm transition ${isActive('/addresses') ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 hover:text-blue-600'}`}
                >
                  Manage Addresses
                </Link>
              </div>
            </div>

            {/* Logout Section */}
            {!['/addresses', '/profile'].includes(location.pathname) && (
              <button 
                onClick={() => dispatch(logout())}
                className="w-full flex items-center gap-4 p-4 uppercase font-bold text-gray-500 text-sm hover:bg-gray-50 hover:text-blue-600 transition"
              >
                <Power size={20} className="text-blue-600" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="bg-white p-6 md:p-8 shadow-sm rounded-sm min-h-[500px]">
          {children}
        </main>

      </div>
    </div>
  );
}
