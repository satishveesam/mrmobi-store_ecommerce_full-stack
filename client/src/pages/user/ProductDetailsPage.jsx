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

      <section className="mt-6">
        <h2 className="text-lg md:text-2xl font-black text-gray-950 tracking-tight">Reviews</h2>

        {!isAuthenticated ? (
          <p className="mt-2 text-xs sm:text-sm text-gray-500">Login to rate and review this product.</p>
        ) : role !== 'USER' ? (
          <p className="mt-2 text-xs sm:text-sm text-gray-500">Only customers can rate this product.</p>
        ) : !eligibilityLoaded ? (
          <p className="mt-2 text-xs sm:text-sm text-gray-500">Checking eligibility...</p>
        ) : canRate ? (
          <ReviewForm productId={product.id} onSubmitted={() => reviewService.canRate(product.id).then(({ data }) => setCanRate(Boolean(data?.canRate))).catch(() => {})} />
        ) : (
          <p className="mt-2 text-xs sm:text-sm text-gray-500">Only customers who purchased this product can rate it.</p>
        )}
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
