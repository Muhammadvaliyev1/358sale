
import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  ArrowRightLeft,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { useApp } from '../App';
import { PaymentMethod, TransactionType, CashTransaction } from '../services/types';

const CashierPage: React.FC = () => {
  const { sales, cash, setCash } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>(TransactionType.IN);
  const [transaction, setTransaction] = useState({ amount: '', reason: '' });

  const today = new Date().toISOString().split('T')[0];

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU');
  };

  const stats = useMemo(() => {
    const todaySales = sales.filter(s => s.date.startsWith(today));
    
    return {
      cash: todaySales.filter(s => s.paymentMethod === PaymentMethod.CASH).reduce((sum, s) => sum + s.total, 0),
      card: todaySales.filter(s => s.paymentMethod === PaymentMethod.CARD).reduce((sum, s) => sum + s.total, 0),
      transfer: todaySales.filter(s => s.paymentMethod === PaymentMethod.TRANSFER).reduce((sum, s) => sum + s.total, 0),
      debt: todaySales.filter(s => s.paymentMethod === PaymentMethod.DEBT).reduce((sum, s) => sum + s.total, 0),
      total: todaySales.reduce((sum, s) => sum + s.total, 0),
      count: todaySales.length
    };
  }, [sales, today]);

  const cashFlow = useMemo(() => {
    const todayCash = cash.filter(c => c.date.startsWith(today));
    return {
      in: todayCash.filter(c => c.type === TransactionType.IN).reduce((sum, c) => sum + c.amount, 0),
      out: todayCash.filter(c => c.type === TransactionType.OUT).reduce((sum, c) => sum + c.amount, 0)
    };
  }, [cash, today]);

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction.amount || !transaction.reason) return;

    const newTx: CashTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      amount: parseFloat(transaction.amount),
      type: modalType,
      reason: transaction.reason
    };

    setCash(prev => [newTx, ...prev]);
    setTransaction({ amount: '', reason: '' });
    setIsModalOpen(false);
  };

  const statCards = [
    { label: 'Наличные', value: stats.cash, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Терминал', value: stats.card, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Переводы', value: stats.transfer, icon: ArrowRightLeft, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Продажи в долг', value: stats.debt, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Кассовый отчет</h2>
          <p className="text-slate-500 text-sm">Мониторинг выручки и управление расходами.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold shadow-sm text-sm">
          <Calendar size={18} />
          <span>{new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className={`w-12 h-12 ${card.bg} rounded-2xl flex items-center justify-center ${card.color} mb-4`}>
              <card.icon size={24} />
            </div>
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">{card.label}</p>
            <h3 className="text-xl font-black text-slate-900">{formatPrice(card.value)} сум</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">Всего продаж за день</p>
                <h3 className="text-4xl font-black">{formatPrice(stats.total)} сум</h3>
                <p className="text-indigo-400 text-sm mt-4 font-bold">{stats.count} успешных транзакций сегодня</p>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <span className="flex items-center gap-2 text-emerald-400 font-bold"><TrendingUp size={16}/> Приход</span>
                  <span className="text-xl font-bold">+{formatPrice(stats.total - stats.debt + cashFlow.in)} сум</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <span className="flex items-center gap-2 text-rose-400 font-bold"><TrendingDown size={16}/> Расход</span>
                  <span className="text-xl font-bold">-{formatPrice(cashFlow.out)} сум</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-800">Движение денежных средств</h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setModalType(TransactionType.IN); setIsModalOpen(true); }}
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors shadow-sm"
                >
                  <Plus size={16} /> Приход
                </button>
                <button 
                  onClick={() => { setModalType(TransactionType.OUT); setIsModalOpen(true); }}
                  className="flex items-center gap-2 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors shadow-sm"
                >
                  <Minus size={16} /> Расход
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {cash.length === 0 ? (
                <div className="p-12 text-center text-slate-400 italic font-medium">Движений за сегодня нет.</div>
              ) : (
                cash.map(tx => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === TransactionType.IN ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {tx.type === TransactionType.IN ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{tx.reason}</p>
                        <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${tx.type === TransactionType.IN ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === TransactionType.IN ? '+' : '-'}{formatPrice(tx.amount)} сум
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 p-4 opacity-20">
                <Wallet size={120} />
             </div>
             <h4 className="text-xl font-bold mb-4">Наличность</h4>
             <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Проверьте фактическое наличие денег в кассе (наличные + приходы - расходы).</p>
             <div className="space-y-2">
                <p className="text-xs uppercase font-bold text-indigo-300 tracking-widest">В кассе (нал)</p>
                <p className="text-2xl font-black">{formatPrice(stats.cash + cashFlow.in - cashFlow.out)} сум</p>
             </div>
           </div>
        </div>
      </div>

      {/* Модалка транзакции */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              {modalType === TransactionType.IN ? 'Записать приход' : 'Записать расход'}
            </h3>
            <form onSubmit={handleTransaction} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Сумма (сум)</label>
                <input 
                  required
                  type="number"
                  placeholder="0"
                  value={transaction.amount}
                  onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 font-bold text-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Причина / Описание</label>
                <input 
                  required
                  type="text"
                  placeholder="Напр. Оплата за свет, Инкассация"
                  value={transaction.reason}
                  onChange={(e) => setTransaction({ ...transaction, reason: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit"
                  className={`flex-1 px-6 py-3 rounded-xl text-white font-black shadow-lg transition-all ${modalType === TransactionType.IN ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                  ПОДТВЕРДИТЬ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierPage;
