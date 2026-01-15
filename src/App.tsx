import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  History, 
  Users, 
  Wallet, 
  Truck, 
  UsersRound, 
  LayoutDashboard,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { firebaseDb } from './services/firebase.ts';
import type { Product, Client, Supplier, Sale, CashTransaction, CartItem, ClientPayment, SupplierPayment, SupplierTransaction } from './services/types.ts';

// Страницы
import ProductsPage from './pages/Products.tsx';
import CartPage from './pages/Cart.tsx';
import HistoryPage from './pages/History.tsx';
import ClientsPage from './pages/Clients.tsx';
import CashierPage from './pages/Cashier.tsx';
import InventoryPage from './pages/Inventory.tsx';
import SuppliersPage from './pages/Suppliers.tsx';
import ReconciliationPage from './pages/Reconciliation.tsx';

interface AppContextType {
  products: Product[];
  setProducts: (data: Product[] | ((prev: Product[]) => Product[])) => void;
  clients: Client[];
  setClients: (data: Client[] | ((prev: Client[]) => Client[])) => void;
  suppliers: Supplier[];
  setSuppliers: (data: Supplier[] | ((prev: Supplier[]) => Supplier[])) => void;
  sales: Sale[];
  setSales: (data: Sale[] | ((prev: Sale[]) => Sale[])) => void;
  cash: CashTransaction[];
  setCash: (data: CashTransaction[] | ((prev: CashTransaction[]) => CashTransaction[])) => void;
  payments: ClientPayment[];
  setPayments: (data: ClientPayment[] | ((prev: ClientPayment[]) => ClientPayment[])) => void;
  supplierPayments: SupplierPayment[];
  setSupplierPayments: (data: SupplierPayment[] | ((prev: SupplierPayment[]) => SupplierPayment[])) => void;
  supplierTransactions: SupplierTransaction[];
  setSupplierTransactions: (data: SupplierTransaction[] | ((prev: SupplierTransaction[]) => SupplierTransaction[])) => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const App: React.FC = () => {
  const [products, setProductsState] = useState<Product[]>([]);
  const [clients, setClientsState] = useState<Client[]>([]);
  const [suppliers, setSuppliersState] = useState<Supplier[]>([]);
  const [sales, setSalesState] = useState<Sale[]>([]);
  const [cash, setCashState] = useState<CashTransaction[]>([]);
  const [payments, setPaymentsState] = useState<ClientPayment[]>([]);
  const [supplierPayments, setSupplierPaymentsState] = useState<SupplierPayment[]>([]);
  const [supplierTransactions, setSupplierTransactionsState] = useState<SupplierTransaction[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Реальное время: подписка на Firebase
  useEffect(() => {
    const unsubProducts = firebaseDb.subscribe('products', setProductsState);
    const unsubClients = firebaseDb.subscribe('clients', setClientsState);
    const unsubSuppliers = firebaseDb.subscribe('suppliers', setSuppliersState);
    const unsubSales = firebaseDb.subscribe('sales', (data) => {
       setSalesState(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
    const unsubCash = firebaseDb.subscribe('cash', setCashState);
    const unsubPayments = firebaseDb.subscribe('payments', setPaymentsState);
    const unsubSuppPayments = firebaseDb.subscribe('supplierPayments', setSupplierPaymentsState);
    const unsubSuppTxs = firebaseDb.subscribe('supplierTransactions', setSupplierTransactionsState);

    return () => {
      unsubProducts();
      unsubClients();
      unsubSuppliers();
      unsubSales();
      unsubCash();
      unsubPayments();
      unsubSuppPayments();
      unsubSuppTxs();
    };
  }, []);

  const setProducts = (data: Product[] | ((prev: Product[]) => Product[])) => {
    const newData = typeof data === 'function' ? data(products) : data;
    newData.forEach(p => firebaseDb.save('products', p.id, p));
  };

  const setClients = (data: Client[] | ((prev: Client[]) => Client[])) => {
    const newData = typeof data === 'function' ? data(clients) : data;
    newData.forEach(c => firebaseDb.save('clients', c.id, c));
  };

  const setSuppliers = (data: Supplier[] | ((prev: Supplier[]) => Supplier[])) => {
    const newData = typeof data === 'function' ? data(suppliers) : data;
    newData.forEach(s => firebaseDb.save('suppliers', s.id, s));
  };

  const setSales = (data: Sale[] | ((prev: Sale[]) => Sale[])) => {
    const newData = typeof data === 'function' ? data(sales) : data;
    newData.forEach(s => firebaseDb.save('sales', s.id, s));
  };

  const setCash = (data: CashTransaction[] | ((prev: CashTransaction[]) => CashTransaction[])) => {
    const newData = typeof data === 'function' ? data(cash) : data;
    newData.forEach(tx => firebaseDb.save('cash', tx.id, tx));
  };

  const setPayments = (data: ClientPayment[] | ((prev: ClientPayment[]) => ClientPayment[])) => {
    const newData = typeof data === 'function' ? data(payments) : data;
    newData.forEach(p => firebaseDb.save('payments', p.id, p));
  };

  const setSupplierPayments = (data: SupplierPayment[] | ((prev: SupplierPayment[]) => SupplierPayment[])) => {
    const newData = typeof data === 'function' ? data(supplierPayments) : data;
    newData.forEach(p => firebaseDb.save('supplierPayments', p.id, p));
  };

  const setSupplierTransactions = (data: SupplierTransaction[] | ((prev: SupplierTransaction[]) => SupplierTransaction[])) => {
    const newData = typeof data === 'function' ? data(supplierTransactions) : data;
    newData.forEach(t => firebaseDb.save('supplierTransactions', t.id, t));
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const navItems = [
    { name: 'Товары', path: '/', icon: Package },
    { name: 'Корзина', path: '/cart', icon: ShoppingCart, badge: cart.length },
    { name: 'История', path: '/history', icon: History },
    { name: 'Клиенты', path: '/clients', icon: Users },
    { name: 'Поставщики', path: '/suppliers', icon: UsersRound },
    { name: 'Касса', path: '/cashier', icon: Wallet },
    { name: 'Склад', path: '/inventory', icon: Truck },
    { name: 'Сверка', path: '/reconciliation', icon: FileText },
  ];

  return (
    <AppContext.Provider value={{ 
      products, setProducts, 
      clients, setClients, 
      suppliers, setSuppliers, 
      sales, setSales, 
      cash, setCash,
      payments, setPayments,
      supplierPayments, setSupplierPayments,
      supplierTransactions, setSupplierTransactions,
      cart, setCart,
      addToCart, removeFromCart, clearCart
    }}>
      <div className="flex min-h-screen bg-slate-50">
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white rounded-lg shadow-lg text-slate-600">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-10 px-2 shrink-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <LayoutDashboard size={24} />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">358 PRO</h1>
            </div>
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <item.icon size={20} />
                  <span className="flex-1 text-sm font-bold uppercase tracking-tight">{item.name}</span>
                  {item.badge && item.badge > 0 && <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{item.badge}</span>}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/cashier" element={<CashierPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/reconciliation" element={<ReconciliationPage />} />
          </Routes>
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;