import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Search, Plus, Phone, DollarSign, UserCircle, Edit3, X } from 'lucide-react';
import { useApp } from '../App';
// Runtime-константы (если будут нужны, можно добавить)
const ClientsPage = () => {
    const { clients, setClients, setSales } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [debtAction, setDebtAction] = useState('add');
    const [debtAmount, setDebtAmount] = useState('');
    const [newClient, setNewClient] = useState({ name: '', phone: '' });
    const [editingClient, setEditingClient] = useState({ id: '', name: '', phone: '' });
    const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm));
    const handleAddClient = (e) => {
        e.preventDefault();
        if (!newClient.name)
            return;
        const client = {
            id: Math.random().toString(36).substr(2, 9),
            name: newClient.name,
            phone: newClient.phone,
            debt: 0
        };
        setClients(prev => [...prev, client]);
        setNewClient({ name: '', phone: '' });
        setIsModalOpen(false);
    };
    const handleUpdateClient = (e) => {
        e.preventDefault();
        if (!editingClient.name)
            return;
        setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, name: editingClient.name, phone: editingClient.phone } : c));
        setSales(prev => prev.map(s => s.clientId === editingClient.id ? { ...s, clientName: editingClient.name } : s));
        setIsEditModalOpen(false);
    };
    const handleDebtAdjustment = (e) => {
        e.preventDefault();
        if (!selectedClient || !debtAmount)
            return;
        const amount = parseFloat(debtAmount);
        setClients(prev => prev.map(c => {
            if (c.id === selectedClient.id) {
                const newDebt = debtAction === 'add' ? c.debt + amount : Math.max(0, c.debt - amount);
                return { ...c, debt: newDebt };
            }
            return c;
        }));
        setIsDebtModalOpen(false);
        setDebtAmount('');
    };
    const formatPrice = (price) => price.toLocaleString('ru-RU');
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-black text-black uppercase tracking-tight", children: "\u041A\u043B\u0438\u0435\u043D\u0442\u044B" }), _jsx("p", { className: "text-black font-semibold text-lg", children: "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C \u0434\u043E\u043B\u0433\u043E\u0432 \u0438 \u043F\u043B\u0430\u0442\u0435\u0436\u0435\u0439." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("div", { className: "relative w-full sm:w-64", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-black", size: 18 }), _jsx("input", { type: "text", placeholder: "\u041F\u043E\u0438\u0441\u043A...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-3 bg-white border-2 border-black rounded-2xl focus:border-indigo-500 outline-none text-black font-black" })] }), _jsxs("button", { onClick: () => setIsModalOpen(true), className: "flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 shadow-xl transition-all uppercase text-xs tracking-widest", children: [_jsx(Plus, { size: 20 }), _jsx("span", { children: "\u041D\u043E\u0432\u044B\u0439 \u043A\u043B\u0438\u0435\u043D\u0442" })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: filteredClients.map(client => (_jsxs("div", { className: "bg-white p-8 rounded-[3rem] border-2 border-slate-200 hover:border-black shadow-lg hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden", children: [_jsxs("div", { className: "flex items-start justify-between mb-6", children: [_jsx("div", { className: "w-16 h-16 bg-black rounded-3xl flex items-center justify-center text-white", children: _jsx(UserCircle, { size: 40 }) }), _jsx("button", { onClick: () => {
                                        setEditingClient({ id: client.id, name: client.name, phone: client.phone });
                                        setIsEditModalOpen(true);
                                    }, className: "p-3 bg-slate-100 text-black hover:bg-indigo-600 hover:text-white rounded-2xl transition-all", children: _jsx(Edit3, { size: 24 }) })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "font-black text-black text-2xl uppercase leading-tight line-clamp-1", children: client.name }), _jsxs("p", { className: "flex items-center gap-2 text-black font-black mt-2 text-lg", children: [_jsx(Phone, { size: 18 }), client.phone || 'Нет номера'] })] }), _jsxs("div", { className: "bg-slate-900 p-6 rounded-[2rem] mb-8 flex items-center justify-between text-white", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1", children: "\u041E\u0431\u0449\u0438\u0439 \u0434\u043E\u043B\u0433" }), _jsxs("p", { className: `text-2xl font-black ${client.debt > 0 ? 'text-rose-400' : 'text-emerald-400'}`, children: [formatPrice(client.debt), " \u0441\u0443\u043C"] })] }), _jsx(DollarSign, { size: 32, className: "opacity-50" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-auto", children: [_jsx("button", { onClick: () => { setSelectedClient(client); setDebtAction('add'); setIsDebtModalOpen(true); }, className: "py-5 bg-rose-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all", children: "+ \u0414\u043E\u043B\u0433" }), _jsx("button", { onClick: () => { setSelectedClient(client); setDebtAction('sub'); setIsDebtModalOpen(true); }, className: "py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all", children: "- \u041E\u043F\u043B\u0430\u0442\u0430" })] })] }, client.id))) }), isEditModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md", children: _jsxs("div", { className: "bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative border-4 border-indigo-600", children: [_jsx("button", { onClick: () => setIsEditModalOpen(false), className: "absolute top-8 right-8 p-2 text-black hover:bg-slate-100 rounded-full transition-all", children: _jsx(X, { size: 32 }) }), _jsx("h3", { className: "text-2xl font-black text-black mb-8 uppercase", children: "\u0414\u0430\u043D\u043D\u044B\u0435 \u043A\u043B\u0438\u0435\u043D\u0442\u0430" }), _jsxs("form", { onSubmit: handleUpdateClient, className: "space-y-6", children: [_jsx("input", { required: true, type: "text", value: editingClient.name, onChange: (e) => setEditingClient({ ...editingClient, name: e.target.value }), className: "w-full px-6 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl font-black text-black outline-none focus:border-indigo-600" }), _jsx("input", { type: "text", value: editingClient.phone, onChange: (e) => setEditingClient({ ...editingClient, phone: e.target.value }), className: "w-full px-6 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl font-black text-black outline-none focus:border-indigo-600" }), _jsx("button", { type: "submit", className: "w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl", children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" })] })] }) })), isModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md", children: _jsxs("div", { className: "bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative border-4 border-indigo-600", children: [_jsx("button", { onClick: () => setIsModalOpen(false), className: "absolute top-8 right-8 p-2 text-black hover:bg-slate-100 rounded-full transition-all", children: _jsx(X, { size: 32 }) }), _jsx("h3", { className: "text-2xl font-black text-black mb-8 uppercase", children: "\u041D\u043E\u0432\u044B\u0439 \u043A\u043B\u0438\u0435\u043D\u0442" }), _jsxs("form", { onSubmit: handleAddClient, className: "space-y-6", children: [_jsx("input", { required: true, type: "text", placeholder: "\u0418\u043C\u044F / \u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", value: newClient.name, onChange: (e) => setNewClient({ ...newClient, name: e.target.value }), className: "w-full px-6 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl font-black text-black outline-none focus:border-indigo-600" }), _jsx("input", { type: "text", placeholder: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D", value: newClient.phone, onChange: (e) => setNewClient({ ...newClient, phone: e.target.value }), className: "w-full px-6 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl font-black text-black outline-none focus:border-indigo-600" }), _jsx("button", { type: "submit", className: "w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl", children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C" })] })] }) })), isDebtModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md", children: _jsxs("div", { className: "bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl border-4 border-indigo-600", children: [_jsx("h3", { className: "text-2xl font-black text-black mb-2 uppercase", children: debtAction === 'add' ? 'Начислить долг' : 'Оплата долга' }), _jsxs("p", { className: "text-black font-bold mb-8 uppercase text-xs tracking-widest", children: ["\u041A\u043B\u0438\u0435\u043D\u0442: ", _jsx("span", { className: "text-indigo-600", children: selectedClient?.name })] }), _jsxs("form", { onSubmit: handleDebtAdjustment, className: "space-y-6", children: [_jsx("input", { required: true, autoFocus: true, type: "number", placeholder: "0", value: debtAmount, onChange: (e) => setDebtAmount(e.target.value), className: "w-full px-6 py-8 bg-slate-50 border-4 border-indigo-100 rounded-[2rem] text-5xl font-black text-black text-center outline-none focus:border-indigo-600" }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { type: "button", onClick: () => setIsDebtModalOpen(false), className: "flex-1 py-5 border-2 border-slate-300 rounded-2xl font-black text-black uppercase", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx("button", { type: "submit", className: `flex-1 py-5 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl ${debtAction === 'add' ? 'bg-rose-600' : 'bg-emerald-600'}`, children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C" })] })] })] }) }))] }));
};
export default ClientsPage;
