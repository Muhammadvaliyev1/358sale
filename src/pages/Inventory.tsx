
import React, { useState, useMemo } from 'react';
import { Plus, Edit3, X } from 'lucide-react';
import { useApp } from '../App';

// Константы для рантайма
import { ProductType } from '../services/types';

// Только типы
import type { Product } from '../services/types';

const InventoryPage: React.FC = () => {
  const { products, setProducts, setCart } = useApp();
  const [activeTab, setActiveTab] = useState<'existing' | 'new' | 'manage'>('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [restockSearch, setRestockSearch] = useState('');
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProd, setNewProd] = useState<{ name: string; price: string; type: ProductType; weightPerBox: string }>({ name: '', price: '', type: ProductType.PIECE, weightPerBox: '' });
  const [restock, setRestock] = useState({ productId: '', amount: '', costPrice: '' });

  useEffect(() => {
    if (restock.productId) {
      const p = products.find(prod => prod.id === restock.productId);
      if (p) setRestock(prev => ({ ...prev, costPrice: p.price.toString() }));
    } else {
      setRestock(prev => ({ ...prev, costPrice: '' }));
    }
  }, [restock.productId, products]);

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) return;
    
    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProd.name,
      price: parseFloat(newProd.price),
      type: newProd.type,
      stock: 0,
      weightPerBox: newProd.type === ProductType.BOXED ? parseFloat(newProd.weightPerBox) || 1 : undefined
    };
    
    
    setProducts(prev => [product, ...prev]);
    setNewProd({ name: '', price: '', type: ProductType.PIECE, weightPerBox: '' });
    setActiveTab('manage');
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    setCart(prev => prev.map(item => item.id === editingProduct.id ? { ...item, name: editingProduct.name, price: editingProduct.price } : item));
    setEditingProduct(null);
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restock.productId || !restock.amount) return;
    const amount = parseFloat(restock.amount);
    const newPrice = parseFloat(restock.costPrice);
    setProducts(prev => prev.map(p => p.id === restock.productId ? { ...p, stock: p.stock + amount, price: newPrice > 0 ? newPrice : p.price } : p));
    setRestock({ productId: '', amount: '', costPrice: '' });
    setRestockSearch('');
    alert('Приход успешно оформлен!');
  };

  const deleteProduct = (id: string) => {
    if (confirm('Удалить товар из базы навсегда?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');
  const filteredProductsManage = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProductsRestock = useMemo(() => products.filter(p => p.name.toLowerCase().includes(restockSearch.toLowerCase())), [products, restockSearch]);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
          <Truck size={32} />
        </div>
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Складской учет</h2>
           <p className="text-slate-700 font-medium text-lg">Управление товарами и запасами.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-2 bg-slate-200 rounded-[2rem] w-fit">
        <button onClick={() => setActiveTab('existing')} className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'existing' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-600 hover:bg-slate-300'}`}>
          <RefreshCw size={16} /> Приход
        </button>
        <button onClick={() => setActiveTab('new')} className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-600 hover:bg-slate-300'}`}>
          <Plus size={16} /> Новый товар
        </button>
        <button onClick={() => setActiveTab('manage')} className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'manage' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-600 hover:bg-slate-300'}`}>
          <Package size={16} /> База товаров
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border-2 border-slate-100 p-8 md:p-12 shadow-sm">
        {activeTab === 'existing' && (
          <form onSubmit={handleRestock} className="space-y-8">
            <h3 className="text-2xl font-black text-slate-900 uppercase">Оформление прихода</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-700 uppercase ml-1">1. Выбор товара</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input type="text" placeholder="Поиск по базе..." value={restockSearch} onChange={(e) => setRestockSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-indigo-500" />
                </div>
                <select required value={restock.productId} onChange={(e) => setRestock({ ...restock, productId: e.target.value })} className="w-full px-4 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl font-black text-slate-900 text-sm appearance-none cursor-pointer">
                  <option value="">-- ВЫБЕРИТЕ ИЗ СПИСКА --</option>
                  {filteredProductsRestock.map(p => <option key={p.id} value={p.id}>{p.name} (Остаток: {p.stock} {p.type === ProductType.WEIGHT ? 'кг' : 'ед'})</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-700 uppercase ml-1">2. Количество прихода</label>
                <input required type="number" step="0.01" value={restock.amount} onChange={(e) => setRestock({ ...restock, amount: e.target.value })} className="w-full px-6 py-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl font-black text-2xl text-indigo-700 outline-none" placeholder="0.00" />
                <p className="text-[10px] font-bold text-slate-400 uppercase px-1">Для коробочных товаров указывайте количество коробок.</p>
              </div>
            </div>
            <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest">ПРИНЯТЬ ТОВАР</button>
          </form>
        )}

        {activeTab === 'new' && (
          <form onSubmit={handleCreateNew} className="space-y-8">
            <h3 className="text-2xl font-black text-slate-900 uppercase">Регистрация в каталоге</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase ml-1">Название товара</label>
                <input required type="text" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-indigo-500" placeholder="Напр: Сахар (мешок 50кг)" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase ml-1">Тип учета</label>
                <select value={newProd.type} onChange={(e) => setNewProd({ ...newProd, type: e.target.value as ProductType })} className="w-full px-6 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl font-black text-slate-900">
                  <option value={ProductType.PIECE}>ШТУЧНЫЙ</option>
                  <option value={ProductType.WEIGHT}>ВЕСОВОЙ (КГ)</option>
                  <option value={ProductType.BOXED}>КОРОБОЧНЫЙ (С ВЕСОМ)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase ml-1">Цена продажи (за кг/шт)</label>
                <input required type="number" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-xl text-slate-900 outline-none focus:border-indigo-500" placeholder="0" />
              </div>
              {newProd.type === ProductType.BOXED && (
                <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-black text-indigo-600 uppercase ml-1">Вес одной коробки (кг)</label>
                  <input required type="number" step="0.01" value={newProd.weightPerBox} onChange={(e) => setNewProd({ ...newProd, weightPerBox: e.target.value })} className="w-full px-6 py-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl font-black text-xl text-indigo-700 outline-none focus:border-indigo-600" placeholder="Напр: 25.5" />
                </div>
              )}
            </div>
            <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl transition-all uppercase tracking-widest">СОЗДАТЬ КАРТОЧКУ</button>
          </form>
        )}

        {activeTab === 'manage' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <h3 className="text-2xl font-black text-slate-900 uppercase">Список товаров</h3>
               <div className="relative w-full md:w-64">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                 <input type="text" placeholder="Поиск..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-500" />
               </div>
            </div>
            <div className="overflow-scroll border-2 border-slate-100 rounded-[2rem]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-6 text-xs font-black uppercase text-slate-700 tracking-widest">Товар</th>
                    <th className="p-6 text-xs font-black uppercase text-slate-700 tracking-widest text-right">Склад</th>
                    <th className="p-6 text-xs font-black uppercase text-slate-700 tracking-widest text-right">Цена (ед)</th>
                    <th className="p-6 text-xs font-black uppercase text-slate-700 tracking-widest text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProductsManage.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-6">
                        <p className="font-black text-slate-900 text-sm uppercase">{p.name}</p>
                        {p.type === ProductType.BOXED && <p className="text-[10px] font-bold text-indigo-500 uppercase">Вес коробки: {p.weightPerBox} кг</p>}
                      </td>
                      <td className={`p-6 text-right font-black ${p.stock <= 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {p.stock} {p.type === ProductType.WEIGHT ? 'кг' : p.type === ProductType.BOXED ? 'кор' : 'шт'}
                      </td>
                      <td className="p-6 text-right font-black text-indigo-700">{formatPrice(p.price)}</td>
                      <td className="p-6 text-right flex justify-end gap-2">
                        <button onClick={() => setEditingProduct(p)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"><Edit3 size={18} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-8 md:p-12 shadow-2xl relative">
             <button onClick={() => setEditingProduct(null)} className="absolute top-8 right-8 p-3 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-all"><X size={24} /></button>
             <h3 className="text-2xl font-black text-slate-900 uppercase mb-8">Редактирование</h3>
             <form onSubmit={handleUpdateProduct} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase">Название</label>
                  <input required type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase">Цена (за ед)</label>
                    <input required type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-xl text-indigo-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase">Тип учета</label>
                    <select value={editingProduct.type} onChange={(e) => setEditingProduct({ ...editingProduct, type: e.target.value as ProductType })} className="w-full px-6 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl font-bold text-slate-900">
                      <option value={ProductType.PIECE}>ШТУЧНЫЙ</option>
                      <option value={ProductType.WEIGHT}>ВЕСОВОЙ</option>
                      <option value={ProductType.BOXED}>КОРОБОЧНЫЙ</option>
                    </select>
                  </div>
                </div>
                {editingProduct.type === ProductType.BOXED && (
                   <div className="space-y-2">
                    <label className="text-xs font-black text-indigo-600 uppercase">Вес одной коробки (кг)</label>
                    <input required type="number" step="0.01" value={editingProduct.weightPerBox} onChange={(e) => setEditingProduct({ ...editingProduct, weightPerBox: parseFloat(e.target.value) || 0 })} className="w-full px-6 py-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl font-black text-xl text-indigo-700" />
                  </div>
                )}
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">Сохранить</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
