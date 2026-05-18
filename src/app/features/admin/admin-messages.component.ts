import { Component, inject } from '@angular/core';
import { ChatbotService } from '../../core/services/chatbot.service';
import { ContactService } from '../../core/services/contact.service';
import { ToastService } from '../../core/services/toast.service';
import { formatDateTime } from '../../core/utils/formatters.util';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [BadgeComponent, EmptyStateComponent],
  template: `
    <h1 class="mb-6 text-2xl font-bold text-brand-900">Messages</h1>

    <section class="mb-10">
      <h2 class="mb-3 font-bold text-brand-900">Formulaire de contact</h2>
      @if (contact.messages().length === 0) {
        <app-empty-state title="Aucun message" icon="✉️" />
      } @else {
        <div class="flex flex-col gap-2">
          @for (m of contact.messages(); track m.id) {
            <div class="card p-4">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-brand-900">{{ m.subject }}</span>
                @if (m.handled) {
                  <app-badge tone="success">Traité</app-badge>
                } @else {
                  <app-badge tone="warning">Nouveau</app-badge>
                }
              </div>
              <p class="text-sm text-gray-500">{{ m.email }} — {{ dt(m.at) }}</p>
              <p class="mt-1 text-sm">{{ m.message }}</p>
              <div class="mt-2 flex gap-3 text-sm">
                <button type="button" class="text-brand-700" (click)="toggleHandled(m.id, !m.handled)">
                  {{ m.handled ? 'Marquer non traité' : 'Marquer comme traité' }}
                </button>
                <button type="button" class="text-danger" (click)="removeMsg(m.id)">
                  Supprimer
                </button>
              </div>
            </div>
          }
        </div>
      }
    </section>

    <section>
      <h2 class="mb-3 font-bold text-brand-900">Conversations chatbot</h2>
      @if (chatbot.conversations().length === 0) {
        <app-empty-state title="Aucune conversation" icon="💬" />
      } @else {
        <div class="flex flex-col gap-2">
          @for (c of chatbot.conversations(); track c.id) {
            <div class="card p-4">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-brand-900">{{ c.userEmail }}</span>
                @if (c.escalated) {
                  <app-badge tone="danger">Escaladé</app-badge>
                }
              </div>
              <p class="text-sm text-gray-500">{{ dt(c.startedAt) }}</p>
              <ul class="mt-2 space-y-1 text-sm">
                @for (msg of c.messages; track $index) {
                  <li>
                    <span class="font-medium">{{ msg.role === 'bot' ? 'Bot' : 'Client' }} :</span>
                    {{ msg.text }}
                  </li>
                }
              </ul>
              <button type="button" class="mt-2 text-sm text-danger" (click)="removeConv(c.id)">
                Supprimer
              </button>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class AdminMessagesComponent {
  readonly contact = inject(ContactService);
  readonly chatbot = inject(ChatbotService);
  private readonly toast = inject(ToastService);

  dt(v: string): string {
    return formatDateTime(v);
  }

  toggleHandled(id: number, handled: boolean): void {
    this.contact.setHandled(id, handled);
  }

  removeMsg(id: number): void {
    this.contact.remove(id);
    this.toast.success('Message supprimé.');
  }

  removeConv(id: number): void {
    this.chatbot.remove(id);
    this.toast.success('Conversation supprimée.');
  }
}
