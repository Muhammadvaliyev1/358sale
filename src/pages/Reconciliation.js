import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { FileText, TrendingUp, TrendingDown, ArrowRightLeft, Banknote, CreditCard, ShieldAlert, Users, UsersRound, Calendar, Search } from 'lucide-react';
import { useApp } from '../App';
// Константы, которые реально используются в коде
import { PaymentMethod } from '../services/types';
const ReconciliationPage = () => {
    const { clients, sales, payments, suppliers, supplierPayments, supplierTransactions } = useApp();
    const [activeTab, setActiveTab] = useState('clients');
    const [selectedId, setSelectedId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const formatPrice = (price) => price.toLocaleString('ru-RU');
    const getMethodIcon = (method) => {
        switch (method) {
            case PaymentMethod.CASH: return _jsx(Banknote, { size: 14 });
            case PaymentMethod.CARD: return _jsx(CreditCard, { size: 14 });
            case PaymentMethod.TRANSFER: return _jsx(ArrowRightLeft, { size: 14 });
            case PaymentMethod.DEBT: return _jsx(ShieldAlert, { size: 14 });
            default: return null;
        }
    };
    const filteredEntities = useMemo(() => {
        const list = activeTab === 'clients' ? clients : suppliers;
        return list.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [activeTab, clients, suppliers, searchTerm]);
    const currentSelection = useMemo(() => {
        return activeTab === 'clients'
            ? clients.find(c => c.id === selectedId)
            : suppliers.find(s => s.id === selectedId);
    }, [activeTab, selectedId, clients, suppliers]);
    const history = useMemo(() => {
        if (!selectedId)
            return [];
        let combined = [];
        if (activeTab === 'clients') {
            const clientSales = sales.filter(s => s.clientId === selectedId).map(s => ({
                id: s.id,
                date: s.date,
                type: 'sale',
                plus: s.total,
                minus: 0,
                description: `Продажа: Чек #${s.id}`,
                method: s.paymentMethod
            }));
            const clientPays = payments.filter(p => p.clientId === selectedId).map(p => ({
                id: p.id,
                date: p.date,
                type: 'payment',
                plus: 0,
                minus: p.amount,
                description: `Оплата долга: ${p.note || 'б/н'}`,
                method: p.method
            }));
            combined = [...clientSales, ...clientPays];
        }
        else {
            const txs = supplierTransactions.filter(t => t.supplierId === selectedId).map(t => ({
                id: t.id,
                date: t.date,
                type: 'supply',
                plus: t.amount,
                minus: 0,
                description: t.description,
                method: PaymentMethod.DEBT
            }));
            const pays = supplierPayments.filter(p => p.supplierId === selectedId).map(p => ({
                id: p.id,
                date: p.date,
                type: 'payment',
                plus: 0,
                minus: p.amount,
                description: `Выплата поставщику: ${p.note || 'б/н'}`,
                method: p.method
            }));
            combined = [...txs, ...pays];
        }
        // ВАЖНО: Сортируем от САМЫХ СТАРЫХ к НОВЫМ для накопления баланса
        const sortedChronological = combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let runningBalance = 0;
        const historyWithBalance = sortedChronological.map(t => {
            // Для клиентов и поставщиков логика "плюс/минус" в сверке одинаковая:
            // Начисление (+) увеличивает долг, Оплата (-) уменьшает долг.
            runningBalance += t.plus;
            runningBalance -= t.minus;
            return { ...t, balanceAfter: runningBalance };
        });
        // Возвращаем НОВЫЕ СВЕРХУ для таблицы
        return historyWithBalance.reverse();
    }, [activeTab, selectedId, sales, payments, supplierTransactions, supplierPayments]);
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedId('');
        setSearchTerm('');
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-black text-slate-800 uppercase tracking-tight", children: "\u0421\u0432\u0435\u0440\u043A\u0430 \u0432\u0437\u0430\u0438\u043C\u043E\u0440\u0430\u0441\u0447\u0435\u0442\u043E\u0432" }), _jsx("p", { className: "text-slate-500 text-sm font-medium", children: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0434\u043E\u043B\u0433\u043E\u0432 \u0438 \u043F\u043B\u0430\u0442\u0435\u0436\u0435\u0439 \u0432 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C \u0432\u0440\u0435\u043C\u0435\u043D\u0438." })] }), _jsxs("div", { className: "flex p-1 bg-slate-200 rounded-2xl", children: [_jsxs("button", { onClick: () => handleTabChange('clients'), className: `flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'clients' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`, children: [_jsx(Users, { size: 16 }), " \u041A\u043B\u0438\u0435\u043D\u0442\u044B"] }), _jsxs("button", { onClick: () => handleTabChange('suppliers'), className: `flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'suppliers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`, children: [_jsx(UsersRound, { size: 16 }), " \u041F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0438"] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row gap-6 items-end shadow-sm", children: [_jsxs("div", { className: "flex-1 w-full space-y-2", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "\u041F\u043E\u0438\u0441\u043A \u0438 \u0432\u044B\u0431\u043E\u0440 \u043A\u043E\u043D\u0442\u0440\u0430\u0433\u0435\u043D\u0442\u0430" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", size: 16 }), _jsx("input", { type: "text", placeholder: `Найти в списке...`, value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 text-slate-900 font-bold text-sm" })] }), _jsx("div", { className: "relative flex-1", children: _jsxs("select", { value: selectedId, onChange: (e) => setSelectedId(e.target.value), className: "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 text-slate-900 font-bold text-sm appearance-none", children: [_jsx("option", { value: "", children: "-- \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430 --" }), filteredEntities.map(item => (_jsx("option", { value: item.id, children: item.name }, item.id)))] }) })] })] }), selectedId && currentSelection && (_jsxs("div", { className: "px-8 py-3 bg-slate-900 rounded-2xl min-w-[240px] text-center w-full md:w-auto shadow-xl", children: [_jsx("p", { className: "text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1", children: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0438\u0442\u043E\u0433" }), _jsxs("p", { className: `text-2xl font-black text-white`, children: [formatPrice(currentSelection.debt ?? currentSelection.balance ?? 0), " ", _jsx("span", { className: "text-sm font-medium", children: "\u0441\u0443\u043C" })] })] }))] }), !selectedId ? (_jsxs("div", { className: "bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100", children: [_jsx("div", { className: "w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200", children: _jsx(FileText, { size: 40 }) }), _jsx("p", { className: "text-slate-400 font-black uppercase tracking-widest text-sm", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0431\u044A\u0435\u043A\u0442 \u0434\u043B\u044F \u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u043E\u0442\u0447\u0435\u0442\u0430" })] })) : (_jsx("div", { className: "bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-slate-50 border-b border-slate-200", children: [_jsx("th", { className: "px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest", children: "\u0414\u0430\u0442\u0430 / \u0412\u0440\u0435\u043C\u044F" }), _jsx("th", { className: "px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest", children: "\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u044F" }), _jsx("th", { className: "px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right", children: "\u041D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u043E (+)" }), _jsx("th", { className: "px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right", children: "\u041E\u043F\u043B\u0430\u0447\u0435\u043D\u043E (-)" }), _jsx("th", { className: "px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right bg-indigo-50/50", children: "\u0414\u043E\u043B\u0433 \u043D\u0430 \u043C\u043E\u043C\u0435\u043D\u0442" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: history.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-6 py-16 text-center text-slate-400 font-bold uppercase tracking-widest", children: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439 \u043F\u0443\u0441\u0442\u0430" }) })) : (history.map(t => (_jsxs("tr", { className: "hover:bg-slate-50/50 transition-colors group", children: [_jsx("td", { className: "px-6 py-5", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-500 font-bold text-xs", children: [_jsx(Calendar, { size: 14, className: "text-slate-300" }), new Date(t.date).toLocaleString('ru-RU')] }) }), _jsx("td", { className: "px-6 py-5", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-xl ${t.type === 'payment' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`, children: t.type === 'payment' ? _jsx(TrendingDown, { size: 14 }) : _jsx(TrendingUp, { size: 14 }) }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-black text-slate-800 text-xs uppercase tracking-tight", children: t.description }), _jsxs("span", { className: "text-[9px] flex items-center gap-1 text-slate-400 font-black uppercase tracking-widest", children: [getMethodIcon(t.method), " ", t.method] })] })] }) }), _jsx("td", { className: "px-6 py-5 text-right font-black text-rose-600 text-sm", children: t.plus > 0 ? `+${formatPrice(t.plus)}` : '' }), _jsx("td", { className: "px-6 py-5 text-right font-black text-emerald-600 text-sm", children: t.minus > 0 ? `-${formatPrice(t.minus)}` : '' }), _jsx("td", { className: `px-6 py-5 text-right font-black text-sm bg-indigo-50/20 group-hover:bg-indigo-50 transition-colors ${t.balanceAfter > 0 ? 'text-rose-700' : 'text-emerald-700'}`, children: formatPrice(t.balanceAfter) })] }, t.id)))) })] }) }) }))] }));
};
export default ReconciliationPage;
