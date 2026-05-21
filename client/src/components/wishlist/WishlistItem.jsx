import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromWishlistAsync } from '../../redux/slices/wishlistSlice.js';
import { addToCartAsync } from '../../redux/slices/cartSlice.js';
import { formatCurrency } from '../../utils/constants.js';

export default function WishlistItemComponent({ item }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = () => {
    dispatch(removeFromWishlistAsync(item.productId));
  };

  const handleAddToCart = () => {
    const productPayload = {
      id: item.productId,
      name: item.productName,
      price: item.price,
      imageUrl: item.productImage,
      category: item.category,
      discountPercent: item.discountPercent,
      originalPrice: item.originalPrice,
    };
    dispatch(addToCartAsync({ 
      productId: item.productId, 
      quantity: 1, 
      product: productPayload 
    }));
    dispatch(removeFromWishlistAsync(item.productId));
  };

  const showDiscount = Number(item.discountPercent) > 0 && item.originalPrice != null;

  return (
    <div className="flex gap-3 rounded-2xl bg-white p-2.5 sm:p-3 shadow-soft border border-gray-100 items-center">
      <img src={item.productImage} alt={item.productName} className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover flex-shrink-0 cursor-pointer" onClick={() => navigate(`/product/${item.productId}`)} />
      
      <div className="flex-1 flex flex-col justify-between min-w-0 h-full">
        <div className="cursor-pointer" onClick={() => navigate(`/product/${item.productId}`)}>
          <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight line-clamp-2 tracking-tight">{item.productName}</h3>
          <p className="text-[7px] sm:text-[8px] text-slate-400/80 font-black uppercase tracking-widest mt-0.5">{item.category}</p>
        </div>
        
        <div className="mt-1 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-slate-900 text-[10px] sm:text-xs">{formatCurrency(item.price)}</span>
              {showDiscount && (
                <span className="text-[8px] sm:text-[9px] font-medium text-slate-400 line-through">
                  {formatCurrency(item.originalPrice)}
                </span>
              )}
            </div>
            {showDiscount && (
              <span className="inline-block text-[7px] sm:text-[8px] font-extrabold text-green-700 bg-green-600/10 border border-green-600/20 rounded px-1.5 mt-0.5 leading-none">
                {Math.round(Number(item.discountPercent))}% OFF
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              className="rounded-lg bg-red-50 p-1.5 text-red-500 hover:bg-red-100 transition active:scale-95" 
              onClick={handleRemove}
              title="Remove from wishlist"
            >
              <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
            </button>

            <button 
              onClick={handleAddToCart}
              className="flex h-7 items-center gap-1 rounded-lg bg-green-600 px-2.5 sm:px-3 text-[10px] sm:text-xs font-bold text-white transition hover:bg-green-700 active:scale-95"
              title="Add to cart"
            >
              <ShoppingCart size={10} className="sm:w-3 sm:h-3" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
