import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  Product, 
  Representative, 
  Customer, 
  Invoice, 
  Expense, 
  User, 
  DashboardStats
} from '../types';

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
  
  // Products
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  
  // Representatives
  representatives: Representative[];
  setRepresentatives: (representatives: Representative[]) => void;
  addRepresentative: (representative: Representative) => void;
  updateRepresentative: (representative: Representative) => void;
  deleteRepresentative: (representativeId: string) => void;
  updateRepresentativeLocation: (repId: string, lat: number, lng: number) => void;
  
  // Customers
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  
  // Invoices
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (invoiceId: string) => void;
  
  // Expenses
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  
  // Dashboard
  dashboardStats: DashboardStats | null;
  updateDashboardStats: () => void;
  
  // UI State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// Mock data for initial development
const mockUser: User = {
  id: '1',
  username: 'admin',
  name: 'مدير النظام',
  role: 'ADMIN',
  active: true,
};

// Create the store
export const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Auth
        currentUser: mockUser, // For development only
        isAuthenticated: true, // For development only
        login: (username, password) => {
          // In a real app, this would make an API call
          if (username === 'admin' && password === 'admin') {
            set({ currentUser: mockUser, isAuthenticated: true });
          }
        },
        logout: () => set({ currentUser: null, isAuthenticated: false }),
        
        // Products
        products: [],
        setProducts: (products) => set({ products }),
        addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
        updateProduct: (product) => set((state) => ({ 
          products: state.products.map(p => p.id === product.id ? product : p) 
        })),
        deleteProduct: (productId) => set((state) => ({ 
          products: state.products.filter(p => p.id !== productId) 
        })),
        
        // Representatives
        representatives: [],
        setRepresentatives: (representatives) => set({ representatives }),
        addRepresentative: (representative) => set((state) => ({ 
          representatives: [...state.representatives, representative] 
        })),
        updateRepresentative: (representative) => set((state) => ({ 
          representatives: state.representatives.map(r => r.id === representative.id ? representative : r) 
        })),
        deleteRepresentative: (representativeId) => set((state) => ({ 
          representatives: state.representatives.filter(r => r.id !== representativeId) 
        })),
        updateRepresentativeLocation: (repId, lat, lng) => set((state) => ({
          representatives: state.representatives.map(r => r.id === repId 
            ? { 
                ...r, 
                currentLocation: { 
                  lat, 
                  lng, 
                  timestamp: new Date().toISOString() 
                } 
              } 
            : r
          )
        })),
        
        // Customers
        customers: [],
        setCustomers: (customers) => set({ customers }),
        addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
        updateCustomer: (customer) => set((state) => ({ 
          customers: state.customers.map(c => c.id === customer.id ? customer : c) 
        })),
        deleteCustomer: (customerId) => set((state) => ({ 
          customers: state.customers.filter(c => c.id !== customerId) 
        })),
        
        // Invoices
        invoices: [],
        setInvoices: (invoices) => set({ invoices }),
        addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
        updateInvoice: (invoice) => set((state) => ({ 
          invoices: state.invoices.map(i => i.id === invoice.id ? invoice : i) 
        })),
        deleteInvoice: (invoiceId) => set((state) => ({ 
          invoices: state.invoices.filter(i => i.id !== invoiceId) 
        })),
        
        // Expenses
        expenses: [],
        setExpenses: (expenses) => set({ expenses }),
        addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
        updateExpense: (expense) => set((state) => ({ 
          expenses: state.expenses.map(e => e.id === expense.id ? expense : e) 
        })),
        deleteExpense: (expenseId) => set((state) => ({ 
          expenses: state.expenses.filter(e => e.id !== expenseId) 
        })),
        
        // Dashboard
        dashboardStats: null,
        updateDashboardStats: () => {
          // This would typically make an API call to get updated stats
          // For now, we'll just generate some mock data
          const mockStats: DashboardStats = {
            totalSales: 125000,
            totalExpenses: 45000,
            inventoryValue: 350000,
            lowStockProducts: 5,
            expiringProducts: 8,
            activeCustomers: 42,
            activeRepresentatives: 6,
            monthlySalesChart: [
              { month: 'يناير', amount: 15000 },
              { month: 'فبراير', amount: 18000 },
              { month: 'مارس', amount: 22000 },
              { month: 'أبريل', amount: 25000 },
              { month: 'مايو', amount: 30000 },
              { month: 'يونيو', amount: 28000 },
            ],
            topSellingProducts: [
              { productId: '1', productName: 'سماد NPK', quantity: 120 },
              { productId: '2', productName: 'مبيد حشري', quantity: 85 },
              { productId: '3', productName: 'بذور طماطم', quantity: 65 },
            ],
            topRepresentatives: [
              { representativeId: '1', representativeName: 'أحمد محمود', sales: 45000 },
              { representativeId: '2', representativeName: 'محمد علي', sales: 38000 },
              { representativeId: '3', representativeName: 'خالد إبراهيم', sales: 32000 },
            ],
          };
          set({ dashboardStats: mockStats });
        },
        
        // UI State
        sidebarCollapsed: false,
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        darkMode: false,
        toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      }),
      {
        name: 'alex-agricultural-store',
        partialize: (state) => ({
          currentUser: state.currentUser,
          isAuthenticated: state.isAuthenticated,
          darkMode: state.darkMode,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    )
  )
); 