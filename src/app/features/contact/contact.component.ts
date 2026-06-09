import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { ToastService } from '../../core/services/toast.service';

// Le widget chatbot flottant est global (MainLayout) — inutile de le ré-ajouter ici.
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
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
