import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Trash2, Plus, Pencil, Tag, Smartphone, Headphones, Watch, Cable, Laptop, Camera, Gamepad2, Smile, Pizza, Plane, ShoppingBag, Gift, Heart, Zap, Speaker, Tv, Shirt, Footprints, Glasses, Book, Briefcase, HardDrive, Wifi, Bike, Car, Utensils, Baby, Flower, Brush, Music, Shield } from 'lucide-react';
import { categoryService } from '../../services/categoryService.js';
import Loader from '../../components/common/Loader.jsx';

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

const ICON_SUGGESTIONS = [
  'Smartphone', 'Headphones', 'Watch', 'Cable', 'Laptop', 'Camera', 'Gamepad2', 'Smile', 'Pizza', 'Plane', 'ShoppingBag',
  'Gift', 'Heart', 'Zap', 'Speaker', 'Tv', 'Shirt', 'Footprints', 'Glasses', 'Book', 'Briefcase',
  'HardDrive', 'Wifi', 'Bike', 'Car', 'Utensils', 'Baby', 'Flower', 'Brush', 'Music', 'Shield'
];

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', icon: 'Smartphone', slug: '' });

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setForm({ name: '', icon: 'Smartphone', slug: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.icon.trim()) {
      toast.error('Name and icon are required');
      return;
    }
    const payload = {
      name: form.name.trim(),
      icon: form.icon.trim(),
      slug: (form.slug.trim() || form.name.trim()),
      sortOrder: editingId ? undefined : categories.length,
    };
    setSubmitting(true);
    try {
      if (editingId) {
        await categoryService.update(editingId, payload);
        toast.success('Category updated!');
      } else {
        await categoryService.create(payload);
        toast.success('Category created!');
      }
      resetForm();
      fetchCategories();
    } catch {
      toast.error('Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, icon: cat.icon, slug: cat.slug || cat.name });
    setEditingId(cat.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryService.delete(id);
      toast.success('Category deleted');
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Category Icon Bar</h1>
          <p className="text-xs text-slate-500 font-medium">Manage the category icons shown below the navigation bar.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-emerald-700 hover:shadow transition-all active:scale-[0.98]"
        >
          <Plus size={15} />
          <span>{showForm && !editingId ? 'Cancel' : 'Add Category'}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            {editingId ? '✏️ Edit Category' : '➕ New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobiles"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value })}
                  className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Product Slug (filter key) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobiles (must match product category)"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Icon (Lucide Name or Emoji) *</label>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center text-xl shrink-0 shadow-inner">
                  {iconMap[form.icon] ? (() => {
                    const Icon = iconMap[form.icon];
                    return <Icon size={20} className="text-emerald-600" />;
                  })() : form.icon || '?'}
                </div>
                <input
                  type="text"
                  placeholder="Enter icon name (e.g. Smartphone) or emoji..."
                  value={form.icon}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                  className="flex-1 text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800"
                />
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Quick Pick (Lucide Icons):</p>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                {ICON_SUGGESTIONS.map(iconName => {
                  const Icon = iconMap[iconName] || ShoppingBag;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setForm({ ...form, icon: iconName })}
                      className={`h-7 w-7 rounded-md flex items-center justify-center transition-all hover:scale-105 border ${
                        form.icon === iconName 
                          ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/10' 
                          : 'bg-white border-slate-100 hover:bg-slate-50'
                      }`}
                      title={iconName}
                    >
                      <Icon size={13} className="text-emerald-600" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="py-1.5 px-4 rounded-lg border border-slate-250 text-slate-500 hover:bg-slate-50 text-xs font-semibold transition active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow transition active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category List */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Tag className="text-emerald-500" size={16} />
          <h2 className="text-sm font-bold text-slate-900">Active Categories</h2>
          <span className="ml-2 px-1.5 py-0.2 bg-slate-150 rounded text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
            {categories.length} Total
          </span>
        </div>

        {loading ? (
          <Loader />
        ) : categories.length === 0 ? (
          <div className="rounded-xl bg-slate-50/50 border border-dashed border-slate-200 p-8 text-center">
            <p className="text-xs text-slate-400 font-medium italic">No categories yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => {
              const IconComponent = iconMap[cat.icon] || iconMap[cat.name];
              return (
                <div
                  key={cat.id}
                  className="group bg-white rounded-xl border border-slate-100 p-2.5 flex items-center gap-3 hover:shadow-sm transition-all"
                >
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-50/60 border border-emerald-100/50 flex items-center justify-center text-xl shadow-inner">
                    {IconComponent ? (
                      <IconComponent size={20} className="text-emerald-600" />
                    ) : (
                      <span className="text-base">{cat.icon || '📦'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-slate-800 truncate">{cat.name}</p>
                    <p className="text-[9px] text-slate-450 font-semibold uppercase tracking-wide truncate mt-0.5">slug: {cat.slug}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="h-6 w-6 rounded-md bg-blue-50 border border-blue-100/30 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Edit Category"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="h-6 w-6 rounded-md bg-rose-50 border border-rose-100/30 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
