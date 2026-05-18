import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [AsyncPipe, NgClass],
  template: `
    <div
      class="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      @for (t of toast.toasts$ | async; track t.id) {
        <div
          class="flex items-start gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg"
          [ngClass]="{
            'bg-success': t.kind === 'success',
            'bg-danger': t.kind === 'error',
            'bg-brand-800': t.kind === 'info',
          }"
          role="status"
        >
          <span class="flex-1">{{ t.message }}</span>
          <button
            type="button"
            class="opacity-80 hover:opacity-100"
            aria-label="Fermer la notification"
            (click)="toast.dismiss(t.id)"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toast = inject(ToastService);
}
