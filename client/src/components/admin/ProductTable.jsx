import { Edit2, Trash2 } from 'lucide-react';
import { formatCurrency, API_BASE_URL } from '../../utils/constants.js';

export default function ProductTable({ products, onEdit, onDelete }) {
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL.replace('/api', '')}${url}`;
  };

  const getStockBadge = (stock) => {
    const s = Number(stock);
    if (isNaN(s) || s === 0) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-600 border border-rose-100">
          Out of stock
        </span>
      );
    }
    if (s < 10) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-100">
          Low Stock ({s})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
        {s} in stock
      </span>
    );
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full min-w-[720px] text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {['Image', 'Product name', 'Price', 'Stock', 'Category', 'Actions'].map((head) => (
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
          {products.map((product) => (
            <tr 
              key={product.id} 
              className="hover:bg-slate-50/40 transition-colors duration-150 group"
            >
              <td className="px-3 py-2">
                <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                  <img 
                    src={getImageUrl(product.images?.length > 0 ? product.images[0] : product.imageUrl)} 
                    alt={product.name} 
                    className="h-full w-full object-cover" 
                  />
                </div>
              </td>
              <td className="px-3 py-2 text-xs font-semibold text-slate-800">
                <div className="flex items-center gap-1.5">
                  <span>{product.name}</span>
                  {(product.quickDelivery ?? true) && (
                    <span 
                      title="Supports 2-Hour Quick Delivery"
                      className="inline-flex items-center px-1 py-0.5 rounded text-[8px] font-black bg-amber-500 text-white leading-none shadow-sm uppercase tracking-wider cursor-help"
                    >
                      ⚡ Quick
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 text-xs text-slate-600 font-medium">
                {formatCurrency(product.price)}
              </td>
              <td className="px-3 py-2 text-xs">
                {getStockBadge(product.stock)}
              </td>
              <td className="px-3 py-2 text-xs">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/40 capitalize">
                  {product.category || 'Uncategorized'}
                </span>
              </td>
              <td className="px-3 py-2 text-xs">
                <div className="flex items-center gap-1">
                  <button 
                    className="rounded-lg p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all active:scale-95" 
                    onClick={() => onEdit(product)}
                    title="Edit Product"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button 
                    className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all active:scale-95" 
                    onClick={() => onDelete(product.id)}
                    title="Delete Product"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center text-xs text-slate-400 font-medium">
                No products found in this search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
