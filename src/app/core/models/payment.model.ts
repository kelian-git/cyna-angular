export type PaymentMethodType = 'CREDIT_CARD' | 'VIREMENT';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED';

export interface Payment {
  idPayment: number;
  paymentDate: string;
  amount: number;
  method: string; // PaymentMethodType
  status: string; // PaymentStatus
}
