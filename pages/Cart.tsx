
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, User, CreditCard, Banknote, ArrowRightLeft, ShieldAlert, ShoppingCart as CartIcon, DollarSign, Tag, Search, PlusCircle } from 'lucide-react';
import { useApp } from '../App';
import { PaymentMethod, Sale, ProductType } from '../services/types';

const CartPage: React.FC = () => {
  const { cart, setCart, removeFromCart, clearCart, clients, setClients, setSales, products, setProducts } = useApp();
  const navigate = useNavigate();
  
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [discount, setDiscount] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Состояния для смешанной оплаты
  const [payCash, setPayCash] = useState('');
  const [payCard, setPayCard] = useState('');
  const [payTransfer, setPayTransfer] = useState('');

  const calculateItemTotal = (item: any) => {
    if (item.type === ProductType.BOXED) {
      return item.quantity * (item.weightPerBox || 1) * item.price;
    }
    return item.quantity * item.price;
  };

  const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const discountVal = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountVal);

  const totalPaid = (parseFloat(payCash) || 0) + (parseFloat(payCard) || 0) + (parseFloat(payTransfer) || 0);
  const remainingDebt = Math.max(0, total - totalPaid);

  const updateItem = (id: string, updates: { quantity?: number, price?: number }) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleCheckout = () => {
    if (!cart.length || !selectedClientId) {
      alert('Выберите товары и клиента!');
      return;
    }

    setIsCheckingOut(true);
    
    setTimeout(() => {
      const client = clients.find(c => c.id === selectedClientId)!;
      const debtBefore = client.debt;
      const debtAfter = client.debt + remainingDebt;
      
      const newSale: Sale = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        date: new Date().toISOString(),
        clientId: client.id,
        clientName: client.name,
        items: JSON.parse(JSON.stringify(cart)),
        total,
        discount: discountVal,
        amountPaid: totalPaid,
        paymentMethod: remainingDebt > 0 ? PaymentMethod.DEBT : PaymentMethod.CASH,
        debtBefore,
        debtAfter,
        // @ts-ignore
        splitPayments: {
          cash: parseFloat(payCash) || 0,
          card: parseFloat(payCard) || 0,
          transfer: parseFloat(payTransfer) || 0,
          debt: remainingDebt
        }
      };

      setSales(prev => [newSale, ...prev]);
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, debt: debtAfter } : c));
      
      setProducts(prev => prev.map(p => {
        const cartItem = cart.find(ci => ci.id === p.id);
        if (cartItem) {
          const newStock = p.stock - cartItem.quantity;
          return { ...p, stock: Math.max(0, newStock) }; 
        }
        return p;
      }));

      clearCart();
      setIsCheckingOut(false);
      navigate('/history');
    }, 500);
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch)
    );
  }, [clients, clientSearch]);

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  if (!cart.length) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center">
        <CartIcon size={64} className="text-slate-200 mb-4" />
        <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest">Корзина пуста</h2>
        <button onClick={() => navigate('/')} className="mt-6 px-10 py-4 bg-indigo-600 text-white rounded-3xl font-black shadow-xl shadow-indigo-100 uppercase tracking-widest hover:scale-105 transition-all">В каталог</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-black tracking-tight uppercase">Оформление заказа</h2>
        <button onClick={clearCart} className="text-rose-600 font-black text-xs uppercase hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">Удалить всё</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm">
            <div className="divide-y-2 divide-slate-50">
              {cart.map(item => (
                <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-black text-black text-lg uppercase mb-4">{item.name}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-black font-black uppercase ml-1">Цена за ед.</label>
                        <input type="number" value={item.price} onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl font-black text-black outline-none focus:border-indigo-600" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-black font-black uppercase ml-1">Количество</label>
                        <input type="number" step="0.01" value={item.quantity} onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-indigo-50 border-2 border-indigo-200 rounded-2xl font-black text-indigo-700 outline-none focus:border-indigo-600" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Итог позиции</p>
                    <p className="text-3xl font-black text-black tracking-tighter">{formatPrice(calculateItemTotal(item))}</p>
                    <button onClick={() => removeFromCart(item.id)} className="mt-2 text-rose-500 hover:text-rose-700 transition-colors font-black text-xs uppercase">Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">Общая сумма</p>
                  <p className="text-6xl font-black">{formatPrice(total)} <span className="text-xl">сум</span></p>
                </div>
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                      <Tag size={20} className="text-indigo-400" />
                      <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="bg-transparent border-none text-xl font-black text-white w-32 outline-none" placeholder="Скидка" />
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-black text-lg uppercase flex items-center gap-3">
               <User className="text-indigo-600" size={24} /> Выбор клиента
            </h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
              <input type="text" placeholder="Найти..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 outline-none font-black text-black" />
            </div>
            <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full px-5 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl font-black text-black appearance-none outline-none focus:border-indigo-600">
              <option value="">-- ВЫБЕРИТЕ КЛИЕНТА --</option>
              {filteredClients.map(c => <option key={c.id} value={c.id} className="text-black">{c.name} ({formatPrice(c.debt)})</option>)}
            </select>

            <h3 className="font-black text-black text-lg uppercase flex items-center gap-3 pt-4 border-t-2 border-slate-50">
               <PlusCircle size={24} className="text-emerald-600" /> Смешанная Оплата
            </h3>
            
            <div className="space-y-4">
               <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-100 focus-within:border-emerald-500 transition-all">
                  <Banknote className="text-emerald-600" />
                  <input type="number" placeholder="Наличные" value={payCash} onChange={(e) => setPayCash(e.target.value)} className="bg-transparent w-full outline-none font-black text-black text-xl placeholder:text-emerald-300" />
               </div>
               <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 focus-within:border-blue-500 transition-all">
                  <CreditCard className="text-blue-600" />
                  <input type="number" placeholder="Карта" value={payCard} onChange={(e) => setPayCard(e.target.value)} className="bg-transparent w-full outline-none font-black text-black text-xl placeholder:text-blue-300" />
               </div>
               <div className="flex items-center gap-3 bg-violet-50 p-4 rounded-2xl border-2 border-violet-100 focus-within:border-violet-500 transition-all">
                  <ArrowRightLeft className="text-violet-600" />
                  <input type="number" placeholder="Перевод" value={payTransfer} onChange={(e) => setPayTransfer(e.target.value)} className="bg-transparent w-full outline-none font-black text-black text-xl placeholder:text-violet-300" />
               </div>
               
               <div className="pt-4 border-t-2 border-slate-50 space-y-2">
                  <div className="flex justify-between items-center text-black font-black text-sm uppercase">
                     <span>Всего внесено:</span>
                     <span className="text-emerald-600 font-black">{formatPrice(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-rose-50 text-rose-700 rounded-2xl border-2 border-rose-100">
                     <div className="flex items-center gap-2 font-black text-xs uppercase"><ShieldAlert size={16}/> Остаток в долг:</div>
                     <span className="text-xl font-black">{formatPrice(remainingDebt)}</span>
                  </div>
               </div>
            </div>
          </div>

          <button disabled={isCheckingOut} onClick={handleCheckout} className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[3rem] font-black text-2xl uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50">
            {isCheckingOut ? 'ПРОДАЖА...' : 'ОФОРМИТЬ ЧЕК'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
