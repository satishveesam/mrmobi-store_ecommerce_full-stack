import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ShoppingBag, RotateCw } from 'lucide-react';
import api from '../../services/api.js';
import { orderService } from '../../services/orderService.js';
import { productService } from '../../services/productService.js';
import { formatCurrency, API_BASE_URL } from '../../utils/constants.js';

function OrderStatusMessage({ status }) {
  const s = String(status || '').toUpperCase();
  if (s === 'DELIVERED') {
    return <span className="rounded bg-green-100 px-2 py-1 text-xs font-black text-green-700">DELIVERED</span>;
  }
  if (s === 'SHIPPED') {
    return <span className="rounded bg-blue-100 px-2 py-1 text-xs font-black text-blue-700">SHIPPED</span>;
  }
  if (s === 'CONFIRMED') {
    return <span className="rounded bg-purple-100 text-purple-700 px-2 py-1 text-xs font-black">ORDER CONFIRMED</span>;
  }
  if (s === 'CANCELLED') {
    return <span className="rounded bg-red-100 text-red-700 px-2 py-1 text-xs font-black">CANCELLED</span>;
  }
  return (
    <span className="rounded bg-amber-50 px-2 py-1 text-xs font-black uppercase tracking-wide text-amber-800">
      PROCESSING
    </span>
  );
}

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL.replace('/api', '')}${url}`;
};

export default function MyOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState({});

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleOpenReviewModal = (productId, productName) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setRating(5);
    setComment('');
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProductId(null);
    setSelectedProductName('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        productId: selectedProductId,
        rating: Number(rating),
        comment: comment.trim()
      });
      toast.success('Thank you! Your review has been submitted.');
      handleCloseReviewModal();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to submit review. You may have already reviewed this product.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await orderService.getMyOrders();
      const orders = Array.isArray(data) ? data : [];
      setItems(orders);
      
      // Fetch images for unique product IDs
      const uniqueProductIds = [...new Set(orders.map(o => o.productId).filter(Boolean))];
      const imageMap = {};
      
      await Promise.all(uniqueProductIds.map(async (id) => {
        try {
          const res = await productService.getProduct(id);
          imageMap[id] = res.data.images?.[0] || res.data.imageUrl || res.data.imageURL || res.data.image;
        } catch (err) {
          console.error(`Failed to fetch product ${id}`, err);
        }
      }));
      
      setProductImages(imageMap);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const canCancel = (order) => {
    if (!order.createdAt) return false;
    const status = String(order.status || '').toUpperCase();
    if (['CANCELLED', 'SHIPPED', 'DELIVERED'].includes(status)) return false;
    
    try {
      const createdTime = new Date(order.createdAt).getTime();
      const now = Date.now();
      const diffMinutes = (now - createdTime) / (1000 * 60);
      return diffMinutes >= 0 && diffMinutes <= 30;
    } catch (e) {
      return false;
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully!');
      load();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to cancel order');
    }
  };

  useEffect(() => {
    load();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="container-page py-6 px-4 md:px-0 max-w-full overflow-hidden">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black">My Orders</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track your order status.</p>
        </div>
        <button 
          type="button" 
          onClick={load} 
          disabled={loading}
          className="p-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-all"
          aria-label="Refresh orders"
        >
          <RotateCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {!loading && !items.length ? (
        <div className="rounded-lg bg-white p-6 sm:p-8 text-center text-gray-600 shadow-soft">
          <p className="text-sm sm:text-base">No orders found.</p>
        </div>
      ) : (
        isMobile ? (
          /* Mobile Card View */
          <div className="grid gap-3 w-full max-w-full overflow-hidden">
            {items.map((o) => (
              <div key={o.id} className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 flex flex-col gap-3 w-full max-w-full overflow-hidden">
                {/* Header: Order ID & Status */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-2 w-full">
                  <span className="text-xs font-bold text-gray-500 truncate mr-2">Order ID: #{o.id}</span>
                  <div className="shrink-0">
                    <OrderStatusMessage status={o.status} />
                  </div>
                </div>
                
                {/* Product Details Info Row */}
                <div className="flex gap-3 items-center w-full">
                  <div className="bg-gray-100 h-14 w-14 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden border border-gray-200/50">
                    {productImages[o.productId] ? (
                      <img 
                        src={getImageUrl(productImages[o.productId])} 
                        alt={o.productName} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                    ) : (
                      <ShoppingBag size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-950 block w-full truncate mb-0.5">{o.productName}</h3>
                    <p className="text-xs text-gray-500 font-medium">Quantity: {o.quantity}</p>
                  </div>
                </div>

                {/* Footer details box: Address & Pricing */}
                <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100/50 w-full overflow-hidden gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">Shipping Address</p>
                    <p className="text-[10px] text-gray-650 block w-full truncate font-semibold leading-tight">{o.address}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">Total Paid</p>
                    <span className="text-green-600 font-extrabold text-sm block leading-tight">{formatCurrency(o.totalPrice)}</span>
                  </div>
                </div>

                {/* Mobile Cancel Button */}
                {canCancel(o) && (
                  <button
                    onClick={() => handleCancelOrder(o.id)}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black transition active:scale-[0.98] border border-red-200/50"
                  >
                    Cancel Order
                  </button>
                )}

                {/* Mobile Rate Item Button */}
                {String(o.status || '').toUpperCase() === 'DELIVERED' && (
                  <button
                    onClick={() => handleOpenReviewModal(o.productId, o.productName)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black transition active:scale-[0.98] border border-emerald-250/50"
                  >
                    ⭐ Rate Item
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-x-auto rounded-lg bg-white shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  {['Order ID', 'Product', 'Qty', 'Amount', 'Status', 'Address', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold">#{o.id}</td>
                    <td className="px-4 py-3">{o.productName}</td>
                    <td className="px-4 py-3">{o.quantity}</td>
                    <td className="px-4 py-3 font-bold text-green-600">{formatCurrency(o.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusMessage status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-xs">{o.address}</td>
                    <td className="px-4 py-3">
                      {canCancel(o) ? (
                        <button
                          onClick={() => handleCancelOrder(o.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-black transition active:scale-95 border border-red-200/40"
                        >
                          Cancel
                        </button>
                      ) : String(o.status || '').toUpperCase() === 'DELIVERED' ? (
                        <button
                          onClick={() => handleOpenReviewModal(o.productId, o.productName)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black transition active:scale-95 border border-emerald-250/40"
                        >
                          Rate Item
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Premium Review Modal Overlay */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition duration-300">
            {/* Modal Header */}
            <div className="bg-slate-950 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase">⭐ Write Product Review</h3>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5 truncate max-w-[280px]">
                  {selectedProductName}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseReviewModal}
                className="text-slate-400 hover:text-white transition font-black text-xs px-2 py-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitReview} className="p-5 space-y-4">
              {/* Star Rating Selector */}
              <div className="space-y-1 text-center">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Your Rating
                </label>
                <div className="flex justify-center items-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      className={`text-2xl transition hover:scale-110 ${
                        val <= rating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {rating === 5 ? 'Excellent!' :
                   rating === 4 ? 'Very Good!' :
                   rating === 3 ? 'Good' :
                   rating === 2 ? 'Fair' : 'Poor'}
                </span>
              </div>

              {/* Review Comment Input */}
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Share your experience (Optional)
                </label>
                <textarea
                  placeholder="What did you like or dislike about the product?"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs font-bold p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-955 bg-white placeholder:text-slate-450 text-slate-800"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingReview ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseReviewModal}
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

