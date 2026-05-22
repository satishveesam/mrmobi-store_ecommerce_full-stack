import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CategoryIconBar from '../common/CategoryIconBar.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import { fetchCart } from '../../redux/slices/cartSlice';
import { fetchProducts } from '../../redux/slices/productSlice.js';
import useAuth from '../../hooks/useAuth.js';

export default function UserLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const isProductPage = /^\/product\/[^/]+$/.test(location.pathname);

  const cartItems = useSelector((state) => state.cart?.items || []);
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const shouldHideCategoryIconBar = isProductPage || 
                                    ['/products', '/login', '/signup'].includes(location.pathname);

  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
    }
  }, [token, dispatch]);

  // Background polling to auto-refresh product list (keeps catalog updated in real-time)
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchProducts());
    }, 25000); // 25 seconds interval
    return () => clearInterval(interval);
  }, [dispatch]);

  const showMobileBottomNav = isAuthenticated && role !== 'ADMIN' && !['/addresses', '/login', '/signup'].includes(location.pathname);

  return (
    <div className={`app-shell min-h-screen flex flex-col ${showMobileBottomNav ? 'pb-16 md:pb-0' : ''}`}>
      <Navbar />
      {!shouldHideCategoryIconBar && <CategoryIconBar />}
      <main className="w-full flex-grow">
        <Outlet />
      </main>
      <div className={isProductPage ? "hidden sm:block" : ""}>
        {!['/login', '/signup'].includes(location.pathname) && <Footer />}
      </div>
      <MobileBottomNav />

      {/* Floating moving cart button for non-logged in guest users */}
      {!isAuthenticated && cartCount > 0 && (
        <>
          <style>{`
            @keyframes guestCartFloat {
              0% {
                transform: translate(0, 0);
              }
              20% {
                transform: translate(-30px, -140px);
              }
              40% {
                transform: translate(-140px, -70px);
              }
              60% {
                transform: translate(-70px, 100px);
              }
              80% {
                transform: translate(-15px, -40px);
              }
              100% {
                transform: translate(0, 0);
              }
            }
            .guest-floating-cart-btn {
              position: fixed;
              bottom: 80px;
              right: 20px;
              z-index: 99999;
              width: 46px;
              height: 46px;
              border-radius: 9999px;
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
              cursor: pointer;
              transition: all 0.3s ease;
              animation: guestCartFloat 20s infinite alternate ease-in-out;
              border: 2px solid rgba(255, 255, 255, 0.4);
            }
            .guest-floating-cart-btn:hover {
              animation-play-state: paused;
              transform: scale(1.15) !important;
              background: linear-gradient(135deg, #1d4ed8, #1e40af);
              box-shadow: 0 12px 28px rgba(29, 78, 216, 0.6);
            }
            .guest-floating-cart-btn:active {
              transform: scale(0.95) !important;
            }
          `}</style>
          <button
            onClick={() => navigate('/cart')}
            className="guest-floating-cart-btn animate-in fade-in zoom-in duration-300"
            aria-label="View Guest Cart"
          >
            <div className="relative">
              <ShoppingCart size={18} className="text-white" />
              <span className="absolute -top-3 -right-3 bg-red-600 text-white font-black text-[9px] rounded-full h-4.5 w-4.5 flex items-center justify-center border border-white shadow-sm animate-bounce">
                {cartCount}
              </span>
            </div>
          </button>
        </>
      )}
    </div>
  );
}
