import { Injectable, signal } from '@angular/core';
import { Address, SavedPaymentMethod } from '../models';
import { nextId } from '../utils/id.util';
import { readJson, writeJson } from '../utils/storage.util';

const ADDR_KEY = 'cyna-addresses';
const PM_KEY = 'cyna-payment-methods';

/** Mock : pas de controller Adresses / Méthodes de paiement côté back. */
@Injectable({ providedIn: 'root' })
export class AddressService {
  readonly addresses = signal<Address[]>(readJson<Address[]>(ADDR_KEY, []));
  readonly methods = signal<SavedPaymentMethod[]>(readJson<SavedPaymentMethod[]>(PM_KEY, []));

  private saveAddr(): void {
    writeJson(ADDR_KEY, this.addresses());
  }
  private savePm(): void {
    writeJson(PM_KEY, this.methods());
  }

  addAddress(addr: Omit<Address, 'id'>): Address {
    const created: Address = { ...addr, id: nextId() };
    this.addresses.set([...this.addresses(), created]);
    this.saveAddr();
    return created;
  }

  updateAddress(id: number, patch: Partial<Address>): void {
    this.addresses.set(this.addresses().map((a) => (a.id === id ? { ...a, ...patch } : a)));
    this.saveAddr();
  }

  removeAddress(id: number): void {
    this.addresses.set(this.addresses().filter((a) => a.id !== id));
    this.saveAddr();
  }

  /** On ne stocke jamais le numéro complet — uniquement les 4 derniers chiffres (PCI-DSS). */
  addMethod(m: { label?: string; cardNumber: string; holder: string; expiry: string }): SavedPaymentMethod {
    const masked: SavedPaymentMethod = {
      id: nextId(),
      label: m.label || 'CB',
      last4: (m.cardNumber || '').replace(/\s/g, '').slice(-4),
      holder: m.holder,
      expiry: m.expiry,
      isDefault: this.methods().length === 0,
    };
    this.methods.set([...this.methods(), masked]);
    this.savePm();
    return masked;
  }

  removeMethod(id: number): void {
    this.methods.set(this.methods().filter((m) => m.id !== id));
    this.savePm();
  }

  setDefaultMethod(id: number): void {
    this.methods.set(this.methods().map((m) => ({ ...m, isDefault: m.id === id })));
    this.savePm();
  }
}
