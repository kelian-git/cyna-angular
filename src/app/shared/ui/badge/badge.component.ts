import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

export type BadgeTone = 'success' | 'danger' | 'info' | 'warning' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      [ngClass]="{
        'bg-green-100 text-green-800': tone === 'success',
        'bg-red-100 text-red-800': tone === 'danger',
        'bg-brand-100 text-brand-800': tone === 'info',
        'bg-amber-100 text-amber-800': tone === 'warning',
        'bg-gray-100 text-gray-700': tone === 'neutral',
      }"
    >
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  @Input() tone: BadgeTone = 'neutral';
}
