import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { FileSpreadsheet, Truck, ArrowRightLeft, Banknote, CreditCard, ShieldAlert } from 'lucide-react';
import { useApp } from '../App';
// Импортируем **константу** PaymentMethod для использования на рантайме
import { PaymentMethod } from '../services/types';
const SupplierReconciliationPage = () => {
    const { suppliers, supplierPayments, supplierTransactions, setSupplierPayments, setSuppliers } = useApp();
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [newPayment, setNewPayment] = useState({
        amount: '',
        method: PaymentMethod.CASH,
        note: ''
    });
    const supplier = useMemo(() => suppliers.find(s => s.id === selectedSupplierId), [suppliers, selectedSupplierId]);
    const transactions = useMemo(() => {
        if (!selectedSupplierId)
            return [];
        const txs = supplierTransactions.filter(t => t.supplierId === selectedSupplierId);
        const payments = supplierPayments
            .filter(p => p.supplierId === selectedSupplierId)
            .map(p => ({
            id: p.id,
            date: p.date,
            type: 'payment',
            amount: p.amount,
            description: `Выплата: ${p.note || 'Без примечания'}`,
            method: p.method
        }));
        const combined = [...txs, ...payments];
        return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedSupplierId, supplierTransactions, supplierPayments]);
    const handleAddPayment = (e) => {
        e.preventDefault();
        if (!selectedSupplierId || !newPayment.amount)
            return;
        const amount = parseFloat(newPayment.amount);
        const payment = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            supplierId: selectedSupplierId,
            amount,
            method: newPayment.method,
            note: newPayment.note
        };
        setSupplierPayments(prev => [payment, ...prev]);
        setSuppliers(prev => prev.map(s => (s.id === selectedSupplierId ? { ...s, balance: Math.max(0, s.balance - amount) } : s)));
        setNewPayment({ amount: '', method: PaymentMethod.CASH, note: '' });
        setIsPaymentModalOpen(false);
    };
    const formatPrice = (price) => price.toLocaleString('ru-RU');
    const getMethodIcon = (method) => {
        switch (method) {
            case PaymentMethod.CASH:
                return _jsx(Banknote, { size: 14, className: "inline mr-1 text-rose-600" });
            case PaymentMethod.CARD:
                return _jsx(CreditCard, { size: 14, className: "inline mr-1 text-rose-600" });
            case PaymentMethod.TRANSFER:
                return _jsx(ArrowRightLeft, { size: 14, className: "inline mr-1 text-rose-600" });
            case PaymentMethod.DEBT:
                return _jsx(ShieldAlert, { size: 14, className: "inline mr-1 text-rose-600" });
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-800", children: "\u0421\u0432\u0435\u0440\u043A\u0430 \u0441 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430\u043C\u0438" }), _jsx("p", { className: "text-slate-500 text-sm", children: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0437\u0430\u043A\u0443\u043F\u043E\u043A \u0438 \u043E\u043F\u043B\u0430\u0442 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430\u043C." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("div", { className: "relative w-full sm:w-64", children: [_jsx(Truck, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", size: 18 }), _jsxs("select", { value: selectedSupplierId, onChange: e => setSelectedSupplierId(e.target.value), className: "w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none", children: [_jsx("option", { value: "", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430" }), suppliers.map(s => (_jsx("option", { value: s.id, children: s.name }, s.id)))] })] }), selectedSupplierId && (_jsx("button", { onClick: () => setIsPaymentModalOpen(true), className: "bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg", children: "\u0412\u044B\u043F\u043B\u0430\u0442\u0438\u0442\u044C \u0434\u043E\u043B\u0433" }))] })] }), !selectedSupplierId ? (_jsxs("div", { className: "bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed", children: [_jsx(FileSpreadsheet, { size: 48, className: "mx-auto text-slate-200 mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-slate-400", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430 \u0434\u043B\u044F \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0430 \u0441\u0432\u0435\u0440\u043A\u0438" })] })) : (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-3xl border border-slate-200", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase mb-1", children: "\u041D\u0430\u0448 \u0434\u043E\u043B\u0433 (\u0411\u0430\u043B\u0430\u043D\u0441)" }), _jsxs("h3", { className: "text-2xl font-black text-rose-600", children: [formatPrice(supplier?.balance || 0), " \u0441\u0443\u043C"] })] }), _jsxs("div", { className: "bg-white p-6 rounded-3xl border border-slate-200", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase mb-1", children: "\u0412\u0441\u0435\u0433\u043E \u043F\u0440\u0438\u043D\u044F\u0442\u043E \u0442\u043E\u0432\u0430\u0440\u043E\u0432" }), _jsxs("h3", { className: "text-2xl font-black text-slate-800", children: [formatPrice(transactions.filter(t => t.type === 'supply').reduce((sum, t) => sum + t.amount, 0)), " \u0441\u0443\u043C"] })] }), _jsxs("div", { className: "bg-white p-6 rounded-3xl border border-slate-200", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase mb-1", children: "\u0412\u0441\u0435\u0433\u043E \u0432\u044B\u043F\u043B\u0430\u0447\u0435\u043D\u043E" }), _jsxs("h3", { className: "text-2xl font-black text-emerald-600", children: [formatPrice(transactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0)), " \u0441\u0443\u043C"] })] })] }), _jsx("div", { className: "bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-slate-50 border-b border-slate-200", children: [_jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-500 uppercase", children: "\u0414\u0430\u0442\u0430" }), _jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-500 uppercase", children: "\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u044F" }), _jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right", children: "\u041D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u043E (Supply)" }), _jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right", children: "\u0412\u044B\u043F\u043B\u0430\u0447\u0435\u043D\u043E (Payment)" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: transactions.map(t => (_jsxs("tr", { className: "hover:bg-slate-50 transition-colors", children: [_jsx("td", { className: "px-6 py-4 text-xs text-slate-500", children: new Date(t.date).toLocaleString() }), _jsx("td", { className: "px-6 py-4 font-semibold text-slate-800 text-sm", children: t.type === 'payment' && 'method' in t ? (_jsxs(_Fragment, { children: [getMethodIcon(t.method), " ", t.description] })) : (t.description) }), _jsx("td", { className: "px-6 py-4 text-right font-bold text-rose-600 text-sm", children: t.type === 'supply' ? formatPrice(t.amount) : '' }), _jsx("td", { className: "px-6 py-4 text-right font-bold text-emerald-600 text-sm", children: t.type === 'payment' ? formatPrice(t.amount) : '' })] }, t.id))) })] }) }) })] })), isPaymentModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm", children: _jsxs("div", { className: "bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl", children: [_jsx("h3", { className: "text-2xl font-bold text-slate-800 mb-6", children: "\u0412\u044B\u043F\u043B\u0430\u0442\u0430 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0443" }), _jsxs("form", { onSubmit: handleAddPayment, className: "space-y-4", children: [_jsx("input", { required: true, type: "number", placeholder: "\u0421\u0443\u043C\u043C\u0430 \u043E\u043F\u043B\u0430\u0442\u044B (\u0441\u0443\u043C)", value: newPayment.amount, onChange: e => setNewPayment({ ...newPayment, amount: e.target.value }), className: "w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" }), _jsxs("select", { value: newPayment.method, onChange: e => setNewPayment({ ...newPayment, method: e.target.value }), className: "w-full px-4 py-3 bg-slate-50 border rounded-xl", children: [_jsx("option", { value: PaymentMethod.CASH, children: "\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0435" }), _jsx("option", { value: PaymentMethod.CARD, children: "\u0422\u0435\u0440\u043C\u0438\u043D\u0430\u043B" }), _jsx("option", { value: PaymentMethod.TRANSFER, children: "\u041F\u0435\u0440\u0435\u0432\u043E\u0434" }), _jsx("option", { value: PaymentMethod.DEBT, children: "\u0414\u043E\u043B\u0433" })] }), _jsx("input", { type: "text", placeholder: "\u041F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0435", value: newPayment.note, onChange: e => setNewPayment({ ...newPayment, note: e.target.value }), className: "w-full px-4 py-3 bg-slate-50 border rounded-xl" }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: () => setIsPaymentModalOpen(false), className: "flex-1 py-3 rounded-xl border", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx("button", { type: "submit", className: "flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold", children: "\u0412\u044B\u043F\u043B\u0430\u0442\u0438\u0442\u044C" })] })] })] }) }))] }));
};
export default SupplierReconciliationPage;
