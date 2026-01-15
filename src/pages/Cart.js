import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, Banknote, ArrowRightLeft, ShieldAlert, ShoppingCart as CartIcon, Tag, Search, PlusCircle } from 'lucide-react';
import { useApp } from '../App';
// Runtime-константы
import { PaymentMethod, ProductType } from '../services/types';
const CartPage = () => {
    const { cart, setCart, removeFromCart, clearCart, clients, setClients, setSales, setProducts } = useApp();
    const navigate = useNavigate();
    const [selectedClientId, setSelectedClientId] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const [discount, setDiscount] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    // Состояния для смешанной оплаты
    const [payCash, setPayCash] = useState('');
    const [payCard, setPayCard] = useState('');
    const [payTransfer, setPayTransfer] = useState('');
    const calculateItemTotal = (item) => {
        if (item.type === ProductType.BOXED) {
            return item.quantity * (item.weightPerBox || 1) * item.price;
        }
        return item.quantity * item.price;
    };
    const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const discountVal = parseFloat(discount) || 0;
    const total = Math.max(0, subtotal - discountVal);
    const totalPaid = (parseFloat(payCash) || 0) + (parseFloat(payCard) || 0) + (parseFloat(payTransfer) || 0);
    const remainingDebt = Math.max(0, total - totalPaid);
    const updateItem = (id, updates) => {
        setCart(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };
    const handleCheckout = () => {
        if (!cart.length || !selectedClientId) {
            alert('Выберите товары и клиента!');
            return;
        }
        setIsCheckingOut(true);
        setTimeout(() => {
            const client = clients.find(c => c.id === selectedClientId);
            const debtBefore = client.debt;
            const debtAfter = client.debt + remainingDebt;
            const newSale = {
                id: Math.random().toString(36).substr(2, 6).toUpperCase(),
                date: new Date().toISOString(),
                clientId: client.id,
                clientName: client.name,
                items: JSON.parse(JSON.stringify(cart)),
                total,
                discount: discountVal,
                amountPaid: totalPaid,
                paymentMethod: remainingDebt > 0 ? PaymentMethod.DEBT : PaymentMethod.CASH,
                debtBefore,
                debtAfter,
                // @ts-ignore
                splitPayments: {
                    cash: parseFloat(payCash) || 0,
                    card: parseFloat(payCard) || 0,
                    transfer: parseFloat(payTransfer) || 0,
                    debt: remainingDebt
                }
            };
            setSales(prev => [newSale, ...prev]);
            setClients(prev => prev.map(c => c.id === client.id ? { ...c, debt: debtAfter } : c));
            setProducts(prev => prev.map(p => {
                const cartItem = cart.find(ci => ci.id === p.id);
                if (cartItem) {
                    const newStock = p.stock - cartItem.quantity;
                    return { ...p, stock: Math.max(0, newStock) };
                }
                return p;
            }));
            clearCart();
            setIsCheckingOut(false);
            navigate('/history');
        }, 500);
    };
    const filteredClients = useMemo(() => {
        return clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch));
    }, [clients, clientSearch]);
    const formatPrice = (price) => price.toLocaleString('ru-RU');
    if (!cart.length) {
        return (_jsxs("div", { className: "h-[70vh] flex flex-col items-center justify-center", children: [_jsx(CartIcon, { size: 64, className: "text-slate-200 mb-4" }), _jsx("h2", { className: "text-2xl font-black text-slate-400 uppercase tracking-widest", children: "\u041A\u043E\u0440\u0437\u0438\u043D\u0430 \u043F\u0443\u0441\u0442\u0430" }), _jsx("button", { onClick: () => navigate('/'), className: "mt-6 px-10 py-4 bg-indigo-600 text-white rounded-3xl font-black shadow-xl shadow-indigo-100 uppercase tracking-widest hover:scale-105 transition-all", children: "\u0412 \u043A\u0430\u0442\u0430\u043B\u043E\u0433" })] }));
    }
    return (_jsxs("div", { className: "max-w-6xl mx-auto space-y-8 pb-20", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-3xl font-black text-black tracking-tight uppercase", children: "\u041E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430" }), _jsx("button", { onClick: clearCart, className: "text-rose-600 font-black text-xs uppercase hover:bg-rose-50 px-4 py-2 rounded-xl transition-all", children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u0441\u0451" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsx("div", { className: "bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm", children: _jsx("div", { className: "divide-y-2 divide-slate-50", children: cart.map(item => (_jsxs("div", { className: "p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-slate-50 transition-colors", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-black text-black text-lg uppercase mb-4", children: item.name }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] text-black font-black uppercase ml-1", children: "\u0426\u0435\u043D\u0430 \u0437\u0430 \u0435\u0434." }), _jsx("input", { type: "number", value: item.price, onChange: (e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 }), className: "w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl font-black text-black outline-none focus:border-indigo-600" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-[10px] text-black font-black uppercase ml-1", children: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E" }), _jsx("input", { type: "number", step: "0.01", value: item.quantity, onChange: (e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 }), className: "w-full px-4 py-3 bg-indigo-50 border-2 border-indigo-200 rounded-2xl font-black text-indigo-700 outline-none focus:border-indigo-600" })] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-[10px] text-slate-500 font-black uppercase tracking-widest", children: "\u0418\u0442\u043E\u0433 \u043F\u043E\u0437\u0438\u0446\u0438\u0438" }), _jsx("p", { className: "text-3xl font-black text-black tracking-tighter", children: formatPrice(calculateItemTotal(item)) }), _jsx("button", { onClick: () => removeFromCart(item.id), className: "mt-2 text-rose-500 hover:text-rose-700 transition-colors font-black text-xs uppercase", children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" })] })] }, item.id))) }) }), _jsx("div", { className: "bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl", children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-8", children: [_jsxs("div", { children: [_jsx("p", { className: "text-indigo-400 text-xs font-black uppercase tracking-widest mb-2", children: "\u041E\u0431\u0449\u0430\u044F \u0441\u0443\u043C\u043C\u0430" }), _jsxs("p", { className: "text-6xl font-black", children: [formatPrice(total), " ", _jsx("span", { className: "text-xl", children: "\u0441\u0443\u043C" })] })] }), _jsx("div", { className: "flex flex-col gap-2", children: _jsxs("div", { className: "flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10", children: [_jsx(Tag, { size: 20, className: "text-indigo-400" }), _jsx("input", { type: "number", value: discount, onChange: (e) => setDiscount(e.target.value), className: "bg-transparent border-none text-xl font-black text-white w-32 outline-none", placeholder: "\u0421\u043A\u0438\u0434\u043A\u0430" })] }) })] }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6", children: [_jsxs("h3", { className: "font-black text-black text-lg uppercase flex items-center gap-3", children: [_jsx(User, { className: "text-indigo-600", size: 24 }), " \u0412\u044B\u0431\u043E\u0440 \u043A\u043B\u0438\u0435\u043D\u0442\u0430"] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-black", size: 18 }), _jsx("input", { type: "text", placeholder: "\u041D\u0430\u0439\u0442\u0438...", value: clientSearch, onChange: (e) => setClientSearch(e.target.value), className: "w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-black text-black" })] }), _jsxs("select", { value: selectedClientId, onChange: (e) => setSelectedClientId(e.target.value), className: "w-full px-5 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl font-black text-black appearance-none outline-none focus:border-indigo-600", children: [_jsx("option", { value: "", children: "-- \u0412\u042B\u0411\u0415\u0420\u0418\u0422\u0415 \u041A\u041B\u0418\u0415\u041D\u0422\u0410 --" }), filteredClients.map(c => _jsxs("option", { value: c.id, className: "text-black", children: [c.name, " (", formatPrice(c.debt), ")"] }, c.id))] }), _jsxs("h3", { className: "font-black text-black text-lg uppercase flex items-center gap-3 pt-4 border-t-2 border-slate-50", children: [_jsx(PlusCircle, { size: 24, className: "text-emerald-600" }), " \u0421\u043C\u0435\u0448\u0430\u043D\u043D\u0430\u044F \u041E\u043F\u043B\u0430\u0442\u0430"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3 bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-100 focus-within:border-emerald-500 transition-all", children: [_jsx(Banknote, { className: "text-emerald-600" }), _jsx("input", { type: "number", placeholder: "\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0435", value: payCash, onChange: (e) => setPayCash(e.target.value), className: "bg-transparent w-full outline-none font-black text-black text-xl placeholder:text-emerald-300" })] }), _jsxs("div", { className: "flex items-center gap-3 bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 focus-within:border-blue-500 transition-all", children: [_jsx(CreditCard, { className: "text-blue-600" }), _jsx("input", { type: "number", placeholder: "\u041A\u0430\u0440\u0442\u0430", value: payCard, onChange: (e) => setPayCard(e.target.value), className: "bg-transparent w-full outline-none font-black text-black text-xl placeholder:text-blue-300" })] }), _jsxs("div", { className: "flex items-center gap-3 bg-violet-50 p-4 rounded-2xl border-2 border-violet-100 focus-within:border-violet-500 transition-all", children: [_jsx(ArrowRightLeft, { className: "text-violet-600" }), _jsx("input", { type: "number", placeholder: "\u041F\u0435\u0440\u0435\u0432\u043E\u0434", value: payTransfer, onChange: (e) => setPayTransfer(e.target.value), className: "bg-transparent w-full outline-none font-black text-black text-xl placeholder:text-violet-300" })] }), _jsxs("div", { className: "pt-4 border-t-2 border-slate-50 space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center text-black font-black text-sm uppercase", children: [_jsx("span", { children: "\u0412\u0441\u0435\u0433\u043E \u0432\u043D\u0435\u0441\u0435\u043D\u043E:" }), _jsx("span", { className: "text-emerald-600 font-black", children: formatPrice(totalPaid) })] }), _jsxs("div", { className: "flex justify-between items-center p-4 bg-rose-50 text-rose-700 rounded-2xl border-2 border-rose-100", children: [_jsxs("div", { className: "flex items-center gap-2 font-black text-xs uppercase", children: [_jsx(ShieldAlert, { size: 16 }), " \u041E\u0441\u0442\u0430\u0442\u043E\u043A \u0432 \u0434\u043E\u043B\u0433:"] }), _jsx("span", { className: "text-xl font-black", children: formatPrice(remainingDebt) })] })] })] })] }), _jsx("button", { disabled: isCheckingOut, onClick: handleCheckout, className: "w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[3rem] font-black text-2xl uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50", children: isCheckingOut ? 'ПРОДАЖА...' : 'ОФОРМИТЬ ЧЕК' })] })] })] }));
};
export default CartPage;
