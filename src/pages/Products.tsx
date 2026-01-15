
import React, { useState } from 'react';
import { Search, Plus, Box } from 'lucide-react';
import { useApp } from '../App';
import type { Product } from '../services/types';
import { ProductType } from '../services/types';

const ProductsPage: React.FC = () => {
  const { products, addToCart } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase()))
);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-black uppercase tracking-tight">Каталог товаров</h2>
          <p className="text-black font-semibold text-lg">Продажа разрешена даже при нулевом остатке.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
          <input 
            type="text" 
            placeholder="Поиск по названию..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-black rounded-[1.5rem] shadow-sm focus:border-indigo-600 outline-none font-black text-black" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          return (
            <div key={product.id} className="bg-white rounded-[2.5rem] border-2 border-slate-200 hover:border-indigo-600 shadow-md hover:shadow-2xl transition-all flex flex-col group overflow-hidden">
              <div className="p-7 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-black text-black text-xl uppercase leading-tight line-clamp-2 group-hover:text-indigo-700 transition-colors">{product.name}</h3>
                  <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                    product.type === ProductType.WEIGHT ? 'bg-orange-100 text-orange-700' : product.type === ProductType.BOXED ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {product.type === ProductType.WEIGHT ? 'Кг' : product.type === ProductType.BOXED ? 'Кор' : 'Шт'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2">
                    <Box size={16} className="text-black" />
                    <span className="text-sm font-black uppercase tracking-widest text-black">
                      На складе: <span className={product.stock <= 0 ? 'text-rose-600 underline' : 'text-black'}>{product.stock} {product.type === ProductType.WEIGHT ? 'кг' : product.type === ProductType.BOXED ? 'кор' : 'шт'}</span>
                    </span>
                  </div>
                  {product.type === ProductType.BOXED && (
                    <p className="text-xs font-black text-indigo-700 uppercase ml-6 italic">Вес кор: {product.weightPerBox} кг</p>
                  )}
                </div>

                <div className="mt-auto pt-5 border-t-2 border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Цена продажи</p>
                    <p className="text-2xl font-black text-black tracking-tighter">{formatPrice(product.price)} <span className="text-xs font-bold">сум</span></p>
                  </div>
                  
                  <button 
                    onClick={() => handleAddToCart(product)} 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-indigo-600 text-white shadow-lg hover:scale-110 active:scale-95"
                  >
                    <Plus size={32} strokeWidth={4} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsPage;
