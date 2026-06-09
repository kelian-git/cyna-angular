import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
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
