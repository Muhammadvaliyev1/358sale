
import React, { useState } from 'react';
import { Search, Printer, RotateCcw, Edit3, X, Trash2, Plus, Save, Banknote } from 'lucide-react';
import { useApp } from '../App';

// Runtime-константы
import { ProductType } from '../services/types';

// Только типы
import type { Sale, Product, CartItem } from '../services/types';

const HistoryPage: React.FC = () => {
  const { sales, setSales, setProducts, setClients, products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Состояния для полноценного редактирования
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editProductSearch, setEditProductSearch] = useState('');

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  const printReceipt = (sale: Sale) => {
    const printWindow = window.open('', '_blank', 'width=450,height=800');
    if (!printWindow) return;

    // @ts-ignore
    const split = sale.splitPayments || { cash: sale.amountPaid, card: 0, transfer: 0, debt: sale.total - sale.amountPaid };

    const itemsHtml = sale.items.map(item => {
      const isBoxed = item.type === ProductType.BOXED;
      const weight = item.weight || 1;
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
            <div style="font-size: 20px; font-weight: 900; margin-top: 5px; color: #000;">
              +998906226000<br/>+998916026000<br/>+998901193199<br/>+998909126770<br/>
            </div>
          </div>
          <div class="hr"></div>
          <div style="font-size: 18px; font-weight: 900; color: #000;">ЧЕК: #${sale.id}</div>
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

  const handleReturn = (sale: Sale) => {
    if (!confirm('Отменить чек полностью? Товары вернутся на склад.')) return;
    setProducts(prev => prev.map(p => {
      const sold = sale.items.find(si => si.id === p.id);
      return sold ? { ...p, stock: p.stock + sold.quantity } : p;
    }));
    const debtToReduce = sale.total - sale.amountPaid;
    setClients(prev => prev.map(c => c.id === sale.clientId ? { ...c, debt: Math.max(0, c.debt - debtToReduce) } : c));
    setSales(prev => prev.filter(s => s.id !== sale.id));
  };

  const saveEditedSale = () => {
    if (!editingSale) return;

    const originalSale = sales.find(s => s.id === editingSale.id);
    if (!originalSale) return;

    const newTotal = editingSale.items.reduce((sum, item) => {
      const weight = item.weight || 1;
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

    setClients(prev => prev.map(c => 
      c.id === editingSale.clientId ? { ...c, debt: Math.max(0, c.debt + debtDiff) } : c
    ));

    const updatedSale = { 
      ...editingSale, 
      total: newTotal,
      debtAfter: (editingSale.debtBefore || 0) + (newTotal - editingSale.amountPaid)
    };

    setSales(prev => prev.map(s => s.id === editingSale.id ? updatedSale : s));
    setEditingSale(null);
    alert('Чек и сумма оплаты успешно обновлены!');
  };

  const addProductToEdit = (p: Product) => {
    if (!editingSale) return;
    const exists = editingSale.items.find(item => item.id === p.id);
    if (exists) {
      setEditingSale({
        ...editingSale,
        items: editingSale.items.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item)
      });
    } else {
      const newItem: CartItem = { ...p, quantity: 1 };
      setEditingSale({ ...editingSale, items: [...editingSale.items, newItem] });
    }
    setEditProductSearch('');
  };

  const filteredSales = sales.filter(s => 
    s.clientName.toLowerCase().includes(clientSearchTerm.toLowerCase()) &&
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEditProducts = products.filter(p => p.name.toLowerCase().includes(editProductSearch.toLowerCase())).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-black uppercase tracking-tight">История продаж</h2>
          <p className="text-black font-black">Управление чеками и корректировка заказов.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <input type="text" placeholder="🔍 Поиск клиента..." value={clientSearchTerm} onChange={(e) => setClientSearchTerm(e.target.value)} className="px-5 py-3 border-2 border-slate-400 rounded-2xl font-black text-black outline-none focus:border-indigo-600 shadow-sm" />
          <input type="text" placeholder="ID чека..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-5 py-3 border-2 border-slate-400 rounded-2xl font-black text-black outline-none focus:border-indigo-600 shadow-sm" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 overflow-scroll shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-6 text-xs font-black uppercase tracking-widest text-white">Дата и Время</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest text-white">Клиент</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest text-right text-white">Итоговая сумма</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest text-right text-white">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {filteredSales.map(sale => (
              <React.Fragment key={sale.id}>
                <tr className="hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}>
                  <td className="p-6">
                    <p className="font-black text-black text-sm">{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-[10px] font-black text-indigo-600 uppercase">#{sale.id}</p>
                  </td>
                  <td className="p-6 font-black text-black uppercase">{sale.clientName}</td>
                  <td className="p-6 text-right font-black text-2xl text-black">{formatPrice(sale.total)}</td>
                  <td className="p-6">
                    <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setEditingSale(sale)} className="p-3 bg-white border-2 border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Edit3 size={20}/></button>
                      <button onClick={() => printReceipt(sale)} className="p-3 bg-white border-2 border-slate-300 text-black rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"><Printer size={20}/></button>
                      <button onClick={() => handleReturn(sale)} className="p-3 bg-white border-2 border-rose-200 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><RotateCcw size={20}/></button>
                    </div>
                  </td>
                </tr>
                {expandedId === sale.id && (
                  <tr className="bg-indigo-50/30">
                    <td colSpan={4} className="p-8">
                       <div className="bg-white rounded-[2rem] p-8 border-2 border-indigo-100 shadow-inner">
                          <h4 className="font-black uppercase mb-6 text-indigo-600 text-xs tracking-widest border-b-2 border-indigo-50 pb-2">Детализация состава:</h4>
                          <div className="space-y-3">
                            {sale.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="font-black text-black uppercase text-sm">{item.name}</span>
                                <span className="font-black text-black text-lg">
                                  {item.type === ProductType.BOXED ? `${item.quantity}*${item.weight}*${formatPrice(item.price)}` : `${item.quantity}*${formatPrice(item.price)}`}
                                  <span className="ml-2 text-indigo-600">= {formatPrice(item.type === ProductType.BOXED ? item.quantity * (item.weight || 1) * item.price : item.quantity * item.price)}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-8 pt-6 border-t-4 border-double border-slate-200 flex flex-wrap justify-between items-center gap-6">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-black uppercase">Взаиморасчеты</p>
                               <p className="font-black text-black">ДОЛГ ДО: {formatPrice(sale.debtBefore || 0)}</p>
                               <p className="font-black text-rose-600 text-xl underline">ДОЛГ ПОСЛЕ: {formatPrice(sale.debtAfter || 0)}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black text-black uppercase">Внесено оплаты</p>
                               <p className="text-3xl font-black text-black">{formatPrice(sale.amountPaid)} сум</p>
                            </div>
                          </div>
                       </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border-4 border-indigo-600">
            <div className="p-8 bg-slate-900 flex items-center justify-between">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Редактор продажи #{editingSale.id}</h3>
               <button onClick={() => setEditingSale(null)} className="p-3 bg-white/10 text-white rounded-full hover:bg-rose-600 transition-all"><X size={28}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-black">
              {/* Сумма оплаты в редакторе */}
              <div className="bg-indigo-50 p-6 rounded-[2rem] border-2 border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg">
                    <Banknote size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Внесено оплаты</p>
                    <p className="text-sm font-bold text-slate-500">Сумма, которую клиент уже оплатил по этому чеку.</p>
                  </div>
                </div>
                <div className="w-full md:w-64">
                   <input 
                      type="number" 
                      value={editingSale.amountPaid} 
                      onChange={(e) => setEditingSale({...editingSale, amountPaid: parseFloat(e.target.value) || 0})}
                      className="w-full p-5 border-4 border-indigo-200 rounded-2xl font-black text-black text-center text-3xl focus:border-indigo-600 outline-none shadow-inner"
                    />
                </div>
              </div>

              <div className="relative">
                <p className="text-[10px] font-black uppercase text-black mb-2 ml-1">Добавить товар в чек</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Поиск по названию..." 
                      value={editProductSearch}
                      onChange={(e) => setEditProductSearch(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-black outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
                {editProductSearch && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-indigo-100 rounded-3xl shadow-2xl divide-y-2 overflow-hidden">
                    {filteredEditProducts.map(p => (
                      <button key={p.id} onClick={() => addProductToEdit(p)} className="w-full p-5 text-left hover:bg-indigo-50 flex items-center justify-between group">
                        <span className="font-black uppercase text-black">{p.name}</span>
                        <Plus className="text-indigo-600 group-hover:scale-125 transition-transform" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-black ml-1">Состав чека (изменение количества и цены)</p>
                <div className="divide-y-2 border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                  {editingSale.items.map((item, idx) => (
                    <div key={idx} className="p-5 flex flex-wrap items-center gap-4 bg-white hover:bg-slate-50">
                      <div className="flex-1 min-w-[200px]">
                        <span className="font-black text-black uppercase text-sm block">{item.name}</span>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <label className="block text-[9px] font-black uppercase text-black mb-1">Кол-во</label>
                          <input type="number" step="0.01" value={item.quantity} onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditingSale({...editingSale, items: editingSale.items.map((it, i) => i === idx ? {...it, quantity: val} : it)});
                          }} className="w-24 p-3 border-2 border-slate-200 rounded-xl font-black text-black text-center focus:border-indigo-600 outline-none"/>
                        </div>
                        <div className="text-center">
                          <label className="block text-[9px] font-black uppercase text-black mb-1">Цена продажи</label>
                          <input type="number" value={item.price} onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditingSale({...editingSale, items: editingSale.items.map((it, i) => i === idx ? {...it, price: val} : it)});
                          }} className="w-32 p-3 border-2 border-slate-200 rounded-xl font-black text-black text-center focus:border-indigo-600 outline-none"/>
                        </div>
                        <button onClick={() => setEditingSale({...editingSale, items: editingSale.items.filter((_, i) => i !== idx)})} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                          <Trash2 size={20}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-100 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-1 text-black">
                <p className="text-[10px] font-black text-black uppercase tracking-widest">Пересчитанный итог</p>
                <p className="text-4xl font-black text-black">
                  {formatPrice(editingSale.items.reduce((sum, i) => {
                    const weight = i.weight || 1;
                    return sum + (i.type === ProductType.BOXED ? i.quantity * weight * i.price : i.quantity * i.price);
                  }, 0) - (editingSale.discount || 0))} <span className="text-xl">сум</span>
                </p>
                <p className="text-xs font-bold text-rose-600">
                   Остаток в долг: {formatPrice(Math.max(0, editingSale.items.reduce((sum, i) => {
                    const weight = i.weight || 1;
                    return sum + (i.type === ProductType.BOXED ? i.quantity * weight * i.price : i.quantity * i.price);
                  }, 0) - (editingSale.discount || 0) - editingSale.amountPaid))}
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setEditingSale(null)} className="px-10 py-5 bg-white border-2 border-slate-300 text-black rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Отмена</button>
                <button onClick={saveEditedSale} className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 flex items-center gap-3 transition-all">
                  <Save size={24}/> Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
