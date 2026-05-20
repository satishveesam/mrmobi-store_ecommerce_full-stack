import { Minus, Plus, Trash2, Zap, Heart, AlertTriangle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCartAsync, updateQuantityAsync } from '../../redux/slices/cartSlice.js';
import { addToWishlistAsync } from '../../redux/slices/wishlistSlice.js';
import { formatCurrency, API_BASE_URL } from '../../utils/constants.js';

export default function CartItem({ item }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Stock check ──────────────────────────────────────────────────────────
  const stock = item.stock ?? null;
  const isOutOfStock = stock !== null && stock <= 0;
  const isLowStock   = stock !== null && stock > 0 && stock <= 5;

  const handleUpdateQuantity = (newQty) => {
    if (isOutOfStock) return; // prevent qty change if OOS
    dispatch(updateQuantityAsync({ productId: item.id, quantity: Math.max(1, newQty) }));
  };
  const handleRemove = () => dispatch(removeFromCartAsync(item.id));
  const handleMoveToWishlist = async () => {
    await dispatch(addToWishlistAsync(item.id));
    dispatch(removeFromCartAsync(item.id));
  };

  const original    = item.originalPrice ?? item.mrpPrice ?? null;
  const discount    = item.discountPercentage ?? item.discountPercent ?? 0;
  const finalPrice  = item.discountedPrice ?? item.price ?? 0;
  const showDiscount = Number(discount) > 0 && original != null && !isOutOfStock;

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL.replace('/api', '')}${url}`;
  };
  const imgSrc =
    getImageUrl(item.images?.length > 0 ? item.images[0] : item.imageUrl) ||
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
      isOutOfStock ? 'border-red-200 opacity-80' : 'border-gray-100'
    }`}>

      {/* ── Out of Stock banner ── */}
      {isOutOfStock && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 border-b border-red-100">
          <AlertTriangle size={11} className="text-red-500 flex-shrink-0" />
          <p className="text-[10px] sm:text-xs font-bold text-red-600">
            Out of Stock — This item is currently unavailable
          </p>
        </div>
      )}

      {/* ── Top row: image + info + wishlist ── */}
      <div className="flex gap-2 sm:gap-3 p-2.5 sm:p-3 pb-1.5 sm:pb-2">
        {/* Image */}
        <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
          <img
            src={imgSrc}
            alt={item.name}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-100 ${
              isOutOfStock ? 'grayscale' : ''
            }`}
          />
          {/* Discount badge — hidden when OOS */}
          {showDiscount && (
            <span className="absolute top-0.5 left-0.5 text-[8px] sm:text-[9px] font-black bg-green-500 text-white px-1 py-0.5 rounded leading-tight whitespace-nowrap">
              {Math.round(Number(discount))}% OFF
            </span>
          )}
          {/* OOS overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 rounded-xl bg-white/50 flex items-center justify-center">
              <span className="text-[8px] sm:text-[9px] font-black text-red-600 bg-red-100 px-1 py-0.5 rounded-full uppercase tracking-wide">
                OOS
              </span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <h3 className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 pr-1 ${
                isOutOfStock ? 'text-gray-400' : 'text-gray-900'
              }`}>
                {item.name}
              </h3>
              {item.category && (
                <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium mt-0.5">{item.category}</p>
              )}
            </div>
            {/* Wishlist */}
            <button
              onClick={handleMoveToWishlist}
              title="Move to Wishlist"
              className="group flex-shrink-0 w-6 h-6 sm:w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-rose-500 hover:border-rose-300 transition"
            >
              <Heart size={10} className="group-hover:fill-rose-500 sm:w-3 sm:h-3" />
            </button>
          </div>

          {/* Price or OOS message */}
          <div className="mt-1">
            {isOutOfStock ? (
              <p className="text-[10px] sm:text-xs font-bold text-red-500">Currently unavailable</p>
            ) : (
              <>
                <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                  <span className="text-sm sm:text-base font-black text-gray-950">
                    {formatCurrency(finalPrice)}
                  </span>
                  {showDiscount && (
                    <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">
                      {formatCurrency(original)}
                    </span>
                  )}
                </div>
                {showDiscount && (
                  <p className="text-[10px] sm:text-[11px] font-bold text-green-600">
                    Save {formatCurrency(Number(original) - Number(finalPrice))}
                  </p>
                )}
                {isLowStock && (
                  <p className="text-[10px] sm:text-[11px] font-bold text-orange-500 mt-0.5">
                    Only {stock} left!
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom row: qty + remove + buy ── */}
      <div className="flex items-center justify-between gap-1.5 px-2.5 sm:px-3 pb-2.5 sm:pb-3">

        {/* Qty stepper — disabled when OOS */}
        <div className={`flex items-center rounded-lg border h-7 sm:h-9 ${
          isOutOfStock ? 'border-gray-100 bg-gray-50/50 opacity-40 pointer-events-none' : 'border-gray-200 bg-gray-50'
        }`}>
          <button
            className="px-2 sm:px-3 text-gray-500 hover:text-blue-600 transition h-full rounded-l-lg disabled:opacity-40"
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={isOutOfStock}
          >
            <Minus size={10} />
          </button>
          <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-black text-gray-900">{item.quantity}</span>
          <button
            className="px-2 sm:px-3 text-gray-500 hover:text-blue-600 transition h-full rounded-r-lg"
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            disabled={isOutOfStock}
          >
            <Plus size={10} />
          </button>
        </div>

        {/* Right: remove + buy + total */}
        <div className="flex items-center gap-1.5">
          {/* Remove */}
          <button
            className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition"
            onClick={handleRemove}
            title="Remove from cart"
          >
            <Trash2 size={12} />
          </button>

          {/* Buy Now — hidden when OOS */}
          {isOutOfStock ? (
            <span className="h-7 sm:h-9 flex items-center px-2.5 rounded-lg bg-gray-100 text-gray-400 text-[10px] sm:text-xs font-bold whitespace-nowrap cursor-not-allowed">
              Unavailable
            </span>
          ) : (
            <button
              onClick={() => navigate('/checkout', { state: { buyNowItem: item } })}
              className="h-7 sm:h-9 flex items-center gap-1 rounded-lg bg-gray-900 px-3 text-[10px] sm:text-xs font-bold text-white hover:bg-gray-700 transition whitespace-nowrap"
            >
              <Zap size={9} fill="currentColor" /> Buy Now
            </button>
          )}

          {/* Item total — hidden on mobile, shown on desktop */}
          <span className={`text-sm font-black whitespace-nowrap min-w-[50px] sm:min-w-[60px] text-right hidden sm:block ${
            isOutOfStock ? 'text-gray-400 line-through' : 'text-gray-900'
          }`}>
            {formatCurrency(Number(finalPrice) * item.quantity)}
          </span>
        </div>
      </div>

      {/* Subtle total bar */}
      <div className="border-t border-gray-50 px-2.5 sm:px-3 py-1.5 bg-gray-50/60 flex justify-between items-center text-[10px] sm:text-xs">
        {isOutOfStock ? (
          <span className="text-[10px] sm:text-[11px] font-bold text-red-400">⚠ Remove this item to proceed</span>
        ) : (
          <>
            <span className="text-gray-400">
              {item.quantity} × {formatCurrency(finalPrice)}
            </span>
            <span className="font-black text-gray-700">
              Total: {formatCurrency(Number(finalPrice) * item.quantity)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
