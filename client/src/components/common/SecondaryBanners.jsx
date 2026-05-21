import { useState, useEffect, useRef } from 'react';
import { bannerService } from '../../services/bannerService';
import Loader from './Loader';

export default function SecondaryBanners() {
  const cachedBanners = (() => {
    try {
      const data = localStorage.getItem('mrmobi_cached_secondary_banners');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  })();

  const [banners, setBanners] = useState(cachedBanners);
  const [loading, setLoading] = useState(cachedBanners.length === 0);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await bannerService.getAllBanners();
        const secondary = data.filter(b => b.type === 'SECONDARY');
        setBanners(secondary);
        try {
          localStorage.setItem('mrmobi_cached_secondary_banners', JSON.stringify(secondary));
        } catch (e) {
          console.error(e);
        }
      } catch (error) {
        console.error('Failed to fetch secondary banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Very slow and smooth auto-scroll on mobile
  useEffect(() => {
    const el = containerRef.current;
    if (!el || banners.length === 0) return;

    let intervalId;

    const startScroll = () => {
      intervalId = setInterval(() => {
        // Only auto scroll if content overflows horizontally (i.e. mobile view)
        if (el.scrollWidth <= el.clientWidth) return;

        let newScrollLeft = el.scrollLeft + 1;
        // If reached the end, reset back to 0 smoothly
        if (newScrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          newScrollLeft = 0;
        }
        el.scrollLeft = newScrollLeft;
      }, 45); // Extremely slow: 1px per 45ms
    };

    startScroll();

    // Pause on hover or user touch interaction
    const pause = () => clearInterval(intervalId);
    const resume = () => {
      clearInterval(intervalId);
      startScroll();
    };

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume, { passive: true });

    return () => {
      clearInterval(intervalId);
      if (el) {
        el.removeEventListener('mouseenter', pause);
        el.removeEventListener('mouseleave', resume);
        el.removeEventListener('touchstart', pause);
        el.removeEventListener('touchend', resume);
      }
    };
  }, [banners]);

  if (loading) return null;
  if (banners.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className="-mt-6 md:mt-0 flex gap-4 overflow-x-auto no-scrollbar md:grid md:grid-cols-3 lg:grid-cols-5 pb-2"
    >
      {banners.map((banner) => (
        <a 
          key={banner.id} 
          href={banner.targetUrl || '#'} 
          className="relative min-w-[240px] sm:min-w-[260px] md:min-w-0 overflow-hidden rounded-xl group block h-[90px] sm:h-[120px] md:h-auto md:aspect-video shadow-sm snap-center shrink-0 md:shrink"
        >
          <img 
            src={banner.imageUrl} 
            alt={banner.title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
             <h4 className="text-white font-bold text-sm">{banner.title}</h4>
          </div>
          {/* AD Tag Badge */}
          <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-[8px] font-black text-white px-1.5 py-0.5 rounded uppercase tracking-widest">
            AD
          </div>
        </a>
      ))}
    </div>
  );
}
