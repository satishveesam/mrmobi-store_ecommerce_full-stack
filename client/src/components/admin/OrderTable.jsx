import { useEffect, useState } from 'react';
import { MessageCircle, Truck } from 'lucide-react';
import { WHATSAPP_NUMBER, formatCurrency } from '../../utils/constants.js';
import { getQuickLocations } from '../../utils/delivery.js';

export default function OrderTable({ orders, onMarkDelivered, onMarkShipped, onMarkConfirmed, onMarkCancelled }) {
  
  const [locations, setLocations] = useState([]);
  
  useEffect(() => {
    getQuickLocations().then(setLocations).catch(() => {});
  }, []);

  const isQuickOrder = (addr) => {
    const str = String(addr || '').toLowerCase();
    return locations.some(l => str.includes(String(l.pincode).trim()));
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-150 uppercase tracking-wide">
            Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-150 uppercase tracking-wide">
            Shipped
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-150 uppercase tracking-wide">
            Confirmed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-150 uppercase tracking-wide">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
            {s || 'Placed'}
          </span>
        );
    }
  };

  const renderActions = (order, s) => {
    if (s === 'DELIVERED') {
      return <span className="text-[10px] font-medium text-slate-400 italic">Delivered</span>;
    }
    if (s === 'CANCELLED') {
      return <span className="text-[10px] font-medium text-rose-400/80 italic">Cancelled</span>;
    }
    return (
      <div className="flex items-center gap-1">
        {s === 'PLACED' && (
          <button
            type="button"
            className="inline-flex items-center px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/40 text-[10px] font-semibold transition active:scale-95"
            onClick={() => onMarkConfirmed?.(order)}
          >
            Confirm
          </button>
        )}
        {s === 'CONFIRMED' && (
          <button
            type="button"
            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/40 text-[10px] font-semibold transition active:scale-95"
            onClick={() => onMarkShipped?.(order)}
          >
            <Truck size={10} /> Ship
          </button>
        )}
        {(s === 'CONFIRMED' || s === 'SHIPPED') && (
          <button
            type="button"
            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/40 text-[10px] font-semibold transition active:scale-95"
            onClick={() => onMarkDelivered?.(order)}
          >
            <Truck size={10} /> Deliver
          </button>
        )}
        <button
          type="button"
          className="inline-flex items-center px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/40 text-[10px] font-semibold transition active:scale-95"
          onClick={() => onMarkCancelled?.(order)}
        >
          Cancel
        </button>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full min-w-[900px] text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {['Customer', 'Mobile', 'Product', 'Qty', 'Amount', 'Status', 'Address', 'Actions', 'Contact'].map((head) => (
              <th 
                key={head} 
                className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/60">
          {orders.map((order) => {
            const s = String(order.status || 'PLACED').toUpperCase();
            return (
              <tr key={order.id} className="hover:bg-slate-50/40 transition-colors duration-150">
                <td className="px-3 py-2 text-xs font-semibold text-slate-800">
                  <div className="flex flex-col gap-0.5">
                    <span>{order.customerName}</span>
                    {isQuickOrder(order.address) && (
                      <span className="inline-flex items-center gap-0.5 max-w-max px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500 text-white shadow-sm animate-pulse uppercase tracking-wider leading-none">
                        ⚡ Quick 2-Hr
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-slate-600 font-medium">
                  {order.mobile}
                </td>
                <td className="px-3 py-2 text-xs text-slate-800 font-medium break-words" title={order.productName}>
                  {order.productName}
                </td>
                <td className="px-3 py-2 text-xs text-slate-500 font-medium">
                  {order.quantity}
                </td>
                <td className="px-3 py-2 text-xs text-slate-700 font-semibold">
                  {formatCurrency(order.totalPrice)}
                </td>
                <td className="px-3 py-2 text-xs">
                  {getStatusBadge(s)}
                </td>
                <td className="px-3 py-2 text-xs text-slate-500 font-normal max-w-[180px] truncate" title={order.address}>
                  {order.address}
                </td>
                <td className="px-3 py-2 text-xs">
                  {renderActions(order, s)}
                </td>
                <td className="px-3 py-2 text-xs">
                  <a 
                    className="inline-flex rounded-lg bg-emerald-50 border border-emerald-100 p-1 text-emerald-700 hover:bg-emerald-100 transition-all active:scale-95" 
                    href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                    target="_blank" 
                    rel="noreferrer"
                    title="Message on WhatsApp"
                  >
                    <MessageCircle size={13} />
                  </a>
                </td>
              </tr>
            );
          })}
          {orders.length === 0 && (
            <tr>
              <td colSpan="9" className="px-4 py-8 text-center text-xs text-slate-400 font-medium">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
