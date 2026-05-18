import { Injectable, signal } from '@angular/core';
import { ContactMessage } from '../models';
import { nextId } from '../utils/id.util';
import { readJson, writeJson } from '../utils/storage.util';

const STORAGE_KEY = 'cyna-contact-messages';

/** Mock : pas de controller back. Messages du formulaire de contact en localStorage. */
@Injectable({ providedIn: 'root' })
export class ContactService {
  readonly messages = signal<ContactMessage[]>(
    readJson<ContactMessage[]>(STORAGE_KEY, []),
  );

  private save(): void {
    writeJson(STORAGE_KEY, this.messages());
  }

  send(email: string, subject: string, message: string): ContactMessage {
    const msg: ContactMessage = {
      id: nextId(),
      email,
      subject,
      message,
      at: new Date().toISOString(),
      handled: false,
    };
    this.messages.set([msg, ...this.messages()]);
    this.save();
    return msg;
  }

  setHandled(id: number, handled: boolean): void {
    this.messages.set(this.messages().map((m) => (m.id === id ? { ...m, handled } : m)));
    this.save();
  }

  remove(id: number): void {
    this.messages.set(this.messages().filter((m) => m.id !== id));
    this.save();
  }
}
