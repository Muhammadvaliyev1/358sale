
export enum ProductType {
  PIECE = 'piece',
  WEIGHT = 'weight',
  BOXED = 'boxed'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  DEBT = 'debt'
}

export enum TransactionType {
  IN = 'in',
  OUT = 'out'
}

export interface Product {
  id: string;
  name: string;
  price: number; // Цена за единицу (за 1 кг или за 1 шт)
  type: ProductType;
  stock: number; // Остаток в базовых единицах (кг, шт или коробок)
  weightPerBox?: number; // Сколько кг в одной коробке (для BOXED)
}

export interface CartItem extends Product {
  quantity: number; // Кол-во коробок или кг/шт
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