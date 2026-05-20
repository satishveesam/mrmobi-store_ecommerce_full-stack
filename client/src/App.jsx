import { useState, useEffect } from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import { ConcentricLoader } from './components/ui/loader.jsx';
import Lenis from 'lenis';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Instantly clear simulated loading lag (300ms is perfectly human responsive)
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;

    // Initialize global silky-smooth inertia scrolling (Lenis)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50/50">
        <ConcentricLoader />
      </div>
    );
  }

  return <AppRoutes />;
}
