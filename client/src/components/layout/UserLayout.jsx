import { useEffect, useState, useRef } from 'react';
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

  // Position and Drag States for Guest Cart FAB
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(false);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    setIsDragging(true);
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    setIsDragging(false);
    const touch = e.touches[0];
    dragStart.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.current.x,
      y: touch.clientY - dragStart.current.y
    });
  };

  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const handleButtonClick = (e) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Directly navigate without any login prompt
    navigate('/cart');
  };

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
            .guest-floating-cart-btn {
              position: fixed;
              bottom: 80px;
              right: 20px;
              z-index: 99999;
              width: 48px;
              height: 48px;
              border-radius: 9999px;
              background: #000000;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
              cursor: grab;
              transition: transform 0.1s ease, box-shadow 0.3s ease, background-color 0.3s ease;
              border: 2px solid rgba(255, 255, 255, 0.55);
              touch-action: none;
              user-select: none;
            }
            .guest-floating-cart-btn:active {
              cursor: grabbing;
              transform: scale(0.95);
            }
            .guest-floating-cart-btn:hover {
              background: #121212;
              box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55);
            }
            .guest-cart-badge {
              position: absolute;
              top: -4px;
              right: -4px;
              background-color: #dc2626;
              color: #ffffff;
              font-family: inherit;
              font-size: 10px;
              font-weight: 900;
              border-radius: 9999px;
              min-width: 18px;
              height: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0 4px;
              border: 1.5px solid #000000;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              line-height: 1;
            }
          `}</style>
          <button
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={handleButtonClick}
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            className="guest-floating-cart-btn animate-in fade-in zoom-in duration-300"
            aria-label="View Guest Cart"
          >
            <div className="relative flex items-center justify-center w-full h-full">
              <ShoppingCart size={18} className="text-white" />
              <span className="guest-cart-badge">
                {cartCount}
              </span>
            </div>
          </button>
        </>
      )}
    </div>
  );
}
