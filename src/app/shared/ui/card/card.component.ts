import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <ng-content />
    </div>
  `,
})
export class CardComponent {}
