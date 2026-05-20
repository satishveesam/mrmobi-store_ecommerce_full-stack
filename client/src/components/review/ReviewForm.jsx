import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Star } from 'lucide-react';
import { reviewService } from '../../services/reviewService.js';

export default function ReviewForm({ productId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await reviewService.submit({
        productId,
        rating: Number(rating),
        comment: comment.trim() || null,
      });
      toast.success('Review submitted successfully!', { toastId: 'review-submit-success' });
      setComment('');
      onSubmitted?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review', { toastId: 'review-submit-error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 sm:mt-6 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3.5 sm:p-5 shadow-soft max-w-full overflow-hidden">
      <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">Rate this product</h3>
      <p className="text-[10px] sm:text-xs text-slate-400 font-semibold mt-0.5">Share your experience with other buyers</p>

      {/* Premium Star rating row */}
      <div className="mt-3 flex items-center gap-1.5">
        {stars.map((s) => {
          const isActive = s <= (hoverRating || rating);
          return (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              className="group relative flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg transition-all active:scale-90"
              aria-label={`Rate ${s} star`}
            >
              <Star
                size={18}
                className={`transition-all duration-200 group-hover:scale-110 sm:w-[22px] sm:h-[22px] ${
                  isActive 
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.2)]' 
                    : 'text-slate-300 fill-transparent'
                }`}
              />
            </button>
          );
        })}
        {rating > 0 && (
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 ml-1">
            {rating} / 5
          </span>
        )}
      </div>

      <textarea
        className="mt-3 w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-slate-50/50 hover:bg-slate-50 transition-all resize-none"
        rows={3}
        placeholder="Write a review (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button 
        disabled={loading} 
        className="w-full sm:w-auto px-5 py-2.5 mt-3 bg-green-600 hover:bg-green-700 text-white font-black text-xs sm:text-sm rounded-xl active:scale-95 transition-all shadow-sm shadow-green-100 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
