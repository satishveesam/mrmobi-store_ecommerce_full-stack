import { useEffect, useState } from 'react';
import { Star, Search, Trash2, Package, Calendar } from 'lucide-react';
import api from '../../services/api.js';
import { reviewService } from '../../services/reviewService.js';
import { toast } from 'react-toastify';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [reviewsRes, productsRes, usersRes] = await Promise.all([
        reviewService.getAllReviews(),
        api.get('/products'),
        api.get('/admin/users')
      ]);

      const productsMap = {};
      productsRes.data.forEach(p => productsMap[p.id] = p.name);
      
      const usersMap = {};
      usersRes.data.forEach(u => usersMap[u.id] = { email: u.email, name: u.fullName });

      setProducts(productsMap);
      setUsers(usersMap);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load reviews data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await reviewService.deleteReview(id);
      toast.success('Review deleted successfully');
      setReviews(reviews.filter(r => r.id !== id));
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const searchStr = searchTerm.toLowerCase();
    const prodName = products[review.productId]?.toLowerCase() || '';
    const userEmail = users[review.userId]?.email?.toLowerCase() || '';
    const userName = users[review.userId]?.name?.toLowerCase() || '';
    const comment = review.comment?.toLowerCase() || '';
    
    return prodName.includes(searchStr) || 
           userEmail.includes(searchStr) || 
           userName.includes(searchStr) || 
           comment.includes(searchStr);
  });

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Customer Reviews</h1>
          <p className="text-xs text-slate-500 font-medium">Manage and view all product reviews left by customers.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search reviews..."
            className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all w-full sm:w-64 bg-white text-xs text-slate-800 placeholder:text-slate-400 shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Customer', 'Product', 'Rating & Comment', 'Date', 'Actions'].map((head) => (
                  <th 
                    key={head} 
                    className={`px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider ${
                      head === 'Actions' ? 'text-right' : ''
                    }`}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-xs text-slate-400 font-medium">
                    Loading reviews...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-xs text-slate-400 font-medium">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/40 transition-colors duration-150 group">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                          {users[review.userId]?.name?.charAt(0) || users[review.userId]?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{users[review.userId]?.name || 'Unknown User'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{users[review.userId]?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium max-w-[180px]" title={products[review.productId]}>
                        <Package size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{products[review.productId] || 'Unknown Product'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 max-w-xs">
                      <div className="flex items-center gap-0.5 mb-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={10} 
                            className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} 
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 truncate leading-relaxed" title={review.comment}>
                        {review.comment || <span className="italic text-slate-350">No comment</span>}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-650 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-slate-400" />
                        <span>
                          {review.createdAt 
                            ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                        title="Delete Review"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
