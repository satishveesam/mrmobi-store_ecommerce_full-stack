import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Plus } from 'lucide-react';
import { addToCartAsync } from '../../redux/slices/cartSlice.js';
import { addToWishlistAsync, removeFromWishlistAsync } from '../../redux/slices/wishlistSlice.js';
import { formatCurrency, API_BASE_URL } from '../../utils/constants.js';
import useAuth from '../../hooks/useAuth.js';
import { checkQuickDeliveryEligibility } from '../../utils/delivery.js';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const inWishlist = wishlistItems.some((item) => item.productId === product.id);
  const cartItems = useSelector((state) => state.cart?.items || []);
  const isInCart = cartItems.some((item) => item.id === product.id);
  const [isQuickEligible, setIsQuickEligible] = useState(false);

  useEffect(() => {
    let active = true;
    const runCheck = async () => {
      const eligible = await checkQuickDeliveryEligibility();
      if (active) setIsQuickEligible(eligible);
    };

    runCheck();

    const handleLocationChange = () => {
      runCheck();
    };

    window.addEventListener('deliveryLocationChanged', handleLocationChange);
    return () => {
      active = false;
      window.removeEventListener('deliveryLocationChanged', handleLocationChange);
    };
  }, []);
  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (inWishlist) {
      dispatch(removeFromWishlistAsync(product.id));
    } else {
      dispatch(addToWishlistAsync(product.id));
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingCartAction', JSON.stringify({ type: 'ADD', product }));
      navigate('/login');
      return;
    }
    dispatch(addToCartAsync({ productId: product.id, quantity: 1 }));
  };

  const original = product.originalPrice ?? product.mrpPrice ?? null;
  const discount = product.discountPercentage ?? product.discountPercent ?? 0;
  const finalPrice = product.discountedPrice ?? product.price ?? 0;
  const showDiscount = Number(discount) > 0 && original != null;

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL.replace('/api', '')}${url}`;
  };

  const primaryImage = product.images?.length > 0 ? product.images[0] : product.imageUrl;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 h-full"
    >
      <Link to={`/product/${product.id}`} className="block h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={getImageUrl(primaryImage) || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Discount Badge */}
          {showDiscount && (
            <div className="absolute top-1.5 left-1.5 bg-red-600 text-[7px] sm:text-[8px] font-black text-white px-1 py-0.5 rounded shadow-lg uppercase leading-none">
               {Math.round(Number(discount))}% OFF
            </div>
          )}

          {/* Quick Delivery Badge */}
          {isQuickEligible && (product.quickDelivery ?? true) && (
            <div className="absolute bottom-1.5 left-1.5 bg-amber-500/90 backdrop-blur-sm text-[7px] sm:text-[9px] font-black text-white px-1.5 py-0.5 rounded-lg shadow-sm flex items-center gap-0.5 animate-pulse select-none z-10">
               <span>⚡ Quick Delivery</span>
            </div>
          )}
          
          {/* Wishlist Button */}
          <button 
            className="absolute top-1.5 right-1.5 p-1 sm:p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm active:scale-95"
            onClick={handleWishlistToggle}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={13} fill={inWishlist ? "currentColor" : "none"} className={inWishlist ? "text-red-500 sm:w-4 sm:h-4" : "sm:w-4 sm:h-4"} />
          </button>
        </div>

        <div className="flex flex-col flex-grow gap-1 p-2 md:p-4">
          <div className="min-h-[28px] md:min-h-[44px]">
            <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 truncate">{product.category || 'Mobile'}</p>
            <h3 className="line-clamp-2 text-[9px] sm:text-sm font-bold text-gray-950 leading-tight group-hover:text-gray-600 transition-colors tracking-tight mt-0.5">{product.name}</h3>
          </div>

          <div className="mt-auto pt-1 flex flex-col md:flex-row md:items-center justify-between gap-1">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-base font-black text-gray-950">{formatCurrency(finalPrice)}</span>
              {showDiscount && (
                <span className="text-[8px] sm:text-xs font-medium text-gray-400 line-through leading-none">
                  {formatCurrency(original)}
                </span>
              )}
            </div>

            <div className="hidden md:flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-[10px] font-black text-green-700">
              <Star size={12} fill="currentColor" />
              <span>4.4</span>
            </div>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:grid mt-3 grid-cols-2 gap-2">
            {isInCart ? (
              <button
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-green-50 text-xs font-black text-green-700 transition-all hover:bg-green-100 active:scale-95 border border-green-200/50"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/cart'); }}
              >
                <ShoppingCart size={16} /> Go to Cart
              </button>
            ) : (
              <button
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gray-100 text-xs font-black text-gray-900 transition-all hover:bg-gray-200 active:scale-95"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={16} /> Add
              </button>
            )}
            <button
              className="flex h-10 items-center justify-center rounded-xl bg-gray-900 text-xs font-black text-white transition-all hover:bg-gray-800 active:scale-95 shadow-md"
              onClick={(e) => { e.preventDefault(); navigate(`/product/${product.id}`); }}
            >
              Buy Now
            </button>
          </div>

          {/* Mobile Button */}
          {isInCart ? (
            <button
              className="md:hidden mt-1.5 flex h-8 items-center justify-center gap-1 rounded-xl bg-green-600 text-[9px] font-black uppercase tracking-wider text-white transition-all hover:bg-green-700 active:scale-95 w-full shadow-sm"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/cart'); }}
            >
              <ShoppingCart size={11} /> Go to Cart
            </button>
          ) : (
            <button
              className="md:hidden mt-1.5 flex h-8 items-center justify-center gap-1 rounded-xl bg-gray-950 text-[9px] font-black uppercase tracking-wider text-white transition-all hover:bg-gray-800 active:scale-95 w-full shadow-sm"
              onClick={handleAddToCart}
            >
              <Plus size={11} /> Add to Cart
            </button>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
