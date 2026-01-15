import React, { useState, useMemo } from 'react';
import { FileSpreadsheet, Truck, ArrowRightLeft, Banknote, CreditCard, ShieldAlert } from 'lucide-react';
import { useApp } from '../App';
import { PaymentMethod } from '../services/types';
import type { PaymentMethodType, SupplierPayment } from '../services/types';

const SupplierReconciliationPage: React.FC = () => {
  const { suppliers, supplierPayments, supplierTransactions, setSupplierPayments, setSuppliers } = useApp();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState<{
    amount: string;
    method: PaymentMethodType;
    note: string;
  }>({
    amount: '',
    method: PaymentMethod.CASH,
    note: ''
  });

  const supplier = useMemo(
    () => suppliers.find(s => s.id === selectedSupplierId),
    [suppliers, selectedSupplierId]
  );

  const transactions = useMemo(() => {
    if (!selectedSupplierId) return [];

    const txs = supplierTransactions.filter(t => t.supplierId === selectedSupplierId);
    const payments = supplierPayments
      .filter(p => p.supplierId === selectedSupplierId)
      .map(p => ({
        id: p.id,
        date: p.date,
        type: 'payment' as const,
        amount: p.amount,
        description: `Выплата: ${p.note || 'Без примечания'}`,
        method: p.method
      }));

    const combined = [...txs, ...payments];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedSupplierId, supplierTransactions, supplierPayments]);

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || !newPayment.amount) return;

    const amount = parseFloat(newPayment.amount);
    const payment: SupplierPayment = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      supplierId: selectedSupplierId,
      amount,
      method: newPayment.method,
      note: newPayment.note
    };

    setSupplierPayments(prev => [payment, ...prev]);
    setSuppliers(prev =>
      prev.map(s => (s.id === selectedSupplierId ? { ...s, balance: Math.max(0, s.balance - amount) } : s))
    );

    setNewPayment({ amount: '', method: PaymentMethod.CASH, note: '' });
    setIsPaymentModalOpen(false);
  };

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  const getMethodIcon = (method: PaymentMethodType) => {
    switch (method) {
      case PaymentMethod.CASH:
        return <Banknote size={14} className="inline mr-1 text-rose-600" />;
      case PaymentMethod.CARD:
        return <CreditCard size={14} className="inline mr-1 text-rose-600" />;
      case PaymentMethod.TRANSFER:
        return <ArrowRightLeft size={14} className="inline mr-1 text-rose-600" />;
      case PaymentMethod.DEBT:
        return <ShieldAlert size={14} className="inline mr-1 text-rose-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и выбор поставщика */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Сверка с поставщиками</h2>
          <p className="text-slate-500 text-sm">История закупок и оплат поставщикам.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={selectedSupplierId}
              onChange={e => setSelectedSupplierId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="">Выберите поставщика</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSupplierId && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg"
            >
              Выплатить долг
            </button>
          )}
        </div>
      </div>

      {/* Основная таблица */}
      {!selectedSupplierId ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed">
          <FileSpreadsheet size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-semibold text-slate-400">Выберите поставщика для просмотра сверки</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Наш долг (Баланс)</p>
              <h3 className="text-2xl font-black text-rose-600">{formatPrice(supplier?.balance || 0)} сум</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Всего принято товаров</p>
              <h3 className="text-2xl font-black text-slate-800">
                {formatPrice(transactions.filter(t => t.type === 'supply').reduce((sum, t) => sum + t.amount, 0))} сум
              </h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Всего выплачено</p>
              <h3 className="text-2xl font-black text-emerald-600">
                {formatPrice(transactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0))} сум
              </h3>
            </div>
          </div>

          {/* Таблица транзакций */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Дата</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Операция</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Начислено (Supply)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Выплачено (Payment)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
  {transactions.map(t => (
    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 text-xs text-slate-500">{new Date(t.date).toLocaleString()}</td>
      <td className="px-6 py-4 font-semibold text-slate-800 text-sm">
        {t.type === 'payment' && 'method' in t ? (
          <>
            {getMethodIcon(t.method)} {t.description}
          </>
        ) : (
          t.description
        )}
      </td>
      <td className="px-6 py-4 text-right font-bold text-rose-600 text-sm">
        {t.type === 'supply' ? formatPrice(t.amount) : ''}
      </td>
      <td className="px-6 py-4 text-right font-bold text-emerald-600 text-sm">
        {t.type === 'payment' ? formatPrice(t.amount) : ''}
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно оплаты */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Выплата поставщику</h3>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <input
                required
                type="number"
                placeholder="Сумма оплаты (сум)"
                value={newPayment.amount}
                onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <select
                value={newPayment.method}
                onChange={e =>
                  setNewPayment({ ...newPayment, method: e.target.value as PaymentMethodType })
                }
                className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
              >
                <option value={PaymentMethod.CASH}>Наличные</option>
                <option value={PaymentMethod.CARD}>Терминал</option>
                <option value={PaymentMethod.TRANSFER}>Перевод</option>
                <option value={PaymentMethod.DEBT}>Долг</option>
              </select>
              <input
                type="text"
                placeholder="Примечание"
                value={newPayment.note}
                onChange={e => setNewPayment({ ...newPayment, note: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
              />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 rounded-xl border">
                  Отмена
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold">
                  Выплатить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierReconciliationPage;
