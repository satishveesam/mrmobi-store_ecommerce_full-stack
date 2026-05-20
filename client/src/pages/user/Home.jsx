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
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
    api.get('/products/settings/announcement')
      .then(res => setAnnouncement(res.data))
      .catch(err => console.error('Failed to load announcement banner', err));
  }, [dispatch]);

  const stripProductNames = ['Dry Fruits', 'Soundbars', 'Edible Seed', 'Smart Watches', 'Smart Switches'];

  return (
    <div className="pb-12 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Announcement Banner */}
      {announcement && announcement.active && (
        <div className="container-page pt-4">
          <div className={`py-2 px-4 rounded-xl text-[10px] md:text-xs font-black tracking-wide shadow-sm flex items-center justify-center gap-1.5 border transition-all ${
            announcement.theme === 'rose' ? 'bg-rose-50 border-rose-100 text-rose-805' :
            announcement.theme === 'indigo' ? 'bg-indigo-50 border-indigo-100 text-indigo-805' :
            announcement.theme === 'amber' ? 'bg-amber-50 border-amber-100 text-amber-805' :
            'bg-emerald-50 border-emerald-100 text-emerald-805'
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

      {/* Hero Section */}
      <section>
        <div className="container-page py-2 md:py-4">
          <BannerCarousel />
        </div>
      </section>

      {/* Secondary Banners */}
      <section className="container-page">
         <SecondaryBanners />
      </section>

      {/* Blue Product Strip */}
      <section className="container-page">
         <ProductStrip />
      </section>

      {/* Categories */}
      <section className="container-page">
        <div className="mb-6">
          <h2 className="text-xl md:text-3xl font-black text-gray-950 tracking-tight">Explore Collections</h2>
          <p className="text-[9px] md:text-sm text-gray-400 font-bold uppercase tracking-widest mt-0.5">Our Premium Categories</p>
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.title} {...category} onClick={() => navigate(`/products?category=${category.title}`)} />
          ))}
        </div>
      </section>

      {/* Main Product Grid */}
      <section className="container-page">
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
