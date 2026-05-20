import { WHATSAPP_NUMBER, formatCurrency } from './constants.js';

export function buildWhatsAppMessage(order, items) {
  const productLines = items
    .map((item) => {
      const finalPrice = Number(item.discountedPrice ?? item.price ?? 0);
      return `Product: ${item.name}\nQuantity: ${item.quantity}\nPrice: ${formatCurrency(finalPrice * item.quantity)}`;
    })
    .join('\n\n');

  return `New Order\n${productLines}\n\nCustomer: ${order.customerName}\nMobile: ${order.mobile}\nAddress: ${order.address}`;
}

export function redirectToWhatsApp(order, items) {
  const message = encodeURIComponent(buildWhatsAppMessage(order, items));
  window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
