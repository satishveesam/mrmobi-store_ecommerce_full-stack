import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PackagePlus, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductForm from '../../components/admin/ProductForm.jsx';
import ProductTable from '../../components/admin/ProductTable.jsx';
import { fetchProducts, removeProduct, saveProduct } from '../../redux/slices/productSlice.js';

export default function ProductManagement() {
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [filterDelivery, setFilterDelivery] = useState('All');
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const submit = async (values) => {
    try {
      await dispatch(saveProduct({ id: selected?.id, values })).unwrap();
      toast.success(selected ? 'Product updated successfully!' : 'Product created successfully!');
      setSelected(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save product.');
    }
  };

  const categoriesList = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    // 1. Text Search Filter
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category Filter
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;

    // 3. Stock Status Filter
    let matchesStock = true;
    const s = Number(p.stock || 0);
    if (filterStock === 'InStock') {
      matchesStock = s > 0;
    } else if (filterStock === 'LowStock') {
      matchesStock = s > 0 && s < 10;
    } else if (filterStock === 'OutOfStock') {
      matchesStock = s === 0;
    }

    // 4. Delivery Mode Filter
    let matchesDelivery = true;
    const isQuick = p.quickDelivery ?? true;
    if (filterDelivery === 'Quick') {
      matchesDelivery = isQuick;
    } else if (filterDelivery === 'Standard') {
      matchesDelivery = !isQuick;
    }

    return matchesSearch && matchesCategory && matchesStock && matchesDelivery;
  });

  return (
    <div className="space-y-4">
      {/* Header Area */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-xs text-slate-500 font-medium">Manage your products, pricing, and stock levels.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setSelected(null);
              setShowForm(!showForm);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-emerald-700 hover:shadow transition-all active:scale-[0.98]"
          >
            <PackagePlus size={15} />
            <span>{showForm ? 'Close Form' : 'Add New Product'}</span>
          </button>
        </div>
      </div>

      {/* Form Area */}
      {showForm && (
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">{selected ? 'Edit Product' : 'Create New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium">Cancel</button>
           </div>
           <ProductForm selected={selected} onSubmit={submit} onCancel={() => {
             setSelected(null);
             setShowForm(false);
           }} />
        </div>
      )}

      {/* Toolbar */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search by name or category..."
              className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all w-full bg-white text-xs text-slate-800 placeholder:text-slate-400 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold shadow-sm transition active:scale-[0.97] ${
              showFilterPanel 
                ? 'bg-slate-100 border-slate-350 text-slate-800' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={14} />
            <span>Filters</span>
            {(filterCategory !== 'All' || filterStock !== 'All' || filterDelivery !== 'All') && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            )}
          </button>
        </div>

        {/* Dynamic Collapsible Filter Panel */}
        {showFilterPanel && (
          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full text-xs py-1 px-2 border border-slate-200 rounded-lg outline-none bg-white font-medium text-slate-700 focus:border-emerald-500"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Stock Status Dropdown */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Stock Status</label>
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="w-full text-xs py-1 px-2 border border-slate-200 rounded-lg outline-none bg-white font-medium text-slate-700 focus:border-emerald-500"
              >
                <option value="All">All Statuses</option>
                <option value="InStock">In Stock</option>
                <option value="LowStock">Low Stock (&lt; 10)</option>
                <option value="OutOfStock">Out of Stock</option>
              </select>
            </div>

            {/* Delivery Mode Dropdown */}
            <div className="space-y-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Delivery Mode</label>
              <select
                value={filterDelivery}
                onChange={(e) => setFilterDelivery(e.target.value)}
                className="w-full text-xs py-1 px-2 border border-slate-200 rounded-lg outline-none bg-white font-medium text-slate-700 focus:border-emerald-500"
              >
                <option value="All">All Delivery Modes</option>
                <option value="Quick">⚡ Quick Delivery</option>
                <option value="Standard">Standard Delivery</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
        <ProductTable 
          products={filteredProducts} 
          onEdit={(p) => {
            setSelected(p);
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          onDelete={(id) => {
            if (window.confirm('Are you sure you want to delete this product?')) {
              dispatch(removeProduct(id))
                .unwrap()
                .then(() => toast.success('Product deleted successfully!'))
                .catch((err) => {
                  console.error(err);
                  toast.error('Failed to delete product.');
                });
            }
          }} 
        />
      </div>
    </div>
  );
}
