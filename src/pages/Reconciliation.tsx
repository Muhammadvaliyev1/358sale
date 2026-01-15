
import React, { useState, useMemo } from 'react';
import { 
  FileText, TrendingUp, TrendingDown, ArrowRightLeft, 
  Banknote, CreditCard, ShieldAlert, Users, UsersRound, 
  Calendar, Search 
} from 'lucide-react';

import { useApp } from '../App';

// Константы, которые реально используются в коде
import { PaymentMethod } from '../services/types';

const ReconciliationPage: React.FC = () => {
  const { clients, sales, payments, suppliers, supplierPayments, supplierTransactions } = useApp();
  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers'>('clients');
  const [selectedId, setSelectedId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  const getMethodIcon = (method: PaymentMethod) => {
    switch(method) {
      case PaymentMethod.CASH: return <Banknote size={14} />;
      case PaymentMethod.CARD: return <CreditCard size={14} />;
      case PaymentMethod.TRANSFER: return <ArrowRightLeft size={14} />;
      case PaymentMethod.DEBT: return <ShieldAlert size={14} />;
      default: return null;
    }
  };

  const filteredEntities = useMemo(() => {
    const list = activeTab === 'clients' ? clients : suppliers;
    return list.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, clients, suppliers, searchTerm]);

  const currentSelection = useMemo(() => {
    return activeTab === 'clients' 
      ? clients.find(c => c.id === selectedId) 
      : suppliers.find(s => s.id === selectedId);
  }, [activeTab, selectedId, clients, suppliers]);

  const history = useMemo(() => {
    if (!selectedId) return [];
    
    let combined: any[] = [];
    
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
    } else {
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

  const handleTabChange = (tab: 'clients' | 'suppliers') => {
    setActiveTab(tab);
    setSelectedId('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Сверка взаиморасчетов</h2>
          <p className="text-slate-500 text-sm font-medium">История долгов и платежей в реальном времени.</p>
        </div>

        <div className="flex p-1 bg-slate-200 rounded-2xl">
          <button 
            onClick={() => handleTabChange('clients')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'clients' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users size={16} /> Клиенты
          </button>
          <button 
            onClick={() => handleTabChange('suppliers')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'suppliers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <UsersRound size={16} /> Поставщики
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row gap-6 items-end shadow-sm">
        <div className="flex-1 w-full space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Поиск и выбор контрагента</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder={`Найти в списке...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 text-slate-900 font-bold text-sm"
              />
            </div>
            <div className="relative flex-1">
              <select 
                value={selectedId} 
                onChange={(e) => setSelectedId(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 text-slate-900 font-bold text-sm appearance-none"
              >
                <option value="">-- Выберите из списка --</option>
                {filteredEntities.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {selectedId && currentSelection && (
          <div className="px-8 py-3 bg-slate-900 rounded-2xl min-w-[240px] text-center w-full md:w-auto shadow-xl">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Текущий итог</p>
            <p className={`text-2xl font-black text-white`}>
              {formatPrice((currentSelection as any).debt ?? (currentSelection as any).balance ?? 0)} <span className="text-sm font-medium">сум</span>
            </p>
          </div>
        )}
      </div>

      {!selectedId ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <FileText size={40} />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Выберите объект для формирования отчета</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Дата / Время</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Операция</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Начислено (+)</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Оплачено (-)</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right bg-indigo-50/50">Долг на момент</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-bold uppercase tracking-widest">История операций пуста</td></tr>
                ) : (
                  history.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                          <Calendar size={14} className="text-slate-300" />
                          {new Date(t.date).toLocaleString('ru-RU')}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${t.type === 'payment' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {t.type === 'payment' ? <TrendingDown size={14}/> : <TrendingUp size={14}/>}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 text-xs uppercase tracking-tight">{t.description}</span>
                            <span className="text-[9px] flex items-center gap-1 text-slate-400 font-black uppercase tracking-widest">{getMethodIcon(t.method)} {t.method}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-rose-600 text-sm">
                        {t.plus > 0 ? `+${formatPrice(t.plus)}` : ''}
                      </td>
                      <td className="px-6 py-5 text-right font-black text-emerald-600 text-sm">
                        {t.minus > 0 ? `-${formatPrice(t.minus)}` : ''}
                      </td>
                      <td className={`px-6 py-5 text-right font-black text-sm bg-indigo-50/20 group-hover:bg-indigo-50 transition-colors ${t.balanceAfter > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {formatPrice(t.balanceAfter)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconciliationPage;
