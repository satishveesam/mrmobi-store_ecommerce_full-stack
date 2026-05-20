import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, Plus, Check, X, RefreshCw, PackageX, Pencil } from 'lucide-react';
import { fetchProducts, saveProduct } from '../../redux/slices/productSlice.js';
import { formatCurrency, API_BASE_URL } from '../../utils/constants.js';
import { toast } from 'react-toastify';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL.replace('/api', '')}${url}`;
};

export default function AdminOutOfStock() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const [saving, setSaving] = useState(null); // productId being saved
  // Map: productId -> draft stock input value
  const [stockDrafts, setStockDrafts] = useState({});

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const outOfStockProducts = products.filter(
    (p) => p.stock !== null && p.stock !== undefined && p.stock <= 0
  );
  const lowStockProducts = products.filter(
    (p) => p.stock !== null && p.stock !== undefined && p.stock > 0 && p.stock <= 5
  );

  const handleDraftChange = (id, val) => {
    setStockDrafts((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveStock = async (product) => {
    const newStock = Number(stockDrafts[product.id]);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Enter a valid stock number (0 or more)');
      return;
    }
    setSaving(product.id);
    try {
      await dispatch(
        saveProduct({
          id: product.id,
          values: {
            ...product,
            originalPrice: product.originalPrice ?? product.mrpPrice,
            discountPercentage: product.discountPercentage ?? product.discountPercent ?? 0,
            stock: newStock,
            imageUrl: product.imageUrl || (product.images?.[0] ?? ''),
          },
        })
      ).unwrap();
      toast.success(`Stock updated for "${product.name}" → ${newStock}`);
      setStockDrafts((prev) => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });
      dispatch(fetchProducts());
    } catch (e) {
      toast.error('Failed to update stock');
    } finally {
      setSaving(null);
    }
  };

  const handleCancel = (id) => {
    setStockDrafts((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <PackageX className="text-rose-500" size={18} />
            Stock Alerts
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Restock out-of-stock and low-stock items quickly.
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchProducts())}
          title="Refresh"
          className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-colors flex-shrink-0"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-rose-50/50 border border-rose-100/60 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-700">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>{outOfStockProducts.length} Out of Stock</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50/50 border border-amber-100/60 rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>{lowStockProducts.length} Low Stock (≤5)</span>
        </div>
      </div>

      {/* ── Out of Stock Section ── */}
      {outOfStockProducts.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-[10px] font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={12} /> Out of Stock
          </h2>
          <div className="bg-white rounded-xl border border-rose-100/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[600px] text-left border-collapse">
                <thead className="bg-rose-50/30 border-b border-rose-100/40">
                  <tr>
                    {['Product', 'Category', 'Price', 'Current Stock', 'Add Stock'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] font-semibold text-rose-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {outOfStockProducts.map((p) => {
                    const draft = stockDrafts[p.id];
                    const isEditing = draft !== undefined;
                    const imgSrc = getImageUrl(p.images?.length > 0 ? p.images[0] : p.imageUrl);
                    return (
                      <tr key={p.id} className="hover:bg-rose-50/10 transition-colors duration-150 group">
                        {/* Product */}
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                              <img
                                src={imgSrc}
                                alt={p.name}
                                className="h-full w-full object-cover grayscale opacity-75"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-800 leading-tight">{p.name}</p>
                              <span className="inline-block text-[8px] font-bold text-rose-600 bg-rose-50 border border-rose-100/50 px-1.5 py-0.2 rounded-md mt-0.5">
                                OUT OF STOCK
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/40 capitalize">
                            {p.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs font-medium text-slate-600">{formatCurrency(p.price ?? p.discountedPrice)}</td>
                        <td className="px-3 py-2 text-xs">
                          <span className="text-xs font-bold text-rose-600">{p.stock ?? 0}</span>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="1"
                                value={draft}
                                onChange={(e) => handleDraftChange(p.id, e.target.value)}
                                className="w-14 border border-emerald-300 rounded-md px-1.5 py-0.5 text-xs font-semibold text-center outline-none focus:ring-1 focus:ring-emerald-500/25 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveStock(p)}
                                disabled={saving === p.id}
                                className="h-6 w-6 flex items-center justify-center rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50"
                              >
                                {saving === p.id ? (
                                  <RefreshCw size={11} className="animate-spin" />
                                ) : (
                                  <Check size={11} />
                                )}
                              </button>
                              <button
                                onClick={() => handleCancel(p.id)}
                                className="h-6 w-6 flex items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition active:scale-95"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDraftChange(p.id, '')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-semibold rounded-md hover:bg-emerald-700 transition active:scale-95 shadow-sm"
                            >
                              <Plus size={11} /> Add Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-6 flex flex-col items-center gap-1 text-center">
          <Check size={20} className="text-emerald-500" />
          <p className="font-bold text-xs text-emerald-800">No Out-of-Stock Products!</p>
          <p className="text-[11px] text-emerald-600">All products are currently in stock.</p>
        </div>
      )}

      {/* ── Low Stock Section ── */}
      {lowStockProducts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={12} /> Low Stock (≤5 units)
          </h2>
          <div className="bg-white rounded-xl border border-amber-100/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[600px] text-left border-collapse">
                <thead className="bg-amber-50/30 border-b border-amber-100/40">
                  <tr>
                    {['Product', 'Category', 'Price', 'Current Stock', 'Update Stock'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {lowStockProducts.map((p) => {
                    const draft = stockDrafts[p.id];
                    const isEditing = draft !== undefined;
                    const imgSrc = getImageUrl(p.images?.length > 0 ? p.images[0] : p.imageUrl);
                    return (
                      <tr key={p.id} className="hover:bg-amber-50/10 transition-colors duration-150 group">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                              <img
                                src={imgSrc}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-800 leading-tight">{p.name}</p>
                              <span className="inline-block text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-100/50 px-1.5 py-0.2 rounded-md mt-0.5">
                                ONLY {p.stock} LEFT
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/40 capitalize">
                            {p.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs font-medium text-slate-600">{formatCurrency(p.price ?? p.discountedPrice)}</td>
                        <td className="px-3 py-2 text-xs">
                          <span className="text-xs font-bold text-amber-600">{p.stock}</span>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={draft}
                                onChange={(e) => handleDraftChange(p.id, e.target.value)}
                                className="w-14 border border-emerald-300 rounded-md px-1.5 py-0.5 text-xs font-semibold text-center outline-none focus:ring-1 focus:ring-emerald-500/25 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveStock(p)}
                                disabled={saving === p.id}
                                className="h-6 w-6 flex items-center justify-center rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50"
                              >
                                {saving === p.id ? (
                                  <RefreshCw size={11} className="animate-spin" />
                                ) : (
                                  <Check size={11} />
                                )}
                              </button>
                              <button
                                onClick={() => handleCancel(p.id)}
                                className="h-6 w-6 flex items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition active:scale-95"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDraftChange(p.id, p.stock.toString())}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-semibold rounded-md hover:bg-amber-600 transition active:scale-95 shadow-sm"
                            >
                              <Pencil size={10} /> Update
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
        <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-8 flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-100/80 flex items-center justify-center">
            <Check size={20} className="text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-emerald-800">All Stock Levels Healthy!</p>
          <p className="text-xs text-emerald-600">No products need restocking right now.</p>
        </div>
      )}
    </div>
  );
}
