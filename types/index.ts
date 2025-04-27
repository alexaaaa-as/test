import { ReactNode } from "react";

// Product related types
export interface Product {
  id: string;
  name: string; 
  quantity: number;
  wholesalePrice: number;
  sellingPrice: number;
  lotNumber: string;
  expiryDate: string;
  barcode: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMovement {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  type: 'IN' | 'OUT';
  representativeId?: string;
  customerId?: string;
  invoiceId?: string;
  date: string;
  notes?: string;
}

// Representative related types
export interface Representative {
  id: string;
  name: string;
  phone: string;
  photoUrl?: string;
  email?: string;
  address?: string;
  joinDate: string;
  active: boolean;
  currentLocation?: GeoLocation;
  visitRoute?: VisitStop[];
}

export interface GeoLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface VisitStop {
  id: string;
  customerId: string;
  order: number;
  visitDate?: string;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  notes?: string;
}

// Customer related types
export interface Customer {
  photoUrl: ReactNode;
  city: ReactNode;
  registrationDate(registrationDate: any): import("react").ReactNode;
  email: any;
  id: string;
  name: string;
  phone: string;
  address: string;
  businessType: string;
  creditLimit: number;
  representativeId?: string;
  location?: GeoLocation;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface CustomerPurchaseHistory {
  customerId: string;
  totalPurchases: number;
  lastPurchaseDate: string;
  frequencyScore: number; // 1-10 rating based on how often they purchase
  preferredProducts: Array<{productId: string, count: number}>;
}

// Invoice related types
export interface Invoice {
  total: number;
  paid: any;
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: Customer;
  representativeId: string;
  representative?: Representative;
  date: string;
  items: InvoiceItem[];
  status: 'DRAFT' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  paidAmount: number;
  discount?: number;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

// Expense related types
export interface Expense {
  id: string;
  representativeId: string;
  representative?: Representative;
  date: string;
  amount: number;
  category: 'PERSONAL' | 'VEHICLE' | 'OTHER';
  description: string;
  attachmentUrl?: string;
  approved: boolean;
}

// User and auth related types
export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: 'ADMIN' | 'REPRESENTATIVE';
  representativeId?: string;
  lastLogin?: string;
  active: boolean;
}

// Dashboard types
export interface DashboardStats {
  totalSales: number;
  totalExpenses: number;
  inventoryValue: number;
  lowStockProducts: number;
  expiringProducts: number;
  activeCustomers: number;
  activeRepresentatives: number;
  monthlySalesChart: {month: string, amount: number}[];
  topSellingProducts: {productId: string, productName: string, quantity: number}[];
  topRepresentatives: {representativeId: string, representativeName: string, sales: number}[];
} 