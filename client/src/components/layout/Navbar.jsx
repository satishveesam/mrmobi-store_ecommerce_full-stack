import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Search, ShoppingCart, Heart, UserCog, LogOut, User as UserIcon, X, Home as HomeIcon, ShoppingBag, Shield, LogIn, MapPin, ChevronDown } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice.js';
import { productService } from '../../services/productService.js';
import { authService } from '../../services/authService.js';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../utils/constants.js';
import useAuth from '../../hooks/useAuth.js';
import { fetchWishlistCount } from '../../redux/slices/wishlistSlice.js';
import { checkQuickDeliveryEligibility } from '../../utils/delivery.js';

const AP_PINCODES = {
  // Visakhapatnam region
  "530001": "Visakhapatnam City", "530002": "Visakhapatnam Port", "530003": "Waltair Uplands", "530004": "Visakhapatnam", "530007": "Madhavadhara", "530008": "Muralinagar",
  "530009": "Gopalapatnam", "530011": "Visakhapatnam City", "530012": "Industrial Estate", "530013": "Visakhapatnam", "530014": "Kancharapalem", "530015": "Sriharipuram",
  "530016": "Malkapuram", "530017": "Visakhapatnam", "530018": "Visakhapatnam", "530020": "Visakhapatnam", "530024": "Visakhapatnam", "530026": "Visakhapatnam",
  "530027": "Visakhapatnam", "530029": "Visakhapatnam", "530032": "Visakhapatnam", "530040": "Visakhapatnam", "530043": "Visakhapatnam", "530044": "Visakhapatnam",
  "530045": "Rushikonda", "530047": "Pendurthi", "530048": "Madhurawada", "531001": "Anakapalle", "531021": "Narsipatnam", "531022": "Narsipatnam Rural",
  "531116": "Bheemunipatnam", "531168": "Gajuwaka", "531055": "Chodavaram", "531115": "Yellamanchili", "531219": "Araku Valley", "531151": "Paderu",

  // East & West Godavari regions
  "533001": "Kakinada Town", "533002": "Kakinada Port", "533003": "Kakinada", "533004": "Kakinada", "533005": "Kakinada", "533101": "Rajahmundry Town",
  "533102": "Rajahmundry", "533103": "Rajahmundry", "533104": "Rajahmundry", "533105": "Rajahmundry", "533201": "Amalapuram", "533250": "Ravulapalem",
  "533401": "Tuni", "533440": "Annavaram", "533433": "Pithapuram", "533450": "Pithapuram", "533296": "Mummidivaram", "533212": "Mandapeta", "533308": "Ramachandrapuram",
  "534001": "Eluru", "534002": "Eluru Rural", "534201": "Bhimavaram", "534202": "Bhimavaram Town", "534211": "Palakollu", "534101": "Tadepalligudem",
  "534260": "Tanuku", "534261": "Tanuku Town", "534250": "Jangareddygudem",

  // Krishna & Vijayawada regions
  "520001": "Vijayawada Town", "520002": "Vijayawada Port", "520003": "Vijayawada", "520004": "Vijayawada", "520005": "Vijayawada", "520007": "Vijayawada",
  "520008": "Vijayawada", "520010": "Vijayawada", "520011": "Vijayawada", "520012": "Vijayawada", "520013": "Vijayawada", "520015": "Vijayawada",
  "521175": "Machilipatnam", "521301": "Gudivada", "521190": "Nuzvid", "521230": "Jaggayyapeta", "521180": "Vuyyuru", "521201": "Kondapalli",

  // Guntur & Bapatla regions
  "522001": "Guntur Town", "522002": "Guntur East", "522003": "Guntur", "522004": "Guntur", "522005": "Guntur", "522006": "Guntur", "522019": "Tadepalle",
  "522201": "Tenali", "522202": "Tenali Town", "522307": "Mangalagiri", "522601": "Narasaraopet", "522438": "Chilakaluripet", "522124": "Bapatla",
  "522265": "Ponnur", "522034": "Amaravati",

  // Nellore & Prakasam regions
  "524001": "Nellore Town", "524002": "Nellore East", "524003": "Nellore", "524004": "Nellore", "524101": "Gudur", "524137": "Kavali",
  "524201": "Atmakur", "524421": "Venkatagiri", "523001": "Ongole", "523002": "Ongole Town", "523157": "Chirala", "523201": "Kandukur",
  "523301": "Markapur",

  // Chittoor, Tirupati & Rayalaseema regions
  "517001": "Chittoor", "517002": "Chittoor Town", "517501": "Tirupati Town", "517502": "Tirupati", "517507": "Tirumala", "517801": "Srikalahasti",
  "517247": "Madanapalle", "517640": "Punganur", "517408": "Palamaner", "517257": "Pileru", "517583": "Putur", "517581": "Nagari",

  // Kadapa & Pulivendula regions
  "516001": "Kadapa", "516002": "Kadapa Town", "516003": "Kadapa", "516004": "Kadapa", "516115": "Proddatur", "516101": "Rajampet",
  "516360": "Pulivendula", "516269": "Rayachoty", "516390": "Jammalamadugu", "516501": "Badvel",

  // Kurnool & Nandyal regions
  "518001": "Kurnool", "518002": "Kurnool Town", "518003": "Kurnool", "518004": "Kurnool", "518501": "Nandyal", "518301": "Adoni",
  "518401": "Yemmiganur", "518201": "Dhone", "518124": "Allagadda",

  // Anantapur & Sri Sathya Sai regions
  "515001": "Anantapur", "515002": "Anantapur Town", "515003": "Anantapur", "515004": "Anantapur", "515411": "Tadipatri", "515201": "Hindupur",
  "515671": "Dharmavaram", "515801": "Guntakal", "515701": "Kalyandurg", "515822": "Rayadurg", "515211": "Kadiri", "515134": "Puttaparthi",

  // Srikakulam & Vizianagaram regions
  "532001": "Srikakulam", "532005": "Srikakulam Town", "532185": "Palasa", "532201": "Tekkali", "532440": "Rajam", "532190": "Ichchapuram",
  "532484": "Amadalavalasa", "535001": "Vizianagaram", "535002": "Vizianagaram Town", "535003": "Vizianagaram", "535183": "Salur",
  "535302": "Parvathipuram", "535270": "Bobbili"
};

const userNavItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/products', label: 'Products', icon: ShoppingBag },
];

const adminNavItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/products', label: 'Products', icon: ShoppingBag },
  { to: '/admin/dashboard', label: 'Admin', icon: Shield },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchWrapRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useSelector((state) => state.wishlist.count);
  const { isAuthenticated, role, user } = useAuth();
  const location = useLocation();
  const isProductPage = /^\/product\/[^/]+$/.test(location.pathname);
  const isWishlistPage = location.pathname === '/wishlist';
  const isCartPage = location.pathname === '/cart';
  const isProductsListPage = location.pathname === '/products';
  const isProfilePage = location.pathname === '/profile';
  const isAddressesPage = location.pathname === '/addresses';
  const isMyOrdersPage = location.pathname === '/my-orders';
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';

  const isCheckoutPage = location.pathname === '/checkout';
  const isMinimalMobilePage = isProductPage || isWishlistPage || isCartPage || isProductsListPage || isProfilePage || isAddressesPage || isMyOrdersPage || isLoginPage || isSignupPage || isCheckoutPage;
  const showMobileBottomNav = isAuthenticated && role !== 'ADMIN' && location.pathname === '/';
  const hideTopIconsOnMobile = showMobileBottomNav || isMinimalMobilePage || location.pathname === '/';
  const hideProfileOnMobile = isProductPage;
  const hideCartOnMobile = showMobileBottomNav || isCartPage || isProductsListPage || isProfilePage || isAddressesPage || isMyOrdersPage || isWishlistPage || isCheckoutPage;

  const [locationName, setLocationName] = useState(() => localStorage.getItem('delivery_location') || 'Detecting location...');
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [pincode, setPincode] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);

  const updateDeliveryLocation = (loc, pin) => {
    setLocationName(loc);
    localStorage.setItem('delivery_location', loc);
    localStorage.setItem('delivery_pincode', pin || '');
    window.dispatchEvent(new CustomEvent('deliveryLocationChanged', { detail: { location: loc, pincode: pin || '' } }));
  };

  const [isKakinadaActive, setIsKakinadaActive] = useState(false);

  useEffect(() => {
    let active = true;
    const runCheck = async () => {
      const eligible = await checkQuickDeliveryEligibility();
      if (active) setIsKakinadaActive(eligible);
    };

    runCheck();

    const handleLocationChange = () => {
      runCheck();
    };

    window.addEventListener('deliveryLocationChanged', handleLocationChange);
    return () => {
      active = false;
      window.removeEventListener('deliveryLocationChanged', handleLocationChange);
    };
  }, [pincode, locationName]);

  const handlePincodeSubmit = async () => {
    if (pincode.length !== 6 || isNaN(pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    // local lookup
    if (AP_PINCODES[pincode]) {
      const detectedCity = AP_PINCODES[pincode];
      updateDeliveryLocation(detectedCity, pincode);
      toast.success(`Location updated to ${detectedCity}`);
      setShowAddressPicker(false);
      setPincode('');
      return;
    }

    // API lookup fallback
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0] && data[0].Status === "Success") {
        const postOffices = data[0].PostOffice;
        if (postOffices && postOffices.length > 0) {
          const office = postOffices.find(off => 
            off.BranchType === 'Head Post Office' || off.BranchType === 'Sub Post Office'
          ) || postOffices[0];

          let block = (office.Block || '').trim();
          let village = (office.Name || '').trim();

          village = village
            .replace(/\s+(H\.?O\.?|S\.?O\.?|B\.?O\.?)$/i, '')
            .replace(/\s+(Head|Sub|Branch)\s+Office$/i, '')
            .trim();

          block = block
            .replace(/\s+(H\.?O\.?|S\.?O\.?|B\.?O\.?)$/i, '')
            .replace(/\s+(Head|Sub|Branch)\s+Office$/i, '')
            .trim();

          block = block.replace(/\s+(Urban|Rural)$/i, '').trim();

          let detectedCity = '';
          if (block && village) {
            if (block.toLowerCase() === village.toLowerCase()) {
              detectedCity = block;
            } else if (village.toLowerCase().startsWith(block.toLowerCase())) {
              const subArea = village.substring(block.length).replace(/^[\s,-]+/, '').trim();
              detectedCity = subArea ? `${block}, ${subArea}` : block;
            } else {
              detectedCity = `${block}, ${village}`;
            }
          } else {
            detectedCity = block || village || office.Division || office.District || '';
          }

          const toTitleCase = (str) => {
            if (!str) return '';
            return str
              .toLowerCase()
              .split(/\s+/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          };

          detectedCity = toTitleCase(detectedCity);

          updateDeliveryLocation(detectedCity, pincode);
          toast.success(`Location updated to ${detectedCity}`);
          setShowAddressPicker(false);
          setPincode('');
        } else {
          toast.error('Invalid pincode or location not found');
        }
      } else {
        toast.error('Invalid pincode or location not found');
      }
    } catch (error) {
      console.error('Pincode fetch error:', error);
      toast.error('Failed to resolve pincode');
    }
  };

  const fetchSavedAddresses = async () => {
    if (!isAuthenticated) return;
    setAddressLoading(true);
    try {
      const { data } = await authService.getAddresses();
      setSavedAddresses(data || []);
    } catch (error) {
      console.error('Failed to load saved addresses', error);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (showAddressPicker) {
      fetchSavedAddresses();
    }
  }, [showAddressPicker]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.state || 'Unknown';
            setLocationName(city);
          } catch (error) {
            setLocationName('Location unavailable');
          }
        },
        (error) => {
          setLocationName('Location permission denied');
        }
      );
    } else {
      setLocationName('Geolocation not supported');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlistCount());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await productService.getProducts(searchTerm);
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close mobile search when clicking outside
  useEffect(() => {
    if (!mobileSearchOpen) return;

    const onDown = (e) => {
      if (!mobileSearchWrapRef.current) return;
      if (mobileSearchWrapRef.current.contains(e.target)) return;
      setMobileSearchOpen(false);
      setShowResults(false);
    };

    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [mobileSearchOpen]);

  const navItems = role === 'ADMIN' ? adminNavItems : userNavItems;

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate('/');
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL.replace('/api', '')}${url}`;
  };

  return (
    <>
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md text-gray-900 border-b border-gray-100/50 shadow-sm transition-all">
      <div className="container-page flex h-14 md:h-16 items-center gap-4">
        <button className="rounded-md p-2 md:hidden hover:bg-gray-100 active:scale-95 transition-all" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Link to="/" className="flex items-center -ml-4 mr-4 md:ml-0">
          <img src="/logo.png" alt="MrMobi" className="h-16 w-auto object-contain transform scale-200" />
        </Link>
        {/* Desktop search */}
        <div className="relative hidden flex-1 items-center rounded-2xl bg-gray-100/80 px-4 text-gray-700 md:flex border border-transparent focus-within:border-gray-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-gray-900/5 transition-all">
          <Search size={18} className="text-gray-400" />
          <input
            className="w-full bg-transparent border-0 px-3 py-2.5 outline-none font-medium placeholder-gray-400"
            placeholder="Search mobiles, accessories and more"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
          {showResults && searchTerm && (
            <div className="absolute left-0 right-0 top-14 rounded-2xl bg-white shadow-2xl border border-gray-100 p-4 z-50 transform origin-top transition-all">
              <h3 className="text-xs font-black uppercase tracking-widest mb-3 text-gray-400">Top Results</h3>
              {isSearching ? (
                <div className="text-sm text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="flex overflow-x-auto gap-4 pb-2">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="min-w-[140px] max-w-[140px] flex-shrink-0 cursor-pointer rounded-md p-2 transition hover:bg-gray-50 hover:shadow-soft"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setShowResults(false);
                        navigate(`/product/${product.id}`);
                      }}
                    >
                      <img
                        src={
                          getImageUrl(product.images?.[0] || product.imageUrl || product.imageURL || product.image) ||
                          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
                        }
                        className="h-28 w-full object-cover rounded-md mb-2 bg-gray-100"
                        alt={product.name}
                      />
                      <p className="text-xs font-bold line-clamp-2 text-gray-900 leading-tight">{product.name}</p>
                      <p className="text-green-700 font-black text-sm mt-1">
                        ₹{(product.discountedPrice ?? product.price ?? 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No products found.</div>
              )}
            </div>
          )}
        </div>

        <nav className={`items-center gap-1 sm:gap-2 ${hideTopIconsOnMobile ? 'hidden md:flex' : 'flex'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                aria-label={item.label}
                className={({ isActive }) => `p-2 rounded-full transition-all active:scale-95 ${isActive ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <Icon size={20} strokeWidth={2.5} />
              </NavLink>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          {/* Mobile search (icon -> expands) */}
          <div className="md:hidden flex items-center" ref={mobileSearchWrapRef}>
            <button
              type="button"
              className="rounded-full bg-gray-100 p-2 text-gray-700 hover:bg-gray-200 active:scale-95 transition-all"
              aria-label="Search"
              onClick={() => {
                setMobileSearchOpen((v) => !v);
                setShowResults(true);
              }}
            >
              <Search size={20} />
            </button>
            {mobileSearchOpen && (
              <div className="absolute left-2 right-2 top-16 rounded-2xl bg-white/95 backdrop-blur-xl text-gray-900 shadow-2xl border border-gray-100 p-3 z-50">
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-900/5 transition-all">
                  <Search size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    className="w-full bg-transparent border-0 px-2 py-2.5 outline-none text-sm font-medium placeholder-gray-400"
                    placeholder="Search products"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="p-1.5 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 active:scale-95 transition-all"
                    aria-label="Close search"
                    onClick={() => {
                      setMobileSearchOpen(false);
                      setShowResults(false);
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {searchTerm && (
                  <div className="mt-3">
                    <h3 className="text-[9px] font-black uppercase tracking-widest mb-2 text-slate-400/80">Top Results</h3>
                    {isSearching ? (
                      <div className="text-[10px] font-medium text-slate-400">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                        {searchResults.map((product) => {
                          const isProductPremium = product.name?.toLowerCase().includes('premium') || 
                                                   product.description?.toLowerCase().includes('premium') || 
                                                   Number(product.discountedPrice ?? product.price ?? 0) > 20000;
                          return (
                            <div
                              key={product.id}
                              className="flex items-center gap-2.5 cursor-pointer rounded-xl p-1.5 transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100/50 active:scale-[0.98]"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => {
                                setMobileSearchOpen(false);
                                setShowResults(false);
                                navigate(`/product/${product.id}`);
                              }}
                            >
                              <img
                                src={
                                  getImageUrl(product.images?.[0] || product.imageUrl || product.imageURL || product.image) ||
                                  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
                                }
                                className="h-10 w-10 object-cover rounded-lg border border-slate-100 bg-slate-50 flex-shrink-0"
                                alt={product.name}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[7px] font-extrabold uppercase tracking-widest text-slate-400 truncate">
                                    {product.category || 'Mobile'}
                                  </span>
                                  {isProductPremium && (
                                    <span className="inline-flex items-center text-[6px] font-black bg-amber-500/10 text-amber-700 border border-amber-500/20 px-1 py-0.5 rounded uppercase tracking-wider leading-none">
                                      Premium
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-[10px] font-bold text-slate-800 leading-tight truncate tracking-tight">
                                  {product.name}
                                </h4>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                  <span className="text-[10px] font-black text-slate-900">
                                    ₹{(product.discountedPrice ?? product.price ?? 0).toLocaleString('en-IN')}
                                  </span>
                                  {(product.discountPercentage > 0 || (product.originalPrice > (product.discountedPrice ?? product.price))) && (
                                    <span className="text-[8px] font-medium text-slate-400 line-through">
                                      ₹{(product.originalPrice ?? product.price ?? 0).toLocaleString('en-IN')}
                                    </span>
                                  )}
                                  {product.discountPercentage > 0 && (
                                    <span className="text-[8px] font-extrabold text-red-650 leading-none">
                                      {Math.round(product.discountPercentage)}% Off
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-[10px] font-medium text-slate-400">No products found.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {!isAuthenticated ? (
            <div className={`items-center gap-3 ml-2 ${hideProfileOnMobile ? 'hidden md:flex' : 'flex'}`}>
              <Link to="/login" className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95">
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="hidden rounded-full bg-gray-900 px-5 py-2 text-sm font-bold text-white hover:bg-gray-800 shadow-md transition-all active:scale-95 md:block">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className={`relative ml-2 ${hideProfileOnMobile ? 'hidden md:block' : ''}`}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full bg-gray-100 hover:bg-gray-200 px-3 py-2 text-gray-900 active:scale-95 transition-all"
                aria-label="User menu"
              >
                <UserIcon size={20} />
                <span className="hidden text-sm font-bold md:block">{user?.fullName || user?.username}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-lg bg-white text-gray-900 shadow-lg">
                  <div className="border-b px-4 py-3">
                    <p className="text-sm font-bold">{user?.fullName || user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  {role !== 'ADMIN' && (
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      👤 My Profile
                    </Link>
                  )}
                  {role !== 'ADMIN' && (
                    <Link
                      to="/wishlist"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      💝 My Wishlist
                    </Link>
                  )}
                  {role !== 'ADMIN' && (
                    <Link
                      to="/cart"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      🛒 My Cart
                    </Link>
                  )}
                  {role !== 'ADMIN' && (
                    <Link
                      to="/my-orders"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      📦 My Orders
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {isAuthenticated && role !== 'ADMIN' && (
            <div className="flex items-center gap-1 md:gap-2">
              <Link
                to="/wishlist"
                className={`relative rounded-full p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:scale-95 transition-all ${hideTopIconsOnMobile ? 'hidden md:flex' : 'flex'}`}
                aria-label="Wishlist"
              >
                <Heart size={20} strokeWidth={2.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                className={`relative rounded-full p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:scale-95 transition-all ${hideCartOnMobile ? 'hidden md:flex' : 'flex'}`}
                aria-label="Cart"
              >
                <ShoppingCart size={20} strokeWidth={2.5} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          )}

        </div>
      </div>

      {open && (
        <div className="container-page grid gap-1.5 pb-3.5 pt-2.5 md:hidden border-t border-slate-100/80 bg-white/95 backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                onClick={() => setOpen(false)} 
                className={({ isActive }) => `
                  flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 active:scale-[0.98]
                  ${isActive 
                    ? 'bg-slate-950 text-white shadow-sm' 
                    : 'bg-slate-50 border border-slate-100/50 text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'}
                `}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          {!isAuthenticated && (
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <Link 
                to="/login" 
                onClick={() => setOpen(false)} 
                className="rounded-lg bg-slate-50 border border-slate-200/60 py-2 text-center text-xs font-semibold text-slate-700 active:scale-[0.98] transition-all hover:bg-slate-100"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                onClick={() => setOpen(false)} 
                className="rounded-lg bg-slate-950 py-2 text-center text-xs font-semibold text-white shadow-sm active:scale-[0.98] transition-all hover:bg-slate-900"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
    {/* Location Bar - Show only on Home Page */}
    {location.pathname === '/' && (
      <div className="border-t border-gray-100/50 bg-gray-50/50 backdrop-blur-md relative z-40">
        <div className="container-page flex items-center justify-between py-1.5 text-xs text-gray-600">
          <div 
            onClick={() => setShowAddressPicker(!showAddressPicker)} 
            className="flex items-center gap-1 cursor-pointer hover:text-gray-900 transition-colors select-none group relative"
          >
            <MapPin size={12} className="text-gray-400 group-hover:text-slate-600 transition-colors" />
            <span className="font-medium">Delivering to:</span>
            <span className="text-gray-950 font-bold">{locationName}</span>
            <ChevronDown size={11} className={`text-gray-400 transition-transform duration-200 ${showAddressPicker ? 'rotate-180 text-gray-700' : ''}`} />

            {/* Premium Address Selector Popover - Desktop and Mobile (opens downwards) */}
            {showAddressPicker && (
              <div 
                className="absolute left-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-80 bg-white rounded-xl border border-slate-200/80 shadow-xl p-3.5 z-[100] animate-in fade-in slide-in-from-top-1 duration-150 text-left cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                 <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-1.5" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Choose Location</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddressPicker(false);
                      }}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-full hover:bg-slate-100"
                    >
                      <X size={12} />
                    </button>
                 </div>

                 <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                    {/* Auto Detection Button */}
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        setLocationName('Detecting...');
                        setShowAddressPicker(false);
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            async (position) => {
                              const { latitude, longitude } = position.coords;
                              try {
                                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                const data = await response.json();
                                const city = data.address.city || data.address.town || data.address.village || data.address.state || 'Unknown';
                                const postcode = data.address?.postcode || '';
                                 updateDeliveryLocation(city, postcode);
                                toast.success(`Location updated to ${city}`);
                              } catch (error) {
                                setLocationName('Location unavailable');
                                toast.error('Failed to parse location');
                              }
                            },
                            () => {
                              setLocationName('Location denied');
                              toast.error('Location permission denied');
                            }
                          );
                        } else {
                          setLocationName('Geolocation unsupported');
                          toast.error('Geolocation not supported');
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg text-xs font-semibold text-slate-700 transition active:scale-[0.98]"
                    >
                       <MapPin size={11} className="text-emerald-600" />
                       <span>Detect Current Location</span>
                    </button>

                    {/* Custom Pincode Input */}
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enter Pin Code</label>
                       <div className="flex gap-1.5">
                          <input 
                            type="text" 
                            maxLength={6}
                            placeholder="e.g. 500001" 
                            value={pincode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, ''); // Numbers only
                              setPincode(val);
                            }}
                            className="flex-1 text-[11px] py-1 px-2.5 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-slate-900 outline-none text-slate-800"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handlePincodeSubmit();
                              }
                            }}
                          />
                          <button 
                            disabled={pincode.length !== 6}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePincodeSubmit();
                            }}
                            className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition active:scale-[0.98] disabled:opacity-40"
                          >
                             Apply
                          </button>
                       </div>
                    </div>

                    {/* Saved Addresses list for Logged In User */}
                    {isAuthenticated && (
                       <div className="space-y-1.5 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-1">
                             <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Your Saved Addresses</label>
                             <Link 
                               to="/addresses"
                               onClick={() => setShowAddressPicker(false)}
                               className="text-[9px] font-bold text-emerald-650 hover:text-emerald-700 transition-colors uppercase tracking-widest"
                             >
                                + Add New
                             </Link>
                          </div>
                          {addressLoading ? (
                             <div className="text-[10px] text-slate-400 text-center py-1.5 animate-pulse">Loading saved addresses...</div>
                          ) : savedAddresses.length === 0 ? (
                             <div className="text-[10px] text-slate-400 italic text-center py-1.5">No saved addresses found.</div>
                          ) : (
                             <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                                {savedAddresses.map((addr) => (
                                   <div 
                                     key={addr.id}
                                     onClick={(e) => {
                                        e.stopPropagation();
                                        const formatted = `${addr.city}, ${addr.state}`;
                                        updateDeliveryLocation(formatted, addr.pincode);
                                        toast.success(`Location updated to ${formatted}`);
                                        setShowAddressPicker(false);
                                     }}
                                     className="p-2 rounded-lg border border-slate-150 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition text-[11px] leading-tight text-slate-700"
                                   >
                                      <div className="flex items-center justify-between mb-0.5">
                                         <span className="font-semibold text-slate-900">{addr.fullName}</span>
                                         <span className="text-[7px] bg-slate-200/80 text-slate-600 font-bold px-1 rounded uppercase tracking-wider">{addr.type}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 truncate">{addr.addressLine}, {addr.city}</p>
                                   </div>
                                ))}
                             </div>
                          )}
                       </div>
                    )}
                 </div>
              </div>
            )}
          </div>

          {isKakinadaActive && (
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 shadow-sm animate-pulse select-none z-10 uppercase tracking-wider leading-none">
              <span className="relative flex h-1.5 w-1.5 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
              </span>
              <span>⚡ 2-Hr Delivery</span>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}
