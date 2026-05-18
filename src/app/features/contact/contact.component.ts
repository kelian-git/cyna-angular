import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { ToastService } from '../../core/services/toast.service';

// Le widget chatbot flottant est global (MainLayout) — inutile de le ré-ajouter ici.
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="container-page max-w-2xl">
      <h1 class="mb-2 text-2xl font-bold text-brand-900">Contactez-nous</h1>
      <p class="mb-6 text-gray-500">
        Une question ? Écrivez-nous, ou utilisez le chat « Contact Me » en bas à gauche.
      </p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="card flex flex-col gap-4 p-6">
        <div>
          <label class="mb-1 block text-sm font-medium" for="cemail">Email</label>
          <input id="cemail" class="input-field" type="email" formControlName="email" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium" for="csubject">Sujet</label>
          <select id="csubject" class="input-field" formControlName="subject">
            <option value="Question commerciale">Question commerciale</option>
            <option value="Support technique">Support technique</option>
            <option value="Facturation">Facturation</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium" for="cmsg">Message</label>
          <textarea
            id="cmsg"
            rows="5"
            class="input-field"
            formControlName="message"
          ></textarea>
        </div>
        <button type="submit" class="btn-primary self-start" [disabled]="form.invalid">
          Envoyer
        </button>
      </form>
    </div>
  `,
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contact = inject(ContactService);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    subject: ['Question commerciale', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    const { email, subject, message } = this.form.getRawValue();
    this.contact.send(email, subject, message);
    this.toast.success('Message envoyé. Nous vous répondrons rapidement.');
    this.form.reset({ subject: 'Question commerciale' });
  }
}
