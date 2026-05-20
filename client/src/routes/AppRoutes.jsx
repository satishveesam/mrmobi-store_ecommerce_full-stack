import { Navigate, Route, Routes } from 'react-router-dom';
import UserLayout from '../components/layout/UserLayout.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import useAuth from '../hooks/useAuth.js';
import Home from '../pages/user/Home.jsx';
import ProductListing from '../pages/user/ProductListing.jsx';
import ProductDetailsPage from '../pages/user/ProductDetailsPage.jsx';
import Cart from '../pages/user/Cart.jsx';
import Wishlist from '../pages/user/Wishlist.jsx';
import Checkout from '../pages/user/Checkout.jsx';
import Login from '../pages/user/Login.jsx';
import Signup from '../pages/user/Signup.jsx';
import MyOrders from '../pages/user/MyOrders.jsx';
import Profile from '../pages/user/Profile.jsx';
import Addresses from '../pages/user/Addresses.jsx';
import NotFound from '../pages/user/NotFound.jsx';
import AdminLogin from '../pages/admin/AdminLogin.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ProductManagement from '../pages/admin/ProductManagement.jsx';
import Orders from '../pages/admin/Orders.jsx';
import BannerManagement from '../pages/admin/BannerManagement.jsx';
import AdminUsers from '../pages/admin/AdminUsers.jsx';
import CategoryManagement from '../pages/admin/CategoryManagement.jsx';
import AdminReviews from '../pages/admin/AdminReviews.jsx';
import AdminOutOfStock from '../pages/admin/AdminOutOfStock.jsx';
import ShippingManagement from '../pages/admin/ShippingManagement.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AdminProtectedRoute({ children }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
      </Route>
      <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<Orders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="banners" element={<BannerManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="out-of-stock" element={<AdminOutOfStock />} />
        <Route path="shipping" element={<ShippingManagement />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
