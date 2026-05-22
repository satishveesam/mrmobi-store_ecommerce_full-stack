import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, ShieldCheck, Truck, RefreshCcw, Heart } from 'lucide-react';
import { addToCartAsync } from '../../redux/slices/cartSlice.js';
import { addToWishlistAsync, removeFromWishlistAsync } from '../../redux/slices/wishlistSlice.js';
import { formatCurrency, API_BASE_URL } from '../../utils/constants.js';
import useAuth from '../../hooks/useAuth.js';
import { checkQuickDeliveryEligibility } from '../../utils/delivery.js';

export default function ProductDetails({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isInWishlist = wishlistItems.some((item) => item.productId === product.id);
  const cartItems = useSelector((state) => state.cart.items);
  const isInCart = cartItems.some((item) => item.id === product.id);
  const isProductPremium = product.name?.toLowerCase().includes('premium') || 
                           product.description?.toLowerCase().includes('premium') || 
                           Number(product.discountedPrice ?? product.price ?? 0) > 20000;

  const images = product.images?.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : []);
  const defaultImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80';
  
  const [selectedImage, setSelectedImage] = useState(defaultImage);
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

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL.replace('/api', '')}${url}`;
  };

  const original = product.originalPrice ?? product.mrpPrice ?? null;
  const discount = product.discountPercentage ?? product.discountPercent ?? 0;
  const finalPrice = product.discountedPrice ?? product.price ?? 0;
  const showDiscount = Number(discount) > 0 && original != null;

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to complete your purchase.');
      sessionStorage.setItem('pendingCheckoutRedirect', 'true');
      sessionStorage.setItem('pendingBuyNowItem', JSON.stringify({ ...product, quantity: 1 }));
      navigate('/login');
    } else {
      navigate('/checkout', { state: { buyNowItem: { ...product, quantity: 1 } } });
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isInWishlist) {
      dispatch(removeFromWishlistAsync(product.id));
    } else {
      dispatch(addToWishlistAsync(product.id));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm w-full max-w-full">
      {/* Left: Image Container */}
      <div className="lg:w-1/2 space-y-4 min-h-0">

        <div className="w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-50 aspect-[4/3] sm:aspect-square relative">
          <img
            src={getImageUrl(selectedImage)}
            alt={product.name}
            className="h-full w-full object-cover transition-all duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80';
            }}
          />

          {/* Rating box (bottom-left on image) */}
          <div className="absolute bottom-3 left-3 bg-white/95 border border-gray-200 rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-soft">
            <span className="text-xs font-black text-gray-900">⭐</span>
            <span className="text-xs font-black text-gray-900">4.4</span>
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setSelectedImage(img)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === img ? 'border-green-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img 
                  src={getImageUrl(img)} 
                  alt={`Thumbnail ${idx}`} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=150&q=80';
                  }}
                />
              </button>
            ))}
          </div>
        )}
        
        {/* Trust Badges - Desktop Only or Small Row */}
        <div className="grid grid-cols-3 gap-2">
            {[
                {icon: ShieldCheck, label: 'Secure'},
                {icon: Truck, label: 'Fast Del.'},
                {icon: RefreshCcw, label: '7 Day Ret.'}
            ].map((item, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 text-[10px] font-bold text-gray-500">
                    <item.icon size={16} className="mb-1 text-gray-400" />
                    {item.label}
                </div>
            ))}
        </div>
      </div>

      {/* Right: Info Container */}
      <div className="lg:w-1/2 flex flex-col min-h-0">
        <div className="mb-3.5 sm:mb-5 max-w-full overflow-hidden">
          <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              {product.category || 'Special Edition'}
            </span>
            {isProductPremium && (
              <span className="inline-flex items-center text-[7px] sm:text-[8px] font-black bg-amber-500/10 text-amber-700 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                Premium Selection
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug mb-2 sm:mb-3.5 break-words">
            {product.name}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed break-words">
            {product.description || 'Experience the next level of technology with our premium selection. Designed for performance and style.'}
          </p>
        </div>

        {isQuickEligible && (product.quickDelivery ?? true) && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-3.5 py-2.5 flex items-start gap-2.5 text-amber-800 text-[11px] font-bold animate-pulse">
            <Zap size={15} className="text-amber-500 fill-amber-500 mt-0.5 flex-shrink-0 animate-bounce" />
            <div className="space-y-0.5 text-left">
              <p className="text-slate-900 font-extrabold text-[12px]">⚡ Super Fast Express Delivery Available!</p>
              <p className="text-slate-550 font-medium text-[10px] leading-relaxed">Your location qualifies for lightning-fast 2-hour delivery on this item!</p>
            </div>
          </div>
        )}

        <div className="mb-3 px-3 py-2 bg-slate-50 border border-slate-100 rounded-2xl inline-block max-w-max">
          {/* Saver Deal (small green box) above the price line */}
          {showDiscount && (
            <div className="mb-1">
              <span className="bg-green-600/10 border border-green-600/20 text-green-700 text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded-md inline-block whitespace-nowrap leading-none">
                Saver Deal
              </span>
            </div>
          )}

          {/* Single line: Discount% + MRP strike + Actual price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-black text-slate-950 whitespace-nowrap">
              {formatCurrency(finalPrice)}
            </span>

            {showDiscount && (
              <span className="text-xs sm:text-sm font-semibold text-slate-400 line-through whitespace-nowrap">
                {formatCurrency(original)}
              </span>
            )}

            {showDiscount && (
              <span className="text-xs sm:text-sm font-black text-green-600 whitespace-nowrap">
                {Math.round(Number(discount))}% OFF
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-3">
           <div className="flex items-center gap-2">
              {product.stock > 0 && product.stock > 5 ? (
                // hide stock info when stock > 5
                <span className="text-xs font-bold text-gray-600"></span>
              ) : product.stock > 0 ? (
                // show "Only 5 Left" in red when stock <= 5
                <>
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                  <span className="text-xs font-bold text-red-600">
                    Only 5 Left
                  </span>
                </>
              ) : (
                // out of stock
                <>
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                  <span className="text-xs font-bold text-gray-600">Out of Stock</span>
                </>
              )}
           </div>

            {/* Desktop/tablet buttons (keep scrolling normally) */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
                {isInCart ? (
                  <button
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-green-600 border border-green-600 text-white font-bold text-xs hover:bg-green-700 transition-all self-center px-4 w-full max-w-[180px] mx-auto shadow-sm shadow-green-100"
                    onClick={() => navigate('/cart')}
                  >
                    <ShoppingCart size={14} /> Go to Cart
                  </button>
                ) : (
                  <button
                    disabled={product.stock <= 0}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white border border-gray-200 text-gray-900 font-bold text-xs hover:bg-gray-50 transition-all disabled:opacity-50"
                    onClick={() => dispatch(addToCartAsync({ productId: product.id, quantity: 1, product }))}
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                )}
               <button
                 onClick={handleWishlist}
                 className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border font-bold text-xs transition-all ${
                   isInWishlist
                     ? 'bg-red-50 border-red-500 text-red-500 hover:bg-red-100'
                     : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                 }`}
               >
                 <Heart size={14} fill={isInWishlist ? 'currentColor' : 'none'} /> Wishlist
               </button>
               <button
                 disabled={product.stock <= 0}
                 className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gray-950 text-white font-bold text-xs hover:bg-gray-800 shadow-sm transition-all disabled:opacity-50"
                 onClick={handleBuyNow}
               >
                 <Zap size={14} /> Buy Now
               </button>
            </div>
         </div>
       </div>

      {/* Mobile sticky bottom action bar */}
      <div 
        className="md:hidden fixed bottom-0 left-0 w-full z-[9999] bg-white border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom)]"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="px-3 py-2">
          <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
            <button
              onClick={handleWishlist}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                isInWishlist
                  ? 'bg-red-50 border-red-500 text-red-500 hover:bg-red-100'
                  : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Heart size={14} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
            {isInCart ? (
              <button
                className="flex h-9 items-center justify-center gap-1 rounded-lg bg-green-600 border border-green-600 text-white font-bold text-xs hover:bg-green-700 transition-all self-center py-1 px-3 w-full"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart size={12} /> Go to Cart
              </button>
            ) : (
              <button
                disabled={product.stock <= 0}
                className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-white border border-gray-200 text-gray-900 font-bold text-xs hover:bg-gray-50 transition-all disabled:opacity-50"
                onClick={() => dispatch(addToCartAsync({ productId: product.id, quantity: 1, product }))}
              >
                <ShoppingCart size={12} /> Add
              </button>
            )}
            <button
              disabled={product.stock <= 0}
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-gray-950 text-white font-bold text-xs hover:bg-gray-800 shadow-sm transition-all disabled:opacity-50"
              onClick={handleBuyNow}
            >
              <Zap size={12} /> Buy Now
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

