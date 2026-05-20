import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SlidersHorizontal, Check } from 'lucide-react';
import { fetchProducts } from '../../redux/slices/productSlice.js';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import Loader from '../../components/common/Loader.jsx';

function normalizeCategory(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export default function ProductListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { items, loading } = useSelector((state) => state.products);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('default');
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const categories = useMemo(() => ['All', ...new Set(items.map((item) => item.category).filter(Boolean))], [items]);

  useEffect(() => {
    const queryCategory = params.get('category');
    if (!queryCategory) {
      setCategory('All');
      return;
    }

    const matchedCategory = items
      .map((item) => item.category)
      .find((itemCategory) => normalizeCategory(itemCategory) === normalizeCategory(queryCategory));

    setCategory(matchedCategory || queryCategory);
  }, [params, items]);

  const filtered = useMemo(() => {
    const getFinalPrice = (item) => Number(item.discountedPrice ?? item.price ?? 0);
    const categoryFilter = normalizeCategory(category);

    const data = items
      .filter((item) => {
        if (categoryFilter === normalizeCategory('All')) return true;
        const itemCategory = normalizeCategory(item.category);
        return itemCategory === categoryFilter || itemCategory.replace(/\s+/g, '-') === categoryFilter;
      })
      .filter((item) => {
        const discount = item.discountPercentage ?? item.discountPercent ?? 0;
        return Number(discount) >= Number(minDiscount);
      });

    if (sort === 'low') return [...data].sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
    if (sort === 'high') return [...data].sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
    return data;
  }, [items, category, sort, minDiscount]);

  const handleCategoryChange = (value) => {
    setCategory(value);
    const nextParams = new URLSearchParams(params);
    if (value === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', value);
    }
    const queryString = nextParams.toString();
    navigate(`/products${queryString ? `?${queryString}` : ''}`, { replace: true });
  };

  return (
    <div className="container-page py-3 sm:py-6">
      {/* Premium Filter Toolbar */}
      <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-1.5 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-gray-100 relative z-40">
        
        {/* Left: Category Pills (Scrollable) */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-1.5 px-1.5">
          {categories.map((c) => (
            <button 
              key={c}
              onClick={() => handleCategoryChange(c)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${category === c ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {c}
            </button>
          ))}
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-1.5 px-1.5 pb-1 md:pb-0 static sm:relative">
           {/* Sort Dropdown */}
           <div className="static sm:relative">
              <button 
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/60 rounded-full text-xs sm:text-sm font-bold text-gray-700 transition-all whitespace-nowrap"
              >
                <SlidersHorizontal size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Sort & Filter</span>
                <span className="sm:hidden">Filters</span>
              </button>
              
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-gray-950/20 backdrop-blur-sm transition-opacity" onClick={() => setSortOpen(false)}></div>
                  <div className="absolute left-2 right-2 sm:left-auto sm:right-0 mt-2.5 sm:w-[320px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 z-50 origin-top">
                     <div className="mb-6">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Sort By</span>
                        <div className="flex flex-col gap-2">
                           {['default', 'low', 'high'].map(option => (
                              <button
                                key={option}
                                onClick={() => { setSort(option); setSortOpen(false); }}
                                className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${sort === option ? 'border-gray-900 bg-gray-900 text-white shadow-md' : 'border-gray-100 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-200'}`}
                              >
                                <span>{option === 'default' ? '🌟 Recommended' : option === 'low' ? '📉 Price: Low to High' : '📈 Price: High to Low'}</span>
                                {sort === option && <Check size={16} />}
                              </button>
                           ))}
                        </div>
                     </div>
                     <div>
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Minimum Discount</span>
                           <span className="text-xs font-black text-white bg-green-600 px-2.5 py-1 rounded-lg shadow-sm">{minDiscount}% & up</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="80" step="10" 
                          className="w-full accent-green-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer mt-1"
                          value={minDiscount} 
                          onChange={(e) => setMinDiscount(e.target.value)} 
                        />
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 px-1">
                          <span>0%</span>
                          <span>80%</span>
                        </div>
                     </div>
                  </div>
                </>
              )}
           </div>
        </div>
      </div>
      {loading ? <Loader /> : <ProductGrid products={filtered} />}
    </div>
  );
}
