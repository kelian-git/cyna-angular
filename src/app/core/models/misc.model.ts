/** Types des fonctionnalités mockées côté front (pas d'endpoint back). */

export interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bg: string;
}

export interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  at: string;
}

export interface ChatConversation {
  id: number;
  userEmail: string;
  startedAt: string;
  escalated: boolean;
  messages: ChatMessage[];
}

export interface ContactMessage {
  id: number;
  email: string;
  subject: string;
  message: string;
  at: string;
  handled: boolean;
}

export interface Address {
  id: number;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  zip: string;
  country: string;
  phone: string;
}

export interface SavedPaymentMethod {
  id: number;
  label: string;
  last4: string;
  holder: string;
  expiry: string;
  isDefault: boolean;
}

export interface SearchFilters {
  keyword?: string;
  priceMin?: number | null;
  priceMax?: number | null;
  categoryIds?: number[];
  onlyAvailable?: boolean;
}

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}
