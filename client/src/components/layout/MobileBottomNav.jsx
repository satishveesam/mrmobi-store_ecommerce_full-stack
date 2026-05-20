import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home as HomeIcon, ShoppingBag, Heart, ShoppingCart } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';

export default function MobileBottomNav() {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useSelector((state) => state.wishlist.count);

  if (!isAuthenticated || role === 'ADMIN' || location.pathname === '/addresses') return null;

  const navItems = [
    { to: '/', label: 'Home', icon: HomeIcon },
    { to: '/products', label: 'Products', icon: ShoppingBag },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, count: wishlistCount },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, count: cartCount },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <nav className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full transition-all active:scale-95 ${
                  isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-gray-100' : ''}`}>
                     <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  {item.count > 0 && (
                    <span className="absolute top-2 right-1/4 translate-x-2 -translate-y-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
