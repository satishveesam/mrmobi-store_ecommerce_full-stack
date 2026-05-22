import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Search, Filter, RefreshCw } from 'lucide-react';
import OrderTable from '../../components/admin/OrderTable.jsx';
import { fetchOrders } from '../../redux/slices/orderSlice.js';
import { orderService } from '../../services/orderService.js';
import api from '../../services/api.js';

export default function Orders() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.items);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (orders || [])
      .filter((o) => status === 'All' || String(o.status || 'PLACED').toUpperCase() === String(status).toUpperCase())
      .filter((o) => {
        if (!q) return true;
        return (
          String(o.customerName || '').toLowerCase().includes(q) ||
          String(o.mobile || '').toLowerCase().includes(q) ||
          String(o.productName || '').toLowerCase().includes(q) ||
          String(o.address || '').toLowerCase().includes(q) ||
          String(o.id || '').toLowerCase().includes(q)
        );
      });
  }, [orders, search, status]);

  const markConfirmed = async (order) => {
    setUpdatingId(order.id);
    try {
      await orderService.updateStatus(order.id, 'CONFIRMED');
      toast.success('Order marked as CONFIRMED');
      dispatch(fetchOrders());
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const markShipped = async (order) => {
    setUpdatingId(order.id);
    try {
      await orderService.updateStatus(order.id, 'SHIPPED');
      toast.success('Order marked as SHIPPED');
      dispatch(fetchOrders());
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const markDelivered = async (order) => {
    setUpdatingId(order.id);
    try {
      await orderService.updateStatus(order.id, 'DELIVERED');
      toast.success('Order marked as DELIVERED');
      dispatch(fetchOrders());
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const markCancelled = async (order) => {
    setUpdatingId(order.id);
    try {
      await orderService.updateStatus(order.id, 'CANCELLED');
      toast.success('Order marked as CANCELLED');
      dispatch(fetchOrders());
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearAllOrders = async () => {
    const confirmation = window.prompt("Type 'DELETE ALL' to confirm deleting all order history and customer transaction logs. This action CANNOT be undone!");
    if (confirmation !== 'DELETE ALL') {
      toast.info('Order deletion cancelled.');
      return;
    }

    try {
      await api.delete('/admin/orders/clear-all');
      toast.success('All orders and transaction history deleted successfully!');
      dispatch(fetchOrders());
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to clear orders');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Order History</h1>
          <p className="text-xs text-slate-500 font-medium">Review and process all customer transactions.</p>
        </div>
        <div className="flex items-center gap-2">
          {orders && orders.length > 0 && (
            <button 
              onClick={handleClearAllOrders}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 rounded-lg text-[10px] sm:text-xs font-bold transition active:scale-95 flex items-center gap-1 shadow-sm uppercase tracking-wider"
            >
              Clear All Orders
            </button>
          )}
          <button 
            onClick={() => dispatch(fetchOrders())}
            title="Refresh"
            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-colors flex-shrink-0"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search by ID, customer, mobile, or address..."
            className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all w-full bg-white text-xs text-slate-800 placeholder:text-slate-400 shadow-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white">
           <Filter className="text-slate-400" size={14} />
           <select 
             className="outline-none bg-transparent text-xs font-semibold text-slate-600 min-w-[110px] cursor-pointer"
             value={status} 
             onChange={(e) => setStatus(e.target.value)}
           >
              <option value="All">All Statuses</option>
              <option value="PLACED">PLACED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
           </select>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
        <OrderTable
          orders={(filtered || []).map((o) => (o.id === updatingId ? { ...o, status: o.status || 'UPDATING...' } : o))}
          onMarkDelivered={markDelivered}
          onMarkShipped={markShipped}
          onMarkConfirmed={markConfirmed}
          onMarkCancelled={markCancelled}
        />
      </div>
    </div>
  );
}
