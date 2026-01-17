
import { ProductType } from './types';
import type { Product, Client, Supplier, Sale, CashTransaction, ClientPayment, SupplierPayment, SupplierTransaction } from './types';

const STORAGE_KEYS = {
  PRODUCTS: 'wp_products',
  CLIENTS: 'wp_clients',
  SUPPLIERS: 'wp_suppliers',
  SALES: 'wp_sales',
  CASH: 'wp_cash',
  PAYMENTS: 'wp_payments',
  SUPPLIER_PAYMENTS: 'wp_supp_payments',
  SUPPLIER_TXS: 'wp_supp_txs'
};

const initialProducts: Product[] = [
  { id: '1', name: 'Яблоки (Гала)', price: 15000, type: ProductType.WEIGHT, stock: 500 },
  { id: '2', name: 'Картофель (Крупный)', price: 4500, type: ProductType.WEIGHT, stock: 1200 },
  { id: '3', name: 'Молоко 1л', price: 9500, type: ProductType.PIECE, stock: 240 },
  { id: 'tuya_default', name: 'Туя', price: 20000, type: ProductType.BOXED, weight: 4, stock: 10 },
];

const initialClients: Client[] = [
  { id: 'c1', name: 'Пекарня "Элит"', phone: '+998 90 123-45-67', debt: 1540000 },
  { id: 'c2', name: 'Продуктовый у Дониёра', phone: '+998 91 555-00-11', debt: 0 },
];

const initialSuppliers: Supplier[] = [
  { id: 's1', name: 'Фермерское Хозяйство "Агро"', phone: '+998 71 111-22-22', category: 'Овощи', balance: 2500000 },
];

export const mockDb = {
  get: <T,>(key: string, initial: T[]): T[] => {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return initial;
    }
  },
  
  save: <T,>(key: string, data: T[]): void => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  getProducts: () => mockDb.get<Product>(STORAGE_KEYS.PRODUCTS, initialProducts),
  setProducts: (data: Product[]) => mockDb.save(STORAGE_KEYS.PRODUCTS, data),

  getClients: () => mockDb.get<Client>(STORAGE_KEYS.CLIENTS, initialClients),
  setClients: (data: Client[]) => mockDb.save(STORAGE_KEYS.CLIENTS, data),

  getSuppliers: () => mockDb.get<Supplier>(STORAGE_KEYS.SUPPLIERS, initialSuppliers),
  setSuppliers: (data: Supplier[]) => mockDb.save(STORAGE_KEYS.SUPPLIERS, data),

  getSales: () => mockDb.get<Sale>(STORAGE_KEYS.SALES, []),
  setSales: (data: Sale[]) => mockDb.save(STORAGE_KEYS.SALES, data),

  getCash: () => mockDb.get<CashTransaction>(STORAGE_KEYS.CASH, []),
  setCash: (data: CashTransaction[]) => mockDb.save(STORAGE_KEYS.CASH, data),

  getPayments: () => mockDb.get<ClientPayment>(STORAGE_KEYS.PAYMENTS, []),
  setPayments: (data: ClientPayment[]) => mockDb.save(STORAGE_KEYS.PAYMENTS, data),

  getSupplierPayments: () => mockDb.get<SupplierPayment>(STORAGE_KEYS.SUPPLIER_PAYMENTS, []),
  setSupplierPayments: (data: SupplierPayment[]) => mockDb.save(STORAGE_KEYS.SUPPLIER_PAYMENTS, data),

  getSupplierTransactions: () => mockDb.get<SupplierTransaction>(STORAGE_KEYS.SUPPLIER_TXS, []),
  setSupplierTransactions: (data: SupplierTransaction[]) => mockDb.save(STORAGE_KEYS.SUPPLIER_TXS, data),
};
