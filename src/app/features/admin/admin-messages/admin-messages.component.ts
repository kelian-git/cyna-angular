import { Component, inject } from '@angular/core';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { ContactService } from '../../../core/services/contact.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatDateTime } from '../../../core/utils/formatters.util';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [BadgeComponent, EmptyStateComponent],
  templateUrl: './admin-messages.component.html',
  styleUrl: './admin-messages.component.scss'
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
