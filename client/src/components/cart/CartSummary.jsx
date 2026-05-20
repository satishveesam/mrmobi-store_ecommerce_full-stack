import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/constants.js';
import api from '../../services/api.js';

export default function CartSummary({ items, isCheckout = false, onPlaceOrder, canPlaceOrder = true, deliveryPincode }) {
  const [globalDeliveryFee, setGlobalDeliveryFee] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(0);
  const [quickDeliveryFee, setQuickDeliveryFee] = useState(0);
  const [quickDeliveryFreeThreshold, setQuickDeliveryFreeThreshold] = useState(0);
  const [quickLocations, setQuickLocations] = useState([]);

  useEffect(() => {
    // Fetch global delivery fee
    api.get('/products/settings/global-delivery-fee')
      .then(({ data }) => {
        if (data && data.globalDeliveryFee !== undefined) {
          setGlobalDeliveryFee(Number(data.globalDeliveryFee));
        }
      })
      .catch((err) => console.error('Failed to fetch global delivery fee', err));

    // Fetch free delivery threshold
    api.get('/products/settings/free-delivery-threshold')
      .then(({ data }) => {
        if (data && data.freeDeliveryThreshold !== undefined) {
          setFreeDeliveryThreshold(Number(data.freeDeliveryThreshold));
        }
      })
      .catch((err) => console.error('Failed to fetch free delivery threshold', err));

    // Fetch quick delivery fee
    api.get('/products/settings/quick-delivery-fee')
      .then(({ data }) => {
        if (data && data.quickDeliveryFee !== undefined) {
          setQuickDeliveryFee(Number(data.quickDeliveryFee));
        }
      })
      .catch((err) => console.error('Failed to fetch quick delivery fee', err));

    // Fetch quick delivery free threshold
    api.get('/products/settings/quick-delivery-free-threshold')
      .then(({ data }) => {
        if (data && data.quickDeliveryFreeThreshold !== undefined) {
          setQuickDeliveryFreeThreshold(Number(data.quickDeliveryFreeThreshold));
        }
      })
      .catch((err) => console.error('Failed to fetch quick delivery free threshold', err));

    // Fetch quick delivery locations
    api.get('/products/settings/quick-delivery-locations')
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setQuickLocations(data);
        }
      })
      .catch((err) => console.error('Failed to fetch quick delivery locations', err));
  }, []);

  const getFinalPrice = (item) => Number(item.discountedPrice ?? item.price ?? 0);
  const getOriginalPrice = (item) => item.originalPrice ?? item.mrpPrice ?? null;

  const subtotal = items.reduce((sum, item) => sum + getFinalPrice(item) * item.quantity, 0);

  // Delivery fee calculation:
  // Standard vs Quick shipping thresholds resolved independently.
  const isStandardFree = freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold;
  const isQuickFree = quickDeliveryFreeThreshold > 0 && subtotal >= quickDeliveryFreeThreshold;

  const matchedLocation = deliveryPincode 
    ? quickLocations.find(loc => loc.pincode === deliveryPincode) 
    : null;

  const deliveryFee = items.reduce((sum, item) => {
    const isQuick = item.quickDelivery ?? true;

    // Check if the threshold is met for this delivery type
    if (isQuick && isQuickFree) return sum;
    if (!isQuick && isStandardFree) return sum;

    const fee = Number(item.deliveryFee || 0);
    if (fee > 0) return sum + fee;

    const activeQuickFee = matchedLocation ? matchedLocation.deliveryFee : quickDeliveryFee;
    const fallbackFee = isQuick ? activeQuickFee : globalDeliveryFee;
    return sum + fallbackFee;
  }, 0);

  // Bag Total (MRP) before discounts
  const bagTotalMRP = items.reduce((sum, item) => {
    const original = getOriginalPrice(item) ?? getFinalPrice(item);
    return sum + Number(original) * item.quantity;
  }, 0);

  // Total discount saved
  const totalDiscount = items.reduce((sum, item) => {
    const original = getOriginalPrice(item);
    if (original == null) return sum;

    const final = getFinalPrice(item);
    const perItemSavings = Number(original) - final;
    return perItemSavings > 0 ? sum + perItemSavings * item.quantity : sum;
  }, 0);

  return (
    <aside className="rounded-xl bg-white p-5 shadow-soft">
      <h2 className="mb-4 text-lg font-black">Order Summary</h2>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Bag Total (MRP)</span>
          <span>{formatCurrency(bagTotalMRP)}</span>
        </div>

        {totalDiscount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Total Discount</span>
            <span>-{formatCurrency(totalDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between text-slate-600">
            <span>Delivery</span>
            <span className={deliveryFee > 0 ? "font-bold text-slate-900 animate-fade-in" : "text-green-700 font-bold"}>
              {deliveryFee > 0 ? formatCurrency(deliveryFee) : "Free"}
            </span>
          </div>
          {matchedLocation && deliveryFee > 0 && (
            <p className="text-[10px] text-emerald-600 font-bold text-right leading-none">
              ⚡ Location override applied ({deliveryPincode})
            </p>
          )}
        </div>

        {/* Free Delivery Incentive Progress Banner */}
        {items.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-dashed border-slate-100 space-y-1.5 animate-in fade-in duration-200">
            {/* Standard Delivery Threshold */}
            {freeDeliveryThreshold > 0 && (
              isStandardFree ? (
                <p className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-center flex items-center justify-center gap-1">
                  🎉 Free Standard Delivery Unlocked!
                </p>
              ) : (
                <p className="text-[10px] font-bold text-slate-500 text-center">
                  Add <span className="text-blue-600 font-extrabold">{formatCurrency(freeDeliveryThreshold - subtotal)}</span> more for <span className="font-extrabold text-slate-700">Free Standard Delivery</span>
                </p>
              )
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between border-t pt-4 text-lg font-black">
        <span>Total</span>
        <span>{formatCurrency(subtotal + deliveryFee)}</span>
      </div>

      {isCheckout ? (
        <button 
          onClick={onPlaceOrder} 
          className={`btn-primary mt-5 w-full h-12 text-lg ${!canPlaceOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!canPlaceOrder}
        >
          Place Order Now
        </button>
      ) : (
        <Link to="/checkout" className="btn-primary mt-5 w-full">
          Checkout
        </Link>
      )}
    </aside>
  );
}
