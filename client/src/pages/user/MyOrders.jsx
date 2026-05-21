import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ShoppingBag, RotateCw } from 'lucide-react';
import { orderService } from '../../services/orderService.js';
import { productService } from '../../services/productService.js';
import { formatCurrency, API_BASE_URL } from '../../utils/constants.js';

function OrderStatusMessage({ status }) {
  const s = String(status || '').toUpperCase();
  if (s === 'DELIVERED') {
    return <span className="rounded bg-green-100 px-2 py-1 text-xs font-black text-green-700">DELIVERED</span>;
  }
  if (s === 'SHIPPED') {
    return <span className="rounded bg-blue-100 px-2 py-1 text-xs font-black text-blue-700">SHIPPED</span>;
  }
  if (s === 'CONFIRMED') {
    return <span className="rounded bg-purple-100 text-purple-700 px-2 py-1 text-xs font-black">ORDER CONFIRMED</span>;
  }
  if (s === 'CANCELLED') {
    return <span className="rounded bg-red-100 text-red-700 px-2 py-1 text-xs font-black">CANCELLED</span>;
  }
  return (
    <span className="rounded bg-amber-50 px-2 py-1 text-xs font-black uppercase tracking-wide text-amber-800">
      PROCESSING
    </span>
  );
}

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL.replace('/api', '')}${url}`;
};

export default function MyOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await orderService.getMyOrders();
      const orders = Array.isArray(data) ? data : [];
      setItems(orders);
      
      // Fetch images for unique product IDs
      const uniqueProductIds = [...new Set(orders.map(o => o.productId).filter(Boolean))];
      const imageMap = {};
      
      await Promise.all(uniqueProductIds.map(async (id) => {
        try {
          const res = await productService.getProduct(id);
          imageMap[id] = res.data.images?.[0] || res.data.imageUrl || res.data.imageURL || res.data.image;
        } catch (err) {
          console.error(`Failed to fetch product ${id}`, err);
        }
      }));
      
      setProductImages(imageMap);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    load();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="container-page py-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black">My Orders</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track your order status.</p>
        </div>
        <button 
          type="button" 
          onClick={load} 
          disabled={loading}
          className="p-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-all"
          aria-label="Refresh orders"
        >
          <RotateCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {!loading && !items.length ? (
        <div className="rounded-lg bg-white p-6 sm:p-8 text-center text-gray-600 shadow-soft">
          <p className="text-sm sm:text-base">No orders found.</p>
        </div>
      ) : (
        isMobile ? (
          /* Mobile Card View */
          <div className="grid gap-3">
            {items.map((o) => (
              <div key={o.id} className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 flex flex-col gap-3">
                {/* Header: Order ID & Status */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold text-gray-500">Order ID: #{o.id}</span>
                  <OrderStatusMessage status={o.status} />
                </div>
                
                {/* Product Details Info Row */}
                <div className="flex gap-3 items-center">
                  <div className="bg-gray-100 h-14 w-14 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden border border-gray-200/50">
                    {productImages[o.productId] ? (
                      <img 
                        src={getImageUrl(productImages[o.productId])} 
                        alt={o.productName} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                    ) : (
                      <ShoppingBag size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-950 truncate mb-0.5">{o.productName}</h3>
                    <p className="text-xs text-gray-500 font-medium">Quantity: {o.quantity}</p>
                  </div>
                </div>

                {/* Footer details box: Address & Pricing */}
                <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">Shipping Address</p>
                    <p className="text-[10px] text-gray-600 truncate font-semibold leading-tight">{o.address}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">Total Paid</p>
                    <span className="text-green-600 font-extrabold text-sm block leading-tight">{formatCurrency(o.totalPrice)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-x-auto rounded-lg bg-white shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  {['Order ID', 'Product', 'Qty', 'Amount', 'Status', 'Address'].map((h) => (
                    <th key={h} className="px-4 py-3 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold">#{o.id}</td>
                    <td className="px-4 py-3">{o.productName}</td>
                    <td className="px-4 py-3">{o.quantity}</td>
                    <td className="px-4 py-3 font-bold text-green-600">{formatCurrency(o.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusMessage status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-xs">{o.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

