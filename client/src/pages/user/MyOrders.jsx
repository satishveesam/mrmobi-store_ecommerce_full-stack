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

  useEffect(() => {
    load();
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
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-lg bg-white shadow-soft">
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

          {/* Mobile Card View */}
          <div className="md:hidden grid gap-2">
            {items.map((o) => (
              <div key={o.id} className="bg-white p-3 rounded-lg shadow-soft flex gap-3 items-center border border-gray-50">
                <div className="bg-gray-100 h-14 w-14 rounded-md flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden">
                  {productImages[o.productId] ? (
                    <img 
                      src={getImageUrl(productImages[o.productId])} 
                      alt={o.productName} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingBag size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{o.productName}</h3>
                    <span className="text-green-600 font-bold text-sm flex-shrink-0">{formatCurrency(o.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className="text-xs text-gray-500">Qty: {o.quantity} | <span className="font-bold">#{o.id}</span></p>
                    <OrderStatusMessage status={o.status} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">{o.address}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

