import { Injectable, signal } from '@angular/core';
import { ChatConversation, ChatMessage } from '../models';
import { nextId } from '../utils/id.util';
import { readJson, writeJson } from '../utils/storage.util';

const STORAGE_KEY = 'cyna-chatbot';

/** Réponses scriptées FAQ simples. */
export function botReply(userText: string): string {
  const t = userText.toLowerCase();
  if (/(prix|tarif|cost|price)/.test(t))
    return "Nos tarifs varient selon la solution et le nombre d'utilisateurs. Consultez chaque page produit.";
  if (/soc/.test(t))
    return "Le SOC Cyna est une plateforme de surveillance 24/7 avec corrélation d'événements.";
  if (/edr/.test(t))
    return "L'EDR Cyna détecte et répond aux menaces sur tous vos endpoints (Win/Linux/Mac).";
  if (/xdr/.test(t))
    return 'Le XDR Cyna unifie la détection sur endpoints, réseau, email et cloud.';
  if (/(contact|agent|humain)/.test(t)) return 'Je vous transfère à un agent humain.';
  if (/(merci|thanks)/.test(t)) return 'Avec plaisir ! Une autre question ?';
  return 'Je ne suis pas sûr de comprendre. Tapez « contact » pour parler à un humain.';
}

/** Mock : pas de controller back. Conversations stockées en localStorage. */
@Injectable({ providedIn: 'root' })
export class ChatbotService {
  readonly conversations = signal<ChatConversation[]>(
    readJson<ChatConversation[]>(STORAGE_KEY, []),
  );

  private save(): void {
    writeJson(STORAGE_KEY, this.conversations());
  }

  startConversation(userEmail = 'invité'): number {
    const id = nextId();
    const conv: ChatConversation = {
      id,
      userEmail,
      startedAt: new Date().toISOString(),
      escalated: false,
      messages: [
        {
          role: 'bot',
          text: 'Bonjour ! Je suis le bot Cyna. Comment puis-je vous aider ? (essayez : prix, SOC, EDR, XDR, contact)',
          at: new Date().toISOString(),
        },
      ],
    };
    this.conversations.set([...this.conversations(), conv]);
    this.save();
    return id;
  }

  addMessage(convId: number, message: ChatMessage): void {
    this.conversations.set(
      this.conversations().map((c) =>
        c.id === convId ? { ...c, messages: [...c.messages, message] } : c,
      ),
    );
    this.save();
  }

  escalate(convId: number): void {
    this.conversations.set(
      this.conversations().map((c) => (c.id === convId ? { ...c, escalated: true } : c)),
    );
    this.save();
  }

  remove(convId: number): void {
    this.conversations.set(this.conversations().filter((c) => c.id !== convId));
    this.save();
  }
}
