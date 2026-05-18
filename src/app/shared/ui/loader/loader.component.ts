import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="flex items-center justify-center py-10" role="status" aria-label="Chargement">
      <span
        class="inline-block animate-spin rounded-full border-4 border-brand-200 border-t-brand-700"
        [style.width.px]="size"
        [style.height.px]="size"
      ></span>
      @if (label) {
        <span class="ml-3 text-sm text-gray-500">{{ label }}</span>
      }
    </div>
  `,
})
export class LoaderComponent {
  @Input() size = 36;
  @Input() label = '';
}
