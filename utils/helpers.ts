import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import type { Product } from '../types';

// Configure dayjs to use Arabic locale
dayjs.locale('ar');

// Format date to Arabic format
export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('YYYY/MM/DD');
};

// Format date with time
export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('YYYY/MM/DD HH:mm');
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Generate a barcode for products
export const generateBarcode = (product: Partial<Product>): string => {
  // You can customize the barcode format as needed
  // This is a simple implementation
  const prefix = 'ALX';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}${timestamp}${random}`;
};

// Check if a product is expiring soon (within 30 days)
export const isExpiringSoon = (expiryDate: string): boolean => {
  const expiryDay = dayjs(expiryDate);
  const today = dayjs();
  const daysUntilExpiry = expiryDay.diff(today, 'day');
  
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
};

// Check if a product is expired
export const isExpired = (expiryDate: string): boolean => {
  const expiryDay = dayjs(expiryDate);
  const today = dayjs();
  
  return expiryDay.isBefore(today, 'day');
};

// Get stock status text and color
export const getStockStatus = (quantity: number): { text: string; color: string } => {
  if (quantity <= 0) {
    return { text: 'نفذت الكمية', color: 'red' };
  } else if (quantity < 10) {
    return { text: 'منخفض', color: 'orange' };
  } else {
    return { text: 'متوفر', color: 'green' };
  }
};

// Calculate invoice total
export const calculateInvoiceTotal = (items: Array<{ quantity: number; unitPrice: number; discount?: number }>): number => {
  return items.reduce((total, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const discount = item.discount || 0;
    return total + (itemTotal - (itemTotal * discount / 100));
  }, 0);
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Convert Arabic/Eastern digits to English digits
export const toEnglishDigits = (str: string): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  return str.replace(/[٠-٩]/g, match => englishDigits[arabicDigits.indexOf(match)]);
};

// Convert English digits to Arabic/Eastern digits
export const toArabicDigits = (str: string | number): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const strValue = String(str);
  
  return strValue.replace(/[0-9]/g, match => arabicDigits[parseInt(match)]);
}; 