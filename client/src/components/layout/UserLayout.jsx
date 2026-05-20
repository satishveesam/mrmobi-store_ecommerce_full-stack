import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CategoryIconBar from '../common/CategoryIconBar.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import { fetchCart } from '../../redux/slices/cartSlice';
import useAuth from '../../hooks/useAuth.js';

export default function UserLayout() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const isProductPage = /^\/product\/[^/]+$/.test(location.pathname);

  const shouldHideCategoryIconBar = isProductPage || 
                                    ['/products', '/login', '/signup'].includes(location.pathname);

  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
    }
  }, [token, dispatch]);

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
    </div>
  );
}
