export const typesLoaded = true;
console.log('types.ts loaded');

/* ---------- ProductType ---------- */
export const ProductType = {
  PIECE: 'piece',
  WEIGHT: 'weight',
  BOXED: 'boxed',
} as const;

export type ProductType =
  typeof ProductType[keyof typeof ProductType];

/* ---------- PaymentMethod ---------- */
export const PaymentMethod = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  DEBT: 'debt',
} as const;

export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod];

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

/* ---------- TransactionType ---------- */
export const TransactionType = {
  IN: 'in',
  OUT: 'out',
} as const;

export type TransactionType =
  typeof TransactionType[keyof typeof TransactionType];

/* ---------- Interfaces ---------- */
export interface Product {
  id: string;
  name: string;
  price: number;
  type: ProductType;
  stock: number;
  weightPerBox?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  debt: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  category: string;
  balance: number;
}

export interface Sale {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  items: CartItem[];
  total: number;
  discount: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  debtBefore?: number;
  debtAfter?: number;
  splitPayments?: {
    cash: number;
    card: number;
    transfer: number;
    debt: number;
  };
}

export interface CashTransaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  reason: string;
}

export interface ClientPayment {
  id: string;
  date: string;
  clientId: string;
  amount: number;
  method: PaymentMethod;
  note: string;
}

export interface SupplierPayment {
  id: string;
  date: string;
  supplierId: string;
  amount: number;
  method: PaymentMethod;
  note: string;
}

export interface SupplierTransaction {
  id: string;
  date: string;
  supplierId: string;
  amount: number;
  type: 'supply' | 'payment';
  description: string;
}