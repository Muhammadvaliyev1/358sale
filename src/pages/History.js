import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Search, Printer, RotateCcw, Edit3, X, Trash2, Plus, Save, Banknote } from 'lucide-react';
import { useApp } from '../App';
// Runtime-константы
import { ProductType } from '../services/types';
const HistoryPage = () => {
    const { sales, setSales, setProducts, setClients, products } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    // Состояния для полноценного редактирования
    const [editingSale, setEditingSale] = useState(null);
    const [editProductSearch, setEditProductSearch] = useState('');
    const formatPrice = (price) => price.toLocaleString('ru-RU');
    const printReceipt = (sale) => {
        const printWindow = window.open('', '_blank', 'width=450,height=800');
        if (!printWindow)
            return;
        // @ts-ignore
        const split = sale.splitPayments || { cash: sale.amountPaid, card: 0, transfer: 0, debt: sale.total - sale.amountPaid };
        const itemsHtml = sale.items.map(item => {
            const isBoxed = item.type === ProductType.BOXED;
            const weight = item.weightPerBox || 1;
            const lineTotal = isBoxed ? (item.quantity * weight * item.price) : (item.quantity * item.price);
            const formula = isBoxed ? `${item.quantity} * ${weight} * ${item.price}` : `${item.quantity} * ${item.price}`;
            return `
        <div style="margin-bottom: 12px; border-bottom: 2px dashed #000; padding-bottom: 8px;">
          <div style="font-size: 22px; font-weight: 900; text-transform: uppercase; color: #000;">${item.name}</div>
          <div style="font-size: 18px; font-weight: bold; color: #000;">${formula}</div>
          <div style="text-align: right; font-size: 24px; font-weight: 900; color: #000;">= ${formatPrice(lineTotal)}</div>
        </div>`;
        }).join('');
        printWindow.document.write(`
      <html>
        <head>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; color: #000; background: #fff; } 
            .bold { font-weight: 900; } 
            .hr { border-top: 4px solid #000; margin: 15px 0; } 
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 18px; color: #000; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div style="text-align: center;">
            <h1 style="margin:0; font-size: 64px; font-weight: 900; color: #000;">358</h1>
            <div style="font-size: 16px; font-weight: 900; margin-top: 5px; color: #000;">
              +998906226000 | +998916026000<br/>+998900093199 | +998901193199
            </div>
          </div>
          <div class="hr"></div>
          <div style="font-size: 18px; font-weight: 900; color: #000;">ДАТА: ${new Date(sale.date).toLocaleString('ru-RU')}</div>
          <div style="font-size: 18px; font-weight: 900; color: #000;">КЛИЕНТ: <span class="bold uppercase">${sale.clientName}</span></div>
          <div class="hr"></div>
          ${itemsHtml}
          <div class="hr"></div>
          <div class="row bold" style="font-size: 30px; color: #000;"><span>ИТОГ:</span><span>${formatPrice(sale.total)}</span></div>
          <div class="hr"></div>
          <div class="bold" style="font-size: 18px; margin-bottom: 10px; text-decoration: underline; color: #000;">ОПЛАТА:</div>
          <div class="row" style="font-weight: 900;"><span>ВНЕСЕНО:</span><span>${formatPrice(sale.amountPaid)}</span></div>
          <div class="row bold" style="color: #000;"><span>ДОЛГ ДО:</span><span>${formatPrice(sale.debtBefore || 0)}</span></div>
          <div class="row bold" style="color: #000;"><span>ДОЛГ ПОСЛЕ:</span><span>${formatPrice(sale.debtAfter || 0)}</span></div>
          <div class="hr"></div>
          <div style="text-align: center; font-weight: 900; font-size: 22px; margin-top: 30px; color: #000;">СПАСИБО ЗА ПОКУПКУ!</div>
        </body>
      </html>`);
        printWindow.document.close();
    };
    const handleReturn = (sale) => {
        if (!confirm('Отменить чек полностью? Товары вернутся на склад.'))
            return;
        setProducts(prev => prev.map(p => {
            const sold = sale.items.find(si => si.id === p.id);
            return sold ? { ...p, stock: p.stock + sold.quantity } : p;
        }));
        const debtToReduce = sale.total - sale.amountPaid;
        setClients(prev => prev.map(c => c.id === sale.clientId ? { ...c, debt: Math.max(0, c.debt - debtToReduce) } : c));
        setSales(prev => prev.filter(s => s.id !== sale.id));
    };
    const saveEditedSale = () => {
        if (!editingSale)
            return;
        const originalSale = sales.find(s => s.id === editingSale.id);
        if (!originalSale)
            return;
        const newTotal = editingSale.items.reduce((sum, item) => {
            const weight = item.weightPerBox || 1;
            return sum + (item.type === ProductType.BOXED ? item.quantity * weight * item.price : item.quantity * item.price);
        }, 0) - (editingSale.discount || 0);
        // Разница в долге вычисляется как (Новый остаток к оплате) - (Старый остаток к оплате)
        const oldUnpaid = originalSale.total - originalSale.amountPaid;
        const newUnpaid = newTotal - editingSale.amountPaid;
        const debtDiff = newUnpaid - oldUnpaid;
        setProducts(prev => {
            let updated = [...prev];
            originalSale.items.forEach(oldItem => {
                updated = updated.map(p => p.id === oldItem.id ? { ...p, stock: p.stock + oldItem.quantity } : p);
            });
            editingSale.items.forEach(newItem => {
                updated = updated.map(p => p.id === newItem.id ? { ...p, stock: Math.max(0, p.stock - newItem.quantity) } : p);
            });
            return updated;
        });
        setClients(prev => prev.map(c => c.id === editingSale.clientId ? { ...c, debt: Math.max(0, c.debt + debtDiff) } : c));
        const updatedSale = {
            ...editingSale,
            total: newTotal,
            debtAfter: (editingSale.debtBefore || 0) + (newTotal - editingSale.amountPaid)
        };
        setSales(prev => prev.map(s => s.id === editingSale.id ? updatedSale : s));
        setEditingSale(null);
        alert('Чек и сумма оплаты успешно обновлены!');
    };
    const addProductToEdit = (p) => {
        if (!editingSale)
            return;
        const exists = editingSale.items.find(item => item.id === p.id);
        if (exists) {
            setEditingSale({
                ...editingSale,
                items: editingSale.items.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item)
            });
        }
        else {
            const newItem = { ...p, quantity: 1 };
            setEditingSale({ ...editingSale, items: [...editingSale.items, newItem] });
        }
        setEditProductSearch('');
    };
    const filteredSales = sales.filter(s => s.clientName.toLowerCase().includes(clientSearchTerm.toLowerCase()) &&
        s.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredEditProducts = products.filter(p => p.name.toLowerCase().includes(editProductSearch.toLowerCase())).slice(0, 5);
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between gap-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-black text-black uppercase tracking-tight", children: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u0440\u043E\u0434\u0430\u0436" }), _jsx("p", { className: "text-black font-black", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0447\u0435\u043A\u0430\u043C\u0438 \u0438 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u0438\u0440\u043E\u0432\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u043E\u0432." })] }), _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx("input", { type: "text", placeholder: "\uD83D\uDD0D \u041F\u043E\u0438\u0441\u043A \u043A\u043B\u0438\u0435\u043D\u0442\u0430...", value: clientSearchTerm, onChange: (e) => setClientSearchTerm(e.target.value), className: "px-5 py-3 border-2 border-slate-400 rounded-2xl font-black text-black outline-none focus:border-indigo-600 shadow-sm" }), _jsx("input", { type: "text", placeholder: "ID \u0447\u0435\u043A\u0430...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "px-5 py-3 border-2 border-slate-400 rounded-2xl font-black text-black outline-none focus:border-indigo-600 shadow-sm" })] })] }), _jsx("div", { className: "bg-white rounded-[2.5rem] border-2 border-slate-200 overflow-scroll shadow-2xl", children: _jsxs("table", { className: "w-full text-left", children: [_jsx("thead", { className: "bg-slate-900 text-white", children: _jsxs("tr", { children: [_jsx("th", { className: "p-6 text-xs font-black uppercase tracking-widest text-white", children: "\u0414\u0430\u0442\u0430 \u0438 \u0412\u0440\u0435\u043C\u044F" }), _jsx("th", { className: "p-6 text-xs font-black uppercase tracking-widest text-white", children: "\u041A\u043B\u0438\u0435\u043D\u0442" }), _jsx("th", { className: "p-6 text-xs font-black uppercase tracking-widest text-right text-white", children: "\u0418\u0442\u043E\u0433\u043E\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430" }), _jsx("th", { className: "p-6 text-xs font-black uppercase tracking-widest text-right text-white", children: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F" })] }) }), _jsx("tbody", { className: "divide-y-2 divide-slate-100", children: filteredSales.map(sale => (_jsxs(React.Fragment, { children: [_jsxs("tr", { className: "hover:bg-slate-50 transition-all cursor-pointer", onClick: () => setExpandedId(expandedId === sale.id ? null : sale.id), children: [_jsxs("td", { className: "p-6", children: [_jsxs("p", { className: "font-black text-black text-sm", children: [new Date(sale.date).toLocaleDateString(), " ", new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })] }), _jsxs("p", { className: "text-[10px] font-black text-indigo-600 uppercase", children: ["#", sale.id] })] }), _jsx("td", { className: "p-6 font-black text-black uppercase", children: sale.clientName }), _jsx("td", { className: "p-6 text-right font-black text-2xl text-black", children: formatPrice(sale.total) }), _jsx("td", { className: "p-6", children: _jsxs("div", { className: "flex justify-end gap-2", onClick: e => e.stopPropagation(), children: [_jsx("button", { onClick: () => setEditingSale(sale), className: "p-3 bg-white border-2 border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm", children: _jsx(Edit3, { size: 20 }) }), _jsx("button", { onClick: () => printReceipt(sale), className: "p-3 bg-white border-2 border-slate-300 text-black rounded-xl hover:bg-black hover:text-white transition-all shadow-sm", children: _jsx(Printer, { size: 20 }) }), _jsx("button", { onClick: () => handleReturn(sale), className: "p-3 bg-white border-2 border-rose-200 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm", children: _jsx(RotateCcw, { size: 20 }) })] }) })] }), expandedId === sale.id && (_jsx("tr", { className: "bg-indigo-50/30", children: _jsx("td", { colSpan: 4, className: "p-8", children: _jsxs("div", { className: "bg-white rounded-[2rem] p-8 border-2 border-indigo-100 shadow-inner", children: [_jsx("h4", { className: "font-black uppercase mb-6 text-indigo-600 text-xs tracking-widest border-b-2 border-indigo-50 pb-2", children: "\u0414\u0435\u0442\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u0441\u043E\u0441\u0442\u0430\u0432\u0430:" }), _jsx("div", { className: "space-y-3", children: sale.items.map((item, i) => (_jsxs("div", { className: "flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100", children: [_jsx("span", { className: "font-black text-black uppercase text-sm", children: item.name }), _jsxs("span", { className: "font-black text-black text-lg", children: [item.type === ProductType.BOXED ? `${item.quantity}*${item.weightPerBox}*${formatPrice(item.price)}` : `${item.quantity}*${formatPrice(item.price)}`, _jsxs("span", { className: "ml-2 text-indigo-600", children: ["= ", formatPrice(item.type === ProductType.BOXED ? item.quantity * (item.weightPerBox || 1) * item.price : item.quantity * item.price)] })] })] }, i))) }), _jsxs("div", { className: "mt-8 pt-6 border-t-4 border-double border-slate-200 flex flex-wrap justify-between items-center gap-6", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-[10px] font-black text-black uppercase", children: "\u0412\u0437\u0430\u0438\u043C\u043E\u0440\u0430\u0441\u0447\u0435\u0442\u044B" }), _jsxs("p", { className: "font-black text-black", children: ["\u0414\u041E\u041B\u0413 \u0414\u041E: ", formatPrice(sale.debtBefore || 0)] }), _jsxs("p", { className: "font-black text-rose-600 text-xl underline", children: ["\u0414\u041E\u041B\u0413 \u041F\u041E\u0421\u041B\u0415: ", formatPrice(sale.debtAfter || 0)] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-[10px] font-black text-black uppercase", children: "\u0412\u043D\u0435\u0441\u0435\u043D\u043E \u043E\u043F\u043B\u0430\u0442\u044B" }), _jsxs("p", { className: "text-3xl font-black text-black", children: [formatPrice(sale.amountPaid), " \u0441\u0443\u043C"] })] })] })] }) }) }))] }, sale.id))) })] }) }), editingSale && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl", children: _jsxs("div", { className: "bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border-4 border-indigo-600", children: [_jsxs("div", { className: "p-8 bg-slate-900 flex items-center justify-between", children: [_jsxs("h3", { className: "text-2xl font-black text-white uppercase tracking-tighter", children: ["\u0420\u0435\u0434\u0430\u043A\u0442\u043E\u0440 \u043F\u0440\u043E\u0434\u0430\u0436\u0438 #", editingSale.id] }), _jsx("button", { onClick: () => setEditingSale(null), className: "p-3 bg-white/10 text-white rounded-full hover:bg-rose-600 transition-all", children: _jsx(X, { size: 28 }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-8 space-y-6 text-black", children: [_jsxs("div", { className: "bg-indigo-50 p-6 rounded-[2rem] border-2 border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-4 bg-indigo-600 text-white rounded-2xl shadow-lg", children: _jsx(Banknote, { size: 32 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-black uppercase text-indigo-600 tracking-widest", children: "\u0412\u043D\u0435\u0441\u0435\u043D\u043E \u043E\u043F\u043B\u0430\u0442\u044B" }), _jsx("p", { className: "text-sm font-bold text-slate-500", children: "\u0421\u0443\u043C\u043C\u0430, \u043A\u043E\u0442\u043E\u0440\u0443\u044E \u043A\u043B\u0438\u0435\u043D\u0442 \u0443\u0436\u0435 \u043E\u043F\u043B\u0430\u0442\u0438\u043B \u043F\u043E \u044D\u0442\u043E\u043C\u0443 \u0447\u0435\u043A\u0443." })] })] }), _jsx("div", { className: "w-full md:w-64", children: _jsx("input", { type: "number", value: editingSale.amountPaid, onChange: (e) => setEditingSale({ ...editingSale, amountPaid: parseFloat(e.target.value) || 0 }), className: "w-full p-5 border-4 border-indigo-200 rounded-2xl font-black text-black text-center text-3xl focus:border-indigo-600 outline-none shadow-inner" }) })] }), _jsxs("div", { className: "relative", children: [_jsx("p", { className: "text-[10px] font-black uppercase text-black mb-2 ml-1", children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u043E\u0432\u0430\u0440 \u0432 \u0447\u0435\u043A" }), _jsx("div", { className: "flex gap-2", children: _jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400", size: 20 }), _jsx("input", { type: "text", placeholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044E...", value: editProductSearch, onChange: (e) => setEditProductSearch(e.target.value), className: "w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-black outline-none focus:border-indigo-600" })] }) }), editProductSearch && (_jsx("div", { className: "absolute z-50 w-full mt-2 bg-white border-2 border-indigo-100 rounded-3xl shadow-2xl divide-y-2 overflow-hidden", children: filteredEditProducts.map(p => (_jsxs("button", { onClick: () => addProductToEdit(p), className: "w-full p-5 text-left hover:bg-indigo-50 flex items-center justify-between group", children: [_jsx("span", { className: "font-black uppercase text-black", children: p.name }), _jsx(Plus, { className: "text-indigo-600 group-hover:scale-125 transition-transform" })] }, p.id))) }))] }), _jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-[10px] font-black uppercase text-black ml-1", children: "\u0421\u043E\u0441\u0442\u0430\u0432 \u0447\u0435\u043A\u0430 (\u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u0430 \u0438 \u0446\u0435\u043D\u044B)" }), _jsx("div", { className: "divide-y-2 border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm", children: editingSale.items.map((item, idx) => (_jsxs("div", { className: "p-5 flex flex-wrap items-center gap-4 bg-white hover:bg-slate-50", children: [_jsxs("div", { className: "flex-1 min-w-[200px]", children: [_jsx("span", { className: "font-black text-black uppercase text-sm block", children: item.name }), _jsx("span", { className: "text-[10px] font-black text-indigo-600 uppercase tracking-widest", children: item.type })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("label", { className: "block text-[9px] font-black uppercase text-black mb-1", children: "\u041A\u043E\u043B-\u0432\u043E" }), _jsx("input", { type: "number", step: "0.01", value: item.quantity, onChange: (e) => {
                                                                            const val = parseFloat(e.target.value) || 0;
                                                                            setEditingSale({ ...editingSale, items: editingSale.items.map((it, i) => i === idx ? { ...it, quantity: val } : it) });
                                                                        }, className: "w-24 p-3 border-2 border-slate-200 rounded-xl font-black text-black text-center focus:border-indigo-600 outline-none" })] }), _jsxs("div", { className: "text-center", children: [_jsx("label", { className: "block text-[9px] font-black uppercase text-black mb-1", children: "\u0426\u0435\u043D\u0430 \u043F\u0440\u043E\u0434\u0430\u0436\u0438" }), _jsx("input", { type: "number", value: item.price, onChange: (e) => {
                                                                            const val = parseFloat(e.target.value) || 0;
                                                                            setEditingSale({ ...editingSale, items: editingSale.items.map((it, i) => i === idx ? { ...it, price: val } : it) });
                                                                        }, className: "w-32 p-3 border-2 border-slate-200 rounded-xl font-black text-black text-center focus:border-indigo-600 outline-none" })] }), _jsx("button", { onClick: () => setEditingSale({ ...editingSale, items: editingSale.items.filter((_, i) => i !== idx) }), className: "p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all", children: _jsx(Trash2, { size: 20 }) })] })] }, idx))) })] })] }), _jsxs("div", { className: "p-8 bg-slate-100 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-6", children: [_jsxs("div", { className: "space-y-1 text-black", children: [_jsx("p", { className: "text-[10px] font-black text-black uppercase tracking-widest", children: "\u041F\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043D\u043D\u044B\u0439 \u0438\u0442\u043E\u0433" }), _jsxs("p", { className: "text-4xl font-black text-black", children: [formatPrice(editingSale.items.reduce((sum, i) => {
                                                    const weight = i.weightPerBox || 1;
                                                    return sum + (i.type === ProductType.BOXED ? i.quantity * weight * i.price : i.quantity * i.price);
                                                }, 0) - (editingSale.discount || 0)), " ", _jsx("span", { className: "text-xl", children: "\u0441\u0443\u043C" })] }), _jsxs("p", { className: "text-xs font-bold text-rose-600", children: ["\u041E\u0441\u0442\u0430\u0442\u043E\u043A \u0432 \u0434\u043E\u043B\u0433: ", formatPrice(Math.max(0, editingSale.items.reduce((sum, i) => {
                                                    const weight = i.weightPerBox || 1;
                                                    return sum + (i.type === ProductType.BOXED ? i.quantity * weight * i.price : i.quantity * i.price);
                                                }, 0) - (editingSale.discount || 0) - editingSale.amountPaid))] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => setEditingSale(null), className: "px-10 py-5 bg-white border-2 border-slate-300 text-black rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-50 transition-all", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsxs("button", { onClick: saveEditedSale, className: "px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 flex items-center gap-3 transition-all", children: [_jsx(Save, { size: 24 }), " \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C"] })] })] })] }) }))] }));
};
export default HistoryPage;
