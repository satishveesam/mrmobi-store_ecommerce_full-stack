import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Image as ImageIcon,
  Tag,
  LogOut, 
  ChevronRight,
  Menu,
  MessageSquare,
  PackageX,
  Settings,
  Home
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice.js';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchOrders } from '../../redux/slices/orderSlice.js';

const playAlarmSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    // Tone 1: high frequency pleasant bell
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5 note
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    // Tone 2: secondary harmonic chime
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now); // A4 note
    osc2.frequency.exponentialRampToValueAtTime(880, now + 0.2);
    gain2.gain.setValueAtTime(0.1, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.6);
    osc2.start(now);
    osc2.stop(now + 0.8);
  } catch (err) {
    console.error('AudioContext alarm error', err);
  }
};

const adminNavItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/shipping', label: 'Shipping Settings', icon: Settings },
  { to: '/admin/homepage-settings', label: 'Homepage Settings', icon: Home },
  { to: '/admin/out-of-stock', label: 'Stock Alerts', icon: PackageX, badge: 'oos' },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/reviews', label: 'Customer Reviews', icon: MessageSquare },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const products = useSelector((state) => state.products.items);
  const oosCount = products.filter((p) => p.stock !== null && p.stock !== undefined && p.stock <= 0).length;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const orders = useSelector((state) => state.orders.items) || [];
  const [prevOrdersCount, setPrevOrdersCount] = useState(null);

  // Poll orders in background every 20 seconds
  useEffect(() => {
    dispatch(fetchOrders());
    const interval = setInterval(() => {
      dispatch(fetchOrders());
    }, 20000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Monitor order count and trigger Synthesizer Chime
  useEffect(() => {
    if (orders.length > 0) {
      if (prevOrdersCount !== null && orders.length > prevOrdersCount) {
        playAlarmSound();
        toast.info(`🔔 New order received! Total orders: ${orders.length}`, {
          position: "top-right",
          autoClose: 5000
        });
      }
      setPrevOrdersCount(orders.length);
    }
  }, [orders, prevOrdersCount]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    dispatch(logout());
    window.location.href = '/';
  };

  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mb-3"></div>
        <p className="text-sm font-semibold">Logging out...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-slate-900 text-slate-100 transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 border-r border-slate-800 flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-slate-800/60">
            <Link to="/admin/dashboard" className="text-base font-bold tracking-tight flex items-center gap-1.5">
              <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-xs font-extrabold">Mr</span>
              <span>Mobi <span className="text-emerald-500 text-[10px] font-bold tracking-wider">ADMIN</span></span>
            </Link>
          </div>

          <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group text-[13px]
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}
                `}
              >
                {({ isActive }) => (
                  <>
                    {item.icon && <item.icon size={16} className="shrink-0" />}
                    <span className="font-semibold flex-1">{item.label}</span>
                    {/* Red OOS badge */}
                    {item.badge === 'oos' && oosCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[16px] text-center ${
                        isActive ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'
                      }`}>
                        {oosCount}
                      </span>
                    )}
                    <ChevronRight className={`transition-all duration-150 shrink-0 ${
                      isActive ? 'opacity-100 translate-x-0.5' : 'opacity-0 -translate-x-0.5 group-hover:opacity-60 group-hover:translate-x-0'
                    }`} size={12} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-3 mt-auto border-t border-slate-800/60">
            <div className="flex items-center gap-2.5 mb-2 px-1">
               <div className="h-7 w-7 rounded-md bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-sm uppercase shrink-0">
                {user?.username?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate text-slate-200 leading-tight">{user?.username || 'Admin'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                  <span className="text-[10px] text-emerald-500 font-medium tracking-wide">Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-all text-[13px] font-semibold mt-1"
            >
              <LogOut size={16} className="shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-12 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 shadow-sm shadow-slate-100/5 flex-shrink-0">
          <button 
            className="lg:hidden p-1 text-slate-500 hover:bg-slate-50 border border-slate-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={16} />
          </button>

          <div className="flex-1 px-4 hidden md:block">
             <h1 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end leading-none">
                <span className="text-[9px] font-medium text-slate-500">Welcome back,</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mt-0.5">Super Admin</span>
             </div>
             <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                <Users size={16} />
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/40 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
