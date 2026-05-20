import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import WishlistItemComponent from '../../components/wishlist/WishlistItem.jsx';
import { fetchWishlist } from '../../redux/slices/wishlistSlice.js';

export default function Wishlist() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.wishlist.items);
  const loading = useSelector((state) => state.wishlist.loading);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="container-page py-12 text-center">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading wishlist...</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container-page py-12 text-center">
        <h1 className="text-xl font-black text-gray-950 tracking-tight">Your wishlist is empty</h1>
        <p className="text-xs text-gray-500 mt-1">Start adding products to your wishlist</p>
        <Link to="/products" className="inline-block mt-6 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-blue-100">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-4 sm:py-6">
      <div className="mb-4">
        <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">My Wishlist</h1>
        <p className="text-[8px] sm:text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} in your wishlist</p>
      </div>
      <div className="grid gap-2.5">
        {items.map((item) => <WishlistItemComponent key={item.id} item={item} />)}
        <div className="mt-2 text-right">
          <Link to="/products" className="inline-block text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">← Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
