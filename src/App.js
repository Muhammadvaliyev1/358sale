import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingCart, History, Users, Wallet, Truck, UsersRound, LayoutDashboard, FileText, Menu, X } from 'lucide-react';
import { firebaseDb } from './services/firebase';
// Страницы
import ProductsPage from './pages/Products';
import CartPage from './pages/Cart';
import HistoryPage from './pages/History';
import ClientsPage from './pages/Clients';
import CashierPage from './pages/Cashier';
import InventoryPage from './pages/Inventory';
import SuppliersPage from './pages/Suppliers';
import ReconciliationPage from './pages/Reconciliation';
export const AppContext = createContext(undefined);
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context)
        throw new Error("useApp must be used within AppProvider");
    return context;
};
const App = () => {
    const [products, setProductsState] = useState([]);
    const [clients, setClientsState] = useState([]);
    const [suppliers, setSuppliersState] = useState([]);
    const [sales, setSalesState] = useState([]);
    const [cash, setCashState] = useState([]);
    const [payments, setPaymentsState] = useState([]);
    const [supplierPayments, setSupplierPaymentsState] = useState([]);
    const [supplierTransactions, setSupplierTransactionsState] = useState([]);
    const [cart, setCart] = useState([]);
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
    const setProducts = (data) => {
        const newData = typeof data === 'function' ? data(products) : data;
        newData.forEach(p => firebaseDb.save('products', p.id, p));
    };
    const setClients = (data) => {
        const newData = typeof data === 'function' ? data(clients) : data;
        newData.forEach(c => firebaseDb.save('clients', c.id, c));
    };
    const setSuppliers = (data) => {
        const newData = typeof data === 'function' ? data(suppliers) : data;
        newData.forEach(s => firebaseDb.save('suppliers', s.id, s));
    };
    const setSales = (data) => {
        const newData = typeof data === 'function' ? data(sales) : data;
        newData.forEach(s => firebaseDb.save('sales', s.id, s));
    };
    const setCash = (data) => {
        const newData = typeof data === 'function' ? data(cash) : data;
        newData.forEach(tx => firebaseDb.save('cash', tx.id, tx));
    };
    const setPayments = (data) => {
        const newData = typeof data === 'function' ? data(payments) : data;
        newData.forEach(p => firebaseDb.save('payments', p.id, p));
    };
    const setSupplierPayments = (data) => {
        const newData = typeof data === 'function' ? data(supplierPayments) : data;
        newData.forEach(p => firebaseDb.save('supplierPayments', p.id, p));
    };
    const setSupplierTransactions = (data) => {
        const newData = typeof data === 'function' ? data(supplierTransactions) : data;
        newData.forEach(t => firebaseDb.save('supplierTransactions', t.id, t));
    };
    const addToCart = (product, quantity) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item);
            }
            return [...prev, { ...product, quantity }];
        });
    };
    const removeFromCart = (productId) => {
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
    return (_jsx(AppContext.Provider, { value: {
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
        }, children: _jsxs("div", { className: "flex min-h-screen bg-slate-50", children: [_jsx("div", { className: "lg:hidden fixed top-4 left-4 z-50", children: _jsx("button", { onClick: () => setIsSidebarOpen(!isSidebarOpen), className: "p-2 bg-white rounded-lg shadow-lg text-slate-600", children: isSidebarOpen ? _jsx(X, { size: 24 }) : _jsx(Menu, { size: 24 }) }) }), _jsx("aside", { className: `fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`, children: _jsxs("div", { className: "h-full flex flex-col p-6 overflow-y-auto", children: [_jsxs("div", { className: "flex items-center gap-3 mb-10 px-2 shrink-0", children: [_jsx("div", { className: "w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg", children: _jsx(LayoutDashboard, { size: 24 }) }), _jsx("h1", { className: "text-xl font-bold text-slate-800 tracking-tight uppercase", children: "358 PRO" })] }), _jsx("nav", { className: "flex-1 space-y-1", children: navItems.map((item) => (_jsxs(Link, { to: item.path, onClick: () => setIsSidebarOpen(false), className: `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`, children: [_jsx(item.icon, { size: 20 }), _jsx("span", { className: "flex-1 text-sm font-bold uppercase tracking-tight", children: item.name }), item.badge && item.badge > 0 && _jsx("span", { className: "bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full", children: item.badge })] }, item.path))) })] }) }), _jsx("main", { className: "flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 overflow-x-hidden", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(ProductsPage, {}) }), _jsx(Route, { path: "/cart", element: _jsx(CartPage, {}) }), _jsx(Route, { path: "/history", element: _jsx(HistoryPage, {}) }), _jsx(Route, { path: "/clients", element: _jsx(ClientsPage, {}) }), _jsx(Route, { path: "/cashier", element: _jsx(CashierPage, {}) }), _jsx(Route, { path: "/inventory", element: _jsx(InventoryPage, {}) }), _jsx(Route, { path: "/suppliers", element: _jsx(SuppliersPage, {}) }), _jsx(Route, { path: "/reconciliation", element: _jsx(ReconciliationPage, {}) })] }) })] }) }));
};
export default App;
