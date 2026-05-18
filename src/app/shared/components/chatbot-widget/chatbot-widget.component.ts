import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ChatbotService, botReply } from '../../../core/services/chatbot.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="fixed bottom-4 left-4 z-[70]">
      @if (open()) {
        <div class="flex h-96 w-80 flex-col rounded-lg border border-gray-200 bg-white shadow-2xl">
          <div class="flex items-center justify-between rounded-t-lg bg-brand-800 px-4 py-2 text-white">
            <span class="font-semibold">Assistant Cyna</span>
            <button type="button" aria-label="Fermer le chat" (click)="open.set(false)">✕</button>
          </div>
          <div class="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            @for (m of messages(); track $index) {
              <div
                class="max-w-[80%] rounded-lg px-3 py-1.5"
                [class.bg-brand-100]="m.role === 'bot'"
                [class.ml-auto]="m.role === 'user'"
                [class.bg-gray-100]="m.role === 'user'"
              >
                {{ m.text }}
              </div>
            }
            @if (escalated()) {
              <p class="text-center text-xs text-gray-400">— Transféré à un agent humain —</p>
            }
          </div>
          <form class="flex gap-2 border-t p-2" (ngSubmit)="send()">
            <input
              type="text"
              name="draft"
              [(ngModel)]="draft"
              class="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
              placeholder="Votre message…"
              aria-label="Message au chatbot"
            />
            <button type="submit" class="rounded bg-brand-800 px-3 text-sm text-white">→</button>
          </form>
        </div>
      } @else {
        <button
          type="button"
          class="rounded-full bg-brand-800 px-5 py-3 font-semibold text-white shadow-lg hover:bg-brand-900"
          (click)="openChat()"
        >
          💬 Contact Me
        </button>
      }
    </div>
  `,
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
