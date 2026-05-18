export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED';

export interface Subscription {
  idSubscription: number;
  startDate: string;
  endDate: string;
  status: string; // SubscriptionStatus
}
