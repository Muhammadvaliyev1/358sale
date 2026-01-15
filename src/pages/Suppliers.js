import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Phone, Plus, Search, Building2, Edit3, X } from 'lucide-react';
import { useApp } from '../App';
// Runtime-константы
import { PaymentMethod } from '../services/types';
const SuppliersPage = () => {
    const { suppliers, setSuppliers, setSupplierTransactions, setSupplierPayments } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [balanceAction, setBalanceAction] = useState('add');
    const [balanceAmount, setBalanceAmount] = useState('');
    const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', category: '' });
    const [editingSupplier, setEditingSupplier] = useState({ id: '', name: '', phone: '', category: '' });
    const formatPrice = (price) => price.toLocaleString('ru-RU');
    const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleAddSupplier = (e) => {
        e.preventDefault();
        if (!newSupplier.name)
            return;
        const supplier = {
            id: Math.random().toString(36).substr(2, 9),
            name: newSupplier.name,
            phone: newSupplier.phone,
            category: newSupplier.category,
            balance: 0
        };
        setSuppliers(prev => [...prev, supplier]);
        setNewSupplier({ name: '', phone: '', category: '' });
        setIsModalOpen(false);
    };
    const handleUpdateSupplier = (e) => {
        e.preventDefault();
        if (!editingSupplier.name)
            return;
        setSuppliers(prev => prev.map(s => s.id === editingSupplier.id
            ? { ...s, name: editingSupplier.name, phone: editingSupplier.phone, category: editingSupplier.category }
            : s));
        setIsEditModalOpen(false);
    };
    const handleBalanceAdjustment = (e) => {
        e.preventDefault();
        if (!selectedSupplier || !balanceAmount)
            return;
        const amount = parseFloat(balanceAmount);
        setSuppliers(prev => prev.map(s => s.id === selectedSupplier.id
            ? { ...s, balance: balanceAction === 'add' ? s.balance + amount : Math.max(0, s.balance - amount) }
            : s));
        if (balanceAction === 'add') {
            const tx = {
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString(),
                supplierId: selectedSupplier.id,
                amount,
                type: 'supply',
                description: 'Корректировка долга (+)'
            };
            setSupplierTransactions(prev => [tx, ...prev]);
        }
        else {
            const pay = {
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString(),
                supplierId: selectedSupplier.id,
                amount,
                method: PaymentMethod.CASH,
                note: 'Выплата долга (-)'
            };
            setSupplierPayments(prev => [pay, ...prev]);
        }
        setIsBalanceModalOpen(false);
        setBalanceAmount('');
        setSelectedSupplier(null);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-black text-slate-900 uppercase tracking-tight", children: "\u041F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0438" }), _jsx("p", { className: "text-slate-600 font-medium text-lg", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0432\u0437\u0430\u0438\u043C\u043E\u0440\u0430\u0441\u0447\u0435\u0442\u0430\u043C\u0438 \u0441 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u0430\u043C\u0438." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("div", { className: "relative w-full sm:w-64", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-500", size: 18 }), _jsx("input", { type: "text", placeholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-500" })] }), _jsxs("button", { onClick: () => setIsModalOpen(true), className: "bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 uppercase text-xs tracking-widest", children: [_jsx(Plus, { size: 18 }), " \u041D\u043E\u0432\u044B\u0439 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A"] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredSuppliers.map(supplier => (_jsxs("div", { className: "bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl transition-all group flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", { className: "w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600", children: _jsx(Building2, { size: 28 }) }), _jsx("button", { onClick: () => {
                                        setEditingSupplier({ id: supplier.id, name: supplier.name, phone: supplier.phone, category: supplier.category });
                                        setIsEditModalOpen(true);
                                    }, className: "p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all", children: _jsx(Edit3, { size: 20 }) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "font-black text-slate-900 text-xl uppercase leading-tight line-clamp-1", children: supplier.name }), _jsx("p", { className: "inline-block bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full mt-2 uppercase", children: supplier.category || 'Общее' }), _jsxs("div", { className: "text-slate-700 font-bold mt-2 flex items-center gap-2", children: [_jsx(Phone, { size: 14, className: "text-slate-400" }), " ", supplier.phone || '---'] })] }), _jsxs("div", { className: "bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6", children: [_jsx("p", { className: "text-[10px] font-black uppercase text-slate-500 tracking-widest", children: "\u041D\u0430\u0448 \u0434\u043E\u043B\u0433 \u043F\u0435\u0440\u0435\u0434 \u043D\u0438\u043C" }), _jsxs("p", { className: `text-2xl font-black ${supplier.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`, children: [formatPrice(supplier.balance), " \u0441\u0443\u043C"] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 mt-auto", children: [_jsx("button", { onClick: () => { setSelectedSupplier(supplier); setBalanceAction('add'); setIsBalanceModalOpen(true); }, className: "py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all", children: "+ \u041D\u0430\u0447\u0438\u0441\u043B\u0438\u0442\u044C" }), _jsx("button", { onClick: () => { setSelectedSupplier(supplier); setBalanceAction('sub'); setIsBalanceModalOpen(true); }, className: "py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all", children: "- \u0412\u044B\u043F\u043B\u0430\u0442\u0438\u0442\u044C" })] })] }, supplier.id))) }), isEditModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm", children: _jsxs("div", { className: "bg-white rounded-[3rem] w-full max-w-md p-8 md:p-10 shadow-2xl relative", children: [_jsx("button", { onClick: () => setIsEditModalOpen(false), className: "absolute top-8 right-8 p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all", children: _jsx(X, { size: 24 }) }), _jsx("h3", { className: "text-2xl font-black text-slate-900 mb-8 uppercase", children: "\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430" }), _jsxs("form", { onSubmit: handleUpdateSupplier, className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs font-black text-slate-700 uppercase ml-1", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0444\u0438\u0440\u043C\u044B" }), _jsx("input", { required: true, type: "text", value: editingSupplier.name, onChange: (e) => setEditingSupplier({ ...editingSupplier, name: e.target.value }), className: "w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-indigo-500 outline-none" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs font-black text-slate-700 uppercase ml-1", children: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" }), _jsx("input", { type: "text", value: editingSupplier.phone, onChange: (e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value }), className: "w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-indigo-500 outline-none" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs font-black text-slate-700 uppercase ml-1", children: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F" }), _jsx("input", { type: "text", value: editingSupplier.category, onChange: (e) => setEditingSupplier({ ...editingSupplier, category: e.target.value }), className: "w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-indigo-500 outline-none" })] })] }), _jsx("button", { type: "submit", className: "w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all", children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" })] })] }) })), isModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm", children: _jsxs("div", { className: "bg-white rounded-[3rem] w-full max-w-md p-8 md:p-10 shadow-2xl relative", children: [_jsx("button", { onClick: () => setIsModalOpen(false), className: "absolute top-8 right-8 p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all", children: _jsx(X, { size: 24 }) }), _jsx("h3", { className: "text-2xl font-black text-slate-900 mb-8 uppercase", children: "\u041D\u043E\u0432\u044B\u0439 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A" }), _jsxs("form", { onSubmit: handleAddSupplier, className: "space-y-4", children: [_jsx("input", { required: true, type: "text", placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u0438", value: newSupplier.name, onChange: (e) => setNewSupplier({ ...newSupplier, name: e.target.value }), className: "w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-500" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx("input", { type: "text", placeholder: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D", value: newSupplier.phone, onChange: (e) => setNewSupplier({ ...newSupplier, phone: e.target.value }), className: "w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-500" }), _jsx("input", { type: "text", placeholder: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F", value: newSupplier.category, onChange: (e) => setNewSupplier({ ...newSupplier, category: e.target.value }), className: "w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-500" })] }), _jsx("button", { type: "submit", className: "w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all", children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u0440\u043E\u0444\u0438\u043B\u044C" })] })] }) })), isBalanceModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm", children: _jsxs("div", { className: "bg-white rounded-[3rem] w-full max-w-md p-8 md:p-10 shadow-2xl", children: [_jsx("h3", { className: "text-2xl font-black text-slate-900 mb-2 uppercase", children: balanceAction === 'add' ? 'Начислить долг' : 'Выплатить долг' }), _jsxs("p", { className: "text-slate-600 font-bold mb-8", children: ["\u041F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A: ", _jsx("span", { className: "text-indigo-600", children: selectedSupplier?.name })] }), _jsxs("form", { onSubmit: handleBalanceAdjustment, className: "space-y-6", children: [_jsx("input", { required: true, autoFocus: true, type: "number", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0443\u043C\u043C\u0443...", value: balanceAmount, onChange: (e) => setBalanceAmount(e.target.value), className: "w-full px-6 py-6 bg-slate-50 border-2 border-rose-100 rounded-2xl text-3xl font-black text-slate-900 text-center outline-none focus:border-rose-500" }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { type: "button", onClick: () => setIsBalanceModalOpen(false), className: "flex-1 py-4 border-2 border-slate-200 rounded-2xl font-black text-slate-600 uppercase", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx("button", { type: "submit", className: `flex-1 py-4 rounded-2xl text-white font-black uppercase ${balanceAction === 'add' ? 'bg-rose-600' : 'bg-emerald-600'}`, children: "\u041E\u041A" })] })] })] }) }))] }));
};
export default SuppliersPage;
