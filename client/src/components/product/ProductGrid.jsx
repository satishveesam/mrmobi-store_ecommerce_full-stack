import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products }) {
  if (!products.length) {
    return <div className="rounded-lg bg-white p-8 text-center text-gray-600 shadow-soft">No products found.</div>;
  }

  return (
    <>
      {/* Mobile: 2 items per row grid */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {products.map((product) => (
          <div key={product.id} onClick={(e) => e.stopPropagation()}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Desktop/tablet: keep existing grid */}
      <div className="hidden sm:grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
