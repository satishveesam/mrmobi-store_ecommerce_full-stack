import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import api from '../../services/api.js';
import { API_BASE_URL } from '../../utils/constants.js';

const emptyForm = {
  name: '',
  description: '',
  originalPrice: '',
  discountPercentage: '',
  imageUrl: '',
  images: [],
  stock: '',
  category: '',
  quickDelivery: true,
  deliveryFee: '',
};

export default function ProductForm({ selected, onSubmit, onCancel }) {
  const [values, setValues] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const originalPriceNumber = values.originalPrice === '' ? null : Number(values.originalPrice);
  const discountNumber = values.discountPercentage === '' ? 0 : Number(values.discountPercentage);
  const computedDiscounted =
    originalPriceNumber == null ? null : Math.max(0, originalPriceNumber - (originalPriceNumber * Math.min(100, Math.max(0, discountNumber)) / 100));

  useEffect(() => {
    setValues(
      selected
        ? {
            ...selected,
            originalPrice: selected.originalPrice ?? selected.mrpPrice ?? '',
            discountPercentage: selected.discountPercentage ?? selected.discountPercent ?? '',
            stock: selected.stock ?? '',
            images: selected.images || (selected.imageUrl ? [selected.imageUrl] : []),
            quickDelivery: selected.quickDelivery ?? true,
            deliveryFee: selected.deliveryFee ?? '',
          }
        : emptyForm
    );
  }, [selected]);

  const submit = (event) => {
    event.preventDefault();

    onSubmit({
      ...values,
      originalPrice: values.originalPrice === '' ? null : Number(values.originalPrice),
      discountPercentage: values.discountPercentage === '' ? 0 : Number(values.discountPercentage),
      stock: Number(values.stock),
      deliveryFee: values.deliveryFee === '' ? 0.0 : Number(values.deliveryFee),
      // Use the first image as legacy imageUrl if none is provided
      imageUrl: values.imageUrl || (values.images && values.images.length > 0 ? values.images[0] : ''),
    });

    setValues(emptyForm);
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('mrmobi_token');
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      // response.data contains the list of URLs
      setValues((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...response.data],
      }));
    } catch (error) {
      console.error('Image upload failed', error);
      alert('Failed to upload images.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    setValues((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  // Helper to resolve image URL (handling absolute vs relative uploads)
  const BACKEND_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BACKEND_BASE}${url}`;
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 grid-cols-2">
        {/* Name */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Product Name</label>
          <input
            required
            className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800"
            placeholder="e.g. iPhone 15 Pro"
            value={values.name || ''}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
        </div>

        {/* Category */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
          <input
            required
            className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800"
            placeholder="e.g. Smartphones"
            value={values.category || ''}
            onChange={(e) => setValues({ ...values, category: e.target.value })}
          />
        </div>

        {/* Original Price */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Original Price (₹)</label>
          <input
            type="number"
            required
            className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0.00"
            value={values.originalPrice ?? ''}
            onChange={(e) => setValues({ ...values, originalPrice: e.target.value })}
          />
        </div>

        {/* Discount Percentage */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Discount %</label>
          <input
            type="number"
            className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
            value={values.discountPercentage ?? ''}
            onChange={(e) => setValues({ ...values, discountPercentage: e.target.value })}
          />
        </div>

        {/* Stock */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stock Quantity</label>
          <input
            type="number"
            required
            className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
            value={values.stock ?? ''}
            onChange={(e) => setValues({ ...values, stock: e.target.value })}
          />
        </div>

        {/* Discounted Price (Auto) */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Selling Price (Auto)</label>
          <div className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-100 bg-slate-50 font-bold text-emerald-700 flex items-center h-[32px]">
            {computedDiscounted == null ? '-' : `₹${computedDiscounted.toLocaleString('en-IN')}`}
          </div>
        </div>

        {/* Delivery Fee */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Delivery Fee (₹)</label>
          <input
            type="number"
            step="any"
            className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0.00"
            value={values.deliveryFee ?? ''}
            onChange={(e) => setValues({ ...values, deliveryFee: e.target.value })}
          />
        </div>

        {/* Quick Delivery Switch */}
        <div className="col-span-2 sm:col-span-1 flex items-center gap-2 py-1.5 px-3 border border-slate-200 rounded-lg bg-white shadow-sm self-end h-[32px]">
          <input
            type="checkbox"
            id="quickDelivery"
            className="w-4 h-4 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500 cursor-pointer"
            checked={values.quickDelivery || false}
            onChange={(e) => setValues({ ...values, quickDelivery: e.target.checked })}
          />
          <label htmlFor="quickDelivery" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
             ⚡ Supports Quick Delivery
          </label>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Product Description</label>
          <textarea
            className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-150 text-slate-800 h-16 resize-y"
            placeholder="Enter product specifications, features..."
            value={values.description || ''}
            onChange={(e) => setValues({ ...values, description: e.target.value })}
          />
        </div>

        {/* Image Upload Area */}
        <div className="col-span-2 border border-dashed border-slate-200 rounded-lg p-3 bg-slate-50/50">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Product Images</label>
          
          {/* Preview list */}
          {(values.images || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {(values.images || []).map((imgUrl, index) => (
                <div key={index} className="relative w-12 h-12 border border-slate-150 rounded-lg overflow-hidden group shadow-sm bg-white">
                  <img src={getImageUrl(imgUrl)} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-sm"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            disabled={uploading}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border file:border-emerald-100 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
          />
          {uploading && <p className="text-[10px] text-emerald-600 mt-1.5 font-bold animate-pulse">Uploading images...</p>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end pt-2">
        {selected && (
          <button 
            type="button" 
            onClick={onCancel} 
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-semibold active:scale-[0.98] transition-all duration-150"
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150"
        >
          {selected ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
