import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice.js';
import ProductDetails from '../../components/product/ProductDetails.jsx';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import ProductCard from '../../components/product/ProductCard.jsx';
import useAuth from '../../hooks/useAuth.js';
import { reviewService } from '../../services/reviewService.js';
import ReviewForm from '../../components/review/ReviewForm.jsx';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);

  // Ensure mobile navigation lands at the top (fixes Similar Products "stays at same scroll")
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);
  const { isAuthenticated, role } = useAuth();
  const [canRate, setCanRate] = useState(false);
  const [eligibilityLoaded, setEligibilityLoaded] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const loadReviews = async () => {
    if (!id) return;
    setLoadingReviews(true);
    try {
      const { data } = await reviewService.productReviews(id);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [id]);

  useEffect(() => {
    if (!products.length) dispatch(fetchProducts());
  }, [dispatch, products.length]);

  const productRaw = products.find((item) => String(item.id) === String(id));

  const product = productRaw
    ? {
        ...productRaw,
        imageUrl:
          productRaw.imageUrl ||
          productRaw.image ||
          productRaw.img ||
          productRaw.productImage ||
          '',
      }
    : null;

  const similar = products
    .filter((item) => item.id !== productRaw?.id && item.category === productRaw?.category)
    .slice(0, 8)
    .map((item) => {
      const normalizedImageUrl = item.imageUrl || item.image || item.img || item.productImage || '';
      return {
        ...item,
        imageUrl: normalizedImageUrl,
      };
    });

  const listToRender = similar.length ? similar : products
    .filter((item) => item.id !== productRaw?.id)
    .slice(0, 8)
    .map((item) => {
      const normalizedImageUrl = item.imageUrl || item.image || item.img || item.productImage || '';
      return {
        ...item,
        imageUrl: normalizedImageUrl,
      };
    });
  const row1 = listToRender.slice(0, Math.ceil(listToRender.length / 2));
  const row2 = listToRender.slice(Math.ceil(listToRender.length / 2));

  useEffect(() => {
    let cancelled = false;
    async function loadEligibility() {
      setEligibilityLoaded(false);
      setCanRate(false);

      if (!product?.id) return setEligibilityLoaded(true);
      if (!isAuthenticated || role !== 'USER') return setEligibilityLoaded(true);

      try {
        const { data } = await reviewService.canRate(product.id);
        if (!cancelled) setCanRate(Boolean(data?.canRate));
      } catch {
        // If API fails (e.g. unauth), default to cannot rate
      } finally {
        if (!cancelled) setEligibilityLoaded(true);
      }
    }
    loadEligibility();
    return () => {
      cancelled = true;
    };
  }, [product?.id, isAuthenticated, role]);

  if (!product) return <div className="container-page py-8">Product not found.</div>;

  return (
    <div className="container-page py-6 pb-24 md:pb-6">
      <ProductDetails product={product} />

      <section className="mt-6 space-y-4">
        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-lg md:text-2xl font-black text-gray-950 tracking-tight">Customer Reviews</h2>
          
          {/* Reviews List */}
          <div className="mt-4 space-y-3">
            {loadingReviews ? (
              <p className="text-xs text-slate-500 font-bold animate-pulse">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                <span className="text-xl">⭐</span>
                <p className="text-[11px] font-bold text-slate-500 mt-1">No reviews yet for this product.</p>
                <p className="text-[9px] text-slate-400">Be the first to purchase and share your experience!</p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-white border border-slate-150 rounded-2xl shadow-sm flex flex-col justify-between animate-in fade-in duration-200">
                    <div>
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className={`text-xs ${s <= rev.rating ? 'text-amber-400' : 'text-slate-200'}`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-[9px] font-black text-slate-450 ml-1.5 uppercase tracking-wide">
                          Verified Buyer
                        </span>
                      </div>
                      
                      {/* Comment */}
                      {rev.comment ? (
                        <p className="text-xs text-slate-700 font-bold mt-2 leading-relaxed">
                          "{rev.comment}"
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic mt-2">
                          Rated {rev.rating} out of 5 stars
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <span className="text-[8px] text-slate-400 font-extrabold mt-3 uppercase tracking-wider block">
                      Posted on {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Review / Eligibility section */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 mt-6 animate-in fade-in duration-200">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Write a Review</h3>
          {!isAuthenticated ? (
            <p className="text-[11px] text-slate-500 font-bold">
              Please <span className="underline cursor-pointer text-slate-900 font-black" onClick={() => window.location.href='/login'}>Login</span> to rate and review this product.
            </p>
          ) : role !== 'USER' ? (
            <p className="text-[11px] text-slate-500 font-bold">Only customers can rate this product.</p>
          ) : !eligibilityLoaded ? (
            <p className="text-[11px] text-slate-550 font-bold">Checking purchase history...</p>
          ) : canRate ? (
            <ReviewForm
              productId={product.id}
              onSubmitted={() => {
                reviewService.canRate(product.id)
                  .then(({ data }) => setCanRate(Boolean(data?.canRate)))
                  .catch(() => {});
                loadReviews();
              }}
            />
          ) : (
            <p className="text-[11px] text-slate-500 font-bold">
              Only verified customers who purchased this product can submit a rating here.
            </p>
          )}
        </div>
      </section>

      <h2 className="mb-2 mt-6 text-sm sm:text-base font-black text-slate-800 tracking-tight">Similar Products</h2>

      {/* Mobile: 2 rows of horizontal scrolling with compact cards */}
      <div className="sm:hidden space-y-3">
        {row1.length > 0 && (
          <div className="overflow-x-auto no-scrollbar pr-4">
            <div className="flex gap-2.5">
              {row1.map((p) => (
                <div key={p.id} className="w-[42vw] max-w-[150px] flex-shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
        {row2.length > 0 && (
          <div className="overflow-x-auto no-scrollbar pr-4">
            <div className="flex gap-2.5">
              {row2.map((p) => (
                <div key={p.id} className="w-[42vw] max-w-[150px] flex-shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tablet/Desktop: grid */}
      <div className="hidden sm:block">
        <ProductGrid products={listToRender} />
      </div>
    </div>
  );
}
