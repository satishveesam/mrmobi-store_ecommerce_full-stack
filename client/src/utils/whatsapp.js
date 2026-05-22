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
  // Sanitize the WhatsApp number: remove all spaces, +, -, or other non-digit characters
  const cleanNumber = String(WHATSAPP_NUMBER).replace(/\D/g, '');
  
  const message = encodeURIComponent(buildWhatsAppMessage(order, items));
  const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${message}`;
  
  // Open in a new tab so that the parent web app is not navigated away
  window.open(url, '_blank');
}
