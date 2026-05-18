import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages() > 1) {
      <nav class="flex items-center justify-center gap-1" aria-label="Pagination">
        <button
          type="button"
          class="rounded px-3 py-1 text-sm disabled:opacity-40"
          [disabled]="page === 1"
          (click)="go(page - 1)"
          aria-label="Page précédente"
        >
          ‹
        </button>
        @for (p of pages(); track p) {
          <button
            type="button"
            class="rounded px-3 py-1 text-sm"
            [class.bg-brand-800]="p === page"
            [class.text-white]="p === page"
            [class.hover:bg-gray-100]="p !== page"
            [attr.aria-current]="p === page ? 'page' : null"
            (click)="go(p)"
          >
            {{ p }}
          </button>
        }
        <button
          type="button"
          class="rounded px-3 py-1 text-sm disabled:opacity-40"
          [disabled]="page === totalPages()"
          (click)="go(page + 1)"
          aria-label="Page suivante"
        >
          ›
        </button>
      </nav>
    }
  `,
})
export class PaginationComponent {
  private readonly totalSig = signal(0);
  private readonly perPageSig = signal(10);

  @Input() page = 1;
  @Input() set total(v: number) {
    this.totalSig.set(v);
  }
  @Input() set perPage(v: number) {
    this.perPageSig.set(v);
  }
  @Output() pageChange = new EventEmitter<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalSig() / this.perPageSig())),
  );
  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  go(p: number): void {
    if (p < 1 || p > this.totalPages() || p === this.page) return;
    this.pageChange.emit(p);
  }
}
