
import React, { useState } from 'react';
import { Search, Plus, Phone, DollarSign, UserCircle, Edit3, X } from 'lucide-react';
import { useApp } from '../App';
import type { Client } from '../services/types';

const ClientsPage: React.FC = () => {
  const { clients, setClients, setSales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [debtAction, setDebtAction] = useState<'add' | 'sub'>('add');
  const [debtAmount, setDebtAmount] = useState('');
  const [newClient, setNewClient] = useState({ name: '', phone: '' });
  const [editingClient, setEditingClient] = useState({ id: '', name: '', phone: '' });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    const client: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: newClient.name,
      phone: newClient.phone,
      debt: 0
    };
    setClients(prev => [...prev, client]);
    setNewClient({ name: '', phone: '' });
    setIsModalOpen(false);
  };

  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient.name) return;
    setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, name: editingClient.name, phone: editingClient.phone } : c));
    setSales(prev => prev.map(s => s.clientId === editingClient.id ? { ...s, clientName: editingClient.name } : s));
    setIsEditModalOpen(false);
  };

  const handleDebtAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !debtAmount) return;
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

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-black uppercase tracking-tight">Клиенты</h2>
          <p className="text-black font-semibold text-lg">Контроль долгов и платежей.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
            <input 
              type="text" 
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black rounded-2xl focus:border-indigo-500 outline-none text-black font-black"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 shadow-xl transition-all uppercase text-xs tracking-widest"
          >
            <Plus size={20} />
            <span>Новый клиент</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white p-8 rounded-[3rem] border-2 border-slate-200 hover:border-black shadow-lg hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center text-white">
                <UserCircle size={40} />
              </div>
              <button 
                onClick={() => {
                  setEditingClient({ id: client.id, name: client.name, phone: client.phone });
                  setIsEditModalOpen(true);
                }}
                className="p-3 bg-slate-100 text-black hover:bg-indigo-600 hover:text-white rounded-2xl transition-all"
              >
                <Edit3 size={24} />
              </button>
            </div>

            <div className="mb-8">
              <h3 className="font-black text-black text-2xl uppercase leading-tight line-clamp-1">{client.name}</h3>
              <p className="flex items-center gap-2 text-black font-black mt-2 text-lg">
                <Phone size={18} />
                {client.phone || 'Нет номера'}
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2rem] mb-8 flex items-center justify-between text-white">
              <div>
                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Общий долг</p>
                <p className={`text-2xl font-black ${client.debt > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{formatPrice(client.debt)} сум</p>
              </div>
              <DollarSign size={32} className="opacity-50" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto">
              <button 
                onClick={() => { setSelectedClient(client); setDebtAction('add'); setIsDebtModalOpen(true); }}
                className="py-5 bg-rose-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all"
              >
                + Долг
              </button>
              <button 
                onClick={() => { setSelectedClient(client); setDebtAction('sub'); setIsDebtModalOpen(true); }}
                className="py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
              >
                - Оплата
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Модалки */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative border-4 border-indigo-600">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-8 right-8 p-2 text-black hover:bg-slate-100 rounded-full transition-all"><X size={32}/></button>
            <h3 className="text-2xl font-black text-black mb-8 uppercase">Данные клиента</h3>
            <form onSubmit={handleUpdateClient} className="space-y-6">
              <input required type="text" value={editingClient.name} onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl font-black text-black outline-none focus:border-indigo-600" />
              <input type="text" value={editingClient.phone} onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl font-black text-black outline-none focus:border-indigo-600" />
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl">Сохранить</button>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative border-4 border-indigo-600">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 text-black hover:bg-slate-100 rounded-full transition-all"><X size={32}/></button>
            <h3 className="text-2xl font-black text-black mb-8 uppercase">Новый клиент</h3>
            <form onSubmit={handleAddClient} className="space-y-6">
              <input required type="text" placeholder="Имя / Название" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl font-black text-black outline-none focus:border-indigo-600" />
              <input type="text" placeholder="Телефон" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl font-black text-black outline-none focus:border-indigo-600" />
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl">Добавить</button>
            </form>
          </div>
        </div>
      )}

      {isDebtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl border-4 border-indigo-600">
            <h3 className="text-2xl font-black text-black mb-2 uppercase">{debtAction === 'add' ? 'Начислить долг' : 'Оплата долга'}</h3>
            <p className="text-black font-bold mb-8 uppercase text-xs tracking-widest">Клиент: <span className="text-indigo-600">{selectedClient?.name}</span></p>
            <form onSubmit={handleDebtAdjustment} className="space-y-6">
              <input required autoFocus type="number" placeholder="0" value={debtAmount} onChange={(e) => setDebtAmount(e.target.value)} className="w-full px-6 py-8 bg-slate-50 border-4 border-indigo-100 rounded-[2rem] text-5xl font-black text-black text-center outline-none focus:border-indigo-600" />
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsDebtModalOpen(false)} className="flex-1 py-5 border-2 border-slate-300 rounded-2xl font-black text-black uppercase">Отмена</button>
                <button type="submit" className={`flex-1 py-5 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl ${debtAction === 'add' ? 'bg-rose-600' : 'bg-emerald-600'}`}>Подтвердить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
