import type { Product } from './product.model';
import type { Invoice } from './invoice.model';
import type { Payment } from './payment.model';

export type OrderStatus = 'PENDING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  idOrderItem: number;
  quantity: number;
  unitPrice?: number;
  product?: Product;
}

export interface Order {
  idOrder: number;
  orderDate: string;
  status: string; // OrderStatus
  totalAmount: number;
  orderItems?: OrderItem[];
  invoice?: Invoice | null;
  payment?: Payment | null;
}
