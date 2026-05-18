import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title"
        (click)="onBackdrop($event)"
      >
        <div class="w-full max-w-lg rounded-lg bg-white shadow-xl" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between border-b px-5 py-3">
            <h2 class="text-lg font-semibold text-brand-900">{{ title }}</h2>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-700"
              aria-label="Fermer"
              (click)="closed.emit()"
            >
              ✕
            </button>
          </div>
          <div class="px-5 py-4"><ng-content /></div>
          <div class="flex justify-end gap-2 border-t px-5 py-3">
            <ng-content select="[modalFooter]" />
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() closeOnBackdrop = true;
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.open) this.closed.emit();
  }

  onBackdrop(_e: MouseEvent): void {
    if (this.closeOnBackdrop) this.closed.emit();
  }
}
