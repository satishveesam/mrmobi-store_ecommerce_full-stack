import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, Sparkles } from 'lucide-react';
import { fetchProducts } from '../../redux/slices/productSlice.js';
import useAuth from '../../hooks/useAuth.js';
import ProductGrid from '../../components/product/ProductGrid.jsx';
import CategoryCard from '../../components/product/CategoryCard.jsx';
import Loader from '../../components/common/Loader.jsx';
import BannerCarousel from '../../components/common/BannerCarousel.jsx';
import SecondaryBanners from '../../components/common/SecondaryBanners.jsx';
import ProductStrip from '../../components/common/ProductStrip.jsx';
import api from '../../services/api.js';

const categories = [
  { title: 'Mobiles', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80' },
  { title: 'Accessories', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=700&q=80' },
  { title: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80' },
  { title: 'Smart Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80' },
];

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.products);
  const cachedAnnouncement = (() => {
    try {
      const data = localStorage.getItem('mrmobi_cached_announcement');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  const cachedCollections = (() => {
    try {
      const data = localStorage.getItem('mrmobi_cached_explore_collections');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  const [announcement, setAnnouncement] = useState(cachedAnnouncement);
  const [collections, setCollections] = useState(cachedCollections || categories);

  useEffect(() => {
    dispatch(fetchProducts());
    
    const fetchHomeSettings = () => {
      api.get('/products/settings/announcement')
        .then(res => {
          setAnnouncement(res.data);
          try {
            localStorage.setItem('mrmobi_cached_announcement', JSON.stringify(res.data));
          } catch {}
        })
        .catch(err => console.error('Failed to load announcement banner', err));

      api.get('/products/settings/explore-collections')
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setCollections(res.data);
            try {
              localStorage.setItem('mrmobi_cached_explore_collections', JSON.stringify(res.data));
            } catch {}
          }
        })
        .catch(err => console.error('Failed to load explore collections', err));
    };

    fetchHomeSettings();
    const interval = setInterval(fetchHomeSettings, 25000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const stripProductNames = ['Dry Fruits', 'Soundbars', 'Edible Seed', 'Smart Watches', 'Smart Switches'];

  return (
    <div className="pb-12 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="container-page pt-2 md:pt-4">
        <BannerCarousel />
      </section>

      {/* Secondary Banners */}
      <section className="container-page mt-4 md:mt-6">
         <SecondaryBanners />
      </section>

      {/* Announcement Banner */}
      {announcement && announcement.active && (
        <div className="container-page mt-4 md:mt-6">
          <div className={`py-2 px-4 rounded-xl text-[10px] md:text-xs font-black tracking-wide shadow-sm flex items-center justify-center gap-1.5 border transition-all ${
            announcement.theme === 'rose' ? 'bg-rose-50 border-rose-100 text-rose-800' :
            announcement.theme === 'indigo' ? 'bg-indigo-50 border-indigo-100 text-indigo-800' :
            announcement.theme === 'amber' ? 'bg-amber-50 border-amber-100 text-amber-800' :
            announcement.theme === 'purple' ? 'bg-purple-50 border-purple-100 text-purple-800' :
            announcement.theme === 'cyan' ? 'bg-cyan-50 border-cyan-100 text-cyan-800' :
            announcement.theme === 'crimson' ? 'bg-red-50 border-red-100 text-red-800' :
            announcement.theme === 'dark' ? 'bg-slate-950 border-slate-900 text-white' :
            'bg-emerald-50 border-emerald-100 text-emerald-800'
          }`}>
            <Sparkles className="w-3.5 h-3.5 animate-bounce text-indigo-500 shrink-0" />
            <span className="text-center">{announcement.text}</span>
            {announcement.link && (
              <Link to={announcement.link} className="underline text-[9px] font-black uppercase tracking-wider ml-1.5 hover:opacity-80 shrink-0">
                Shop Now &rarr;
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Blue Product Strip */}
      <section className="container-page mt-6 md:mt-8">
         <ProductStrip />
      </section>

      {/* Categories */}
      <section className="container-page mt-6 md:mt-8">
        <div className="mb-6">
          <h2 className="text-xl md:text-3xl font-black text-gray-950 tracking-tight">Explore Collections</h2>
          <p className="text-[9px] md:text-sm text-gray-400 font-bold uppercase tracking-widest mt-0.5">Our Premium Categories</p>
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {collections.map((category, idx) => (
            <CategoryCard key={category.title || idx} {...category} onClick={() => navigate(`/products?category=${category.title}`)} />
          ))}
        </div>
      </section>

      {/* Main Product Grid */}
      <section className="container-page mt-6 md:mt-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl md:text-3xl font-black text-gray-950 tracking-tight">Best Sellers</h2>
            <p className="text-[9px] md:text-sm text-gray-400 font-bold uppercase tracking-widest mt-0.5">Most loved by customers</p>
          </div>
          <Link to="/products" className="flex items-center gap-1.5 text-[9px] md:text-xs font-black text-gray-700 uppercase tracking-widest bg-gray-100 hover:bg-gray-200 active:scale-95 px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-all flex-shrink-0">
            See All
            <ArrowRight size={12} />
          </Link>
        </div>
        {loading ? <Loader /> : <ProductGrid products={items.filter(p => !stripProductNames.includes(p.name)).slice(0, 24)} />}
      </section>
    </div>
  );
}
