export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api';
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '91XXXXXXXXXX';

export const fallbackProducts = [
  {
    id: 1,
    name: 'iPhone 15',
    description: 'A16 Bionic chip, advanced camera system, and all-day battery life.',
    price: 79999,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80',
    stock: 12,
    category: 'Mobiles',
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    description: 'Flagship Android phone with bright display and pro-grade camera.',
    price: 74999,
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80',
    stock: 9,
    category: 'Mobiles',
  },
  {
    id: 3,
    name: 'Noise Smart Watch',
    description: 'Fitness tracking, Bluetooth calling, and crisp AMOLED screen.',
    price: 3999,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    stock: 30,
    category: 'Accessories',
  },
  {
    id: 4,
    name: 'Boat Airdopes',
    description: 'Wireless earbuds with punchy bass and compact charging case.',
    price: 1799,
    imageUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80',
    stock: 42,
    category: 'Audio',
  },
];

export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
