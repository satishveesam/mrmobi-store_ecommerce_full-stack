import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import MacOSDock from '../ui/MacOSDock';
import { 
  Smartphone, 
  Headphones, 
  Watch, 
  Cable, 
  Laptop, 
  Camera, 
  Gamepad2, 
  Smile, 
  Pizza, 
  Plane, 
  ShoppingBag,
  Gift,
  Heart,
  Zap,
  Speaker,
  Tv,
  Shirt,
  Footprints,
  Glasses,
  Book,
  Briefcase,
  HardDrive,
  Wifi,
  Bike,
  Car,
  Utensils,
  Baby,
  Flower,
  Brush,
  Music,
  Shield
} from 'lucide-react';

const iconMap = {
  'Mobiles': Smartphone,
  'Audio': Headphones,
  'Watches': Watch,
  'Accessories': Cable,
  'Computers': Laptop,
  'Cameras': Camera,
  'Gaming': Gamepad2,
  'Toys': Smile,
  'Food': Pizza,
  'Drones': Plane,
  
  // Icon name mappings
  'Smartphone': Smartphone,
  'Headphones': Headphones,
  'Watch': Watch,
  'Cable': Cable,
  'Laptop': Laptop,
  'Camera': Camera,
  'Gamepad2': Gamepad2,
  'Smile': Smile,
  'Pizza': Pizza,
  'Plane': Plane,
  'ShoppingBag': ShoppingBag,
  'Gift': Gift,
  'Heart': Heart,
  'Zap': Zap,
  'Speaker': Speaker,
  'Tv': Tv,
  'Shirt': Shirt,
  'Footprints': Footprints,
  'Glasses': Glasses,
  'Book': Book,
  'Briefcase': Briefcase,
  'HardDrive': HardDrive,
  'Wifi': Wifi,
  'Bike': Bike,
  'Car': Car,
  'Utensils': Utensils,
  'Baby': Baby,
  'Flower': Flower,
  'Brush': Brush,
  'Music': Music,
  'Shield': Shield
};

export default function CategoryIconBar() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    categoryService.getAll()
      .then(setCategories)
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  // Map backend categories to DockApp format
  const dockApps = categories.map(cat => ({
    id: cat.slug,
    name: cat.name,
    icon: iconMap[cat.icon] || iconMap[cat.name] || ShoppingBag,
  }));

  const handleAppClick = (appId) => {
    navigate(`/products?category=${encodeURIComponent(appId)}`);
  };

  // Extract current category from URL search params
  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get('category');
  const openApps = activeCategory ? [activeCategory] : [];

  return (
    <div className="z-50 hidden sm:flex w-full justify-center pointer-events-none relative mb-4 sm:fixed sm:bottom-3 sm:left-1/2 sm:-translate-x-1/2 sm:mb-0">
      <div className="pointer-events-auto w-full max-w-full overflow-x-auto sm:overflow-visible no-scrollbar pt-10 pb-2 px-2 -mt-6 sm:mt-0 sm:pt-4 sm:w-auto">
        <MacOSDock 
          apps={dockApps}
          onAppClick={handleAppClick}
          openApps={openApps}
        />
      </div>
    </div>
  );
}
