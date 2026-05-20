import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bannerService } from '../../services/bannerService';
import Loader from './Loader';

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await bannerService.getAllBanners();
        console.log("Loaded Banners:", data); // Debug log
        setBanners(data.filter(b => b.type === 'MAIN' || !b.type || b.type === ''));
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000); // 4 seconds interval

    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="w-full h-[220px] sm:h-[300px] md:h-[400px] bg-slate-200/50 rounded-2xl animate-pulse flex items-center justify-center">
        <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Loading Storefront...</span>
      </div>
    );
  }
  if (banners.length === 0) return null; // Or some fallback UI

  const currentBanner = banners[currentIndex];

  const handleDragEnd = (e, { offset }) => {
    const swipe = offset.x;
    if (swipe < -50) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    } else if (swipe > 50) {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  const content = (
    <>
      <img
        src={currentBanner.imageUrl}
        alt={currentBanner.title || 'Banner image'}
        className="h-[220px] sm:h-[300px] md:h-[400px] w-full rounded-2xl object-cover shadow-soft"
      />
      {currentBanner.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-lg">
          <h2 className="text-2xl font-bold text-white">{currentBanner.title}</h2>
        </div>
      )}
    </>
  );

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="relative w-full cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onClick={(e) => {
            // Prevent opening link if the user is dragging instead of clicking
            if (e.detail > 0 && currentBanner.targetUrl) {
              window.open(currentBanner.targetUrl, '_self');
            }
          }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
