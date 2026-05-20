import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { API_BASE_URL } from '../../utils/constants.js';

export default function ProductStrip() {
  const { items } = useSelector((state) => state.products);
  const scrollRef = useRef(null);

  // Filter for the "Strip" products we seeded (Dry Fruits, Soundbars, etc)
  const stripProducts = items.filter(p => 
    ['Dry Fruits', 'Soundbars', 'Edible Seed', 'Smart Watches', 'Smart Switches'].includes(p.name)
  );

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (stripProducts.length === 0) return null;

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL.replace('/api', '')}${url}`;
  };

  return (
    <div className="bg-blue-600 rounded-3xl p-6 md:p-10 relative overflow-hidden group shadow-xl">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      
      <div className="relative z-10 space-y-6">
        <h2 className="text-white text-2xl md:text-3xl font-black tracking-tight">Still looking for these?</h2>
        
        <div className="relative">
          {/* Scroll Buttons */}
          <button 
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 bg-white rounded-full shadow-lg items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
          >
            <ChevronLeft size={24} className="text-blue-600" />
          </button>
          
          <button 
             onClick={() => scroll('right')}
             className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 bg-white rounded-full shadow-lg items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
          >
            <ChevronRight size={24} className="text-blue-600" />
          </button>

          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth"
          >
            {stripProducts.map((product) => (
              <div 
                key={product.id} 
                className="min-w-[160px] md:min-w-[190px] bg-white rounded-2xl p-2 pb-4 shadow-sm hover:shadow-lg transition-shadow cursor-pointer shrink-0"
                onClick={() => window.location.href = `/product/${product.id}`}
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50">
                  <img 
                    src={getImageUrl(product.images?.length > 0 ? product.images[0] : product.imageUrl) || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'} 
                    alt={product.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="px-1">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">View Store</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
