import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ChatbotService, botReply } from '../../../core/services/chatbot.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrl: './chatbot-widget.component.scss'
})
export class ChatbotWidgetComponent {
  private readonly chatbot = inject(ChatbotService);
  private readonly auth = inject(AuthService);

  readonly open = signal(false);
  draft = '';
  private readonly convId = signal<number | null>(null);

  private readonly conv = computed(() =>
    this.chatbot.conversations().find((c) => c.id === this.convId()),
  );
  readonly messages = computed(() => this.conv()?.messages ?? []);
  readonly escalated = computed(() => this.conv()?.escalated ?? false);

  openChat(): void {
    if (this.convId() === null) {
      const email = this.auth.getCurrentUser()?.email || 'invité';
      this.convId.set(this.chatbot.startConversation(email));
    }
    this.open.set(true);
  }

  send(): void {
    const text = this.draft.trim();
    const id = this.convId();
    if (!text || id === null) return;
    this.chatbot.addMessage(id, { role: 'user', text, at: new Date().toISOString() });
    const reply = botReply(text);
    this.chatbot.addMessage(id, { role: 'bot', text: reply, at: new Date().toISOString() });
    if (/(contact|agent|humain)/.test(text.toLowerCase())) this.chatbot.escalate(id);
    this.draft = '';
  }
}
