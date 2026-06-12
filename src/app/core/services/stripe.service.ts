import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripePromise = loadStripe('pk_test_51ThV9uBb2gU9y8BPvRyzBhw8zkkmNbItS0OkYAr0d6l0oBR0iJrxluyT34iCV8ZZ7dUGwAOlwCOgYxFoEMKVCZGD00TC0SdaXv');
  private apiUrl = 'http://localhost:8081/api/payment';

  constructor(private http: HttpClient) {}

  getStripe(): Promise<Stripe | null> {
    return this.stripePromise;
  }

  createPaymentIntent(amount: number) {
    return this.http.post<{ clientSecret: string }>(`${this.apiUrl}/create-payment-intent`, { amount });
  }
}