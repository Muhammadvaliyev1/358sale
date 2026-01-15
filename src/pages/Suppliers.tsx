
import React, { useState } from 'react';
import { Phone, Plus, Search, Building2, Edit3, X } from 'lucide-react';
import { useApp } from '../App';
import { PaymentMethod, } from '../services/types';
import type { Supplier, SupplierTransaction, SupplierPayment } from '../services/types';

const SuppliersPage: React.FC = () => {
  const { suppliers, setSuppliers, setSupplierTransactions, setSupplierPayments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [balanceAction, setBalanceAction] = useState<'add' | 'sub'>('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', category: '' });
  const [editingSupplier, setEditingSupplier] = useState({ id: '', name: '', phone: '', category: '' });

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) return;
    const supplier: Supplier = {
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

  const handleUpdateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier.name) return;
    setSuppliers(prev => prev.map(s => 
      s.id === editingSupplier.id 
        ? { ...s, name: editingSupplier.name, phone: editingSupplier.phone, category: editingSupplier.category } 
        : s
    ));
    setIsEditModalOpen(false);
  };

  const handleBalanceAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !balanceAmount) return;

    const amount = parseFloat(balanceAmount);
    setSuppliers(prev => prev.map(s => 
      s.id === selectedSupplier.id 
        ? { ...s, balance: balanceAction === 'add' ? s.balance + amount : Math.max(0, s.balance - amount) } 
        : s
    ));

    if (balanceAction === 'add') {
      const tx: SupplierTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        supplierId: selectedSupplier.id,
        amount,
        type: 'supply',
        description: 'Корректировка долга (+)'
      };
      setSupplierTransactions(prev => [tx, ...prev]);
    } else {
      const pay: SupplierPayment = {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Поставщики</h2>
          <p className="text-slate-600 font-medium text-lg">Управление взаиморасчетами с партнерами.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Поиск поставщика..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-500" 
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 uppercase text-xs tracking-widest">
            <Plus size={18} /> Новый поставщик
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <Building2 size={28} />
              </div>
              <button 
                onClick={() => {
                  setEditingSupplier({ id: supplier.id, name: supplier.name, phone: supplier.phone, category: supplier.category });
                  setIsEditModalOpen(true);
                }}
                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              >
                <Edit3 size={20} />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-black text-slate-900 text-xl uppercase leading-tight line-clamp-1">{supplier.name}</h3>
              <p className="inline-block bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full mt-2 uppercase">{supplier.category || 'Общее'}</p>
              <div className="text-slate-700 font-bold mt-2 flex items-center gap-2">
                 <Phone size={14} className="text-slate-400" /> {supplier.phone || '---'}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Наш долг перед ним</p>
              <p className={`text-2xl font-black ${supplier.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatPrice(supplier.balance)} сум</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button onClick={() => { setSelectedSupplier(supplier); setBalanceAction('add'); setIsBalanceModalOpen(true); }} className="py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all">
                + Начислить
              </button>
              <button onClick={() => { setSelectedSupplier(supplier); setBalanceAction('sub'); setIsBalanceModalOpen(true); }} className="py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all">
                - Выплатить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Редактирование */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-8 md:p-10 shadow-2xl relative">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-8 right-8 p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"><X size={24}/></button>
            <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase">Данные поставщика</h3>
            <form onSubmit={handleUpdateSupplier} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase ml-1">Название фирмы</label>
                <input required type="text" value={editingSupplier.name} onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase ml-1">Телефон</label>
                  <input type="text" value={editingSupplier.phone} onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase ml-1">Категория</label>
                  <input type="text" value={editingSupplier.category} onChange={(e) => setEditingSupplier({ ...editingSupplier, category: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">Сохранить</button>
            </form>
          </div>
        </div>
      )}

      {/* Новый поставщик */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-8 md:p-10 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"><X size={24}/></button>
            <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase">Новый поставщик</h3>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <input required type="text" placeholder="Название организации" value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-500" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Телефон" value={newSupplier.phone} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-500" />
                <input type="text" placeholder="Категория" value={newSupplier.category} onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-500" />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all">Создать профиль</button>
            </form>
          </div>
        </div>
      )}

      {/* Баланс */}
      {isBalanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-8 md:p-10 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase">{balanceAction === 'add' ? 'Начислить долг' : 'Выплатить долг'}</h3>
            <p className="text-slate-600 font-bold mb-8">Поставщик: <span className="text-indigo-600">{selectedSupplier?.name}</span></p>
            <form onSubmit={handleBalanceAdjustment} className="space-y-6">
              <input required autoFocus type="number" placeholder="Введите сумму..." value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} className="w-full px-6 py-6 bg-slate-50 border-2 border-rose-100 rounded-2xl text-3xl font-black text-slate-900 text-center outline-none focus:border-rose-500" />
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsBalanceModalOpen(false)} className="flex-1 py-4 border-2 border-slate-200 rounded-2xl font-black text-slate-600 uppercase">Отмена</button>
                <button type="submit" className={`flex-1 py-4 rounded-2xl text-white font-black uppercase ${balanceAction === 'add' ? 'bg-rose-600' : 'bg-emerald-600'}`}>ОК</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
