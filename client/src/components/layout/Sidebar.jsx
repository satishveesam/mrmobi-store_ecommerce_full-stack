import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LayoutDashboard, Package, ReceiptText, LogOut, Image, Settings, Home } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice.js';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/shipping', label: 'Shipping Settings', icon: Settings },
  { to: '/admin/homepage-settings', label: 'Homepage Settings', icon: Home },
  { to: '/admin/orders', label: 'Orders', icon: ReceiptText },
  { to: '/admin/banners', label: 'Banners', icon: Image },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <aside className="rounded-lg bg-white p-3 shadow-soft md:min-h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-4 px-2 text-lg font-black text-green-700">Admin</div>
      <nav className="grid gap-2 flex-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${isActive ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100 w-full"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
