import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a
      [routerLink]="['/categories', category.idCategory]"
      class="group relative block overflow-hidden rounded-lg shadow-sm"
    >
      <img
        [src]="category.imageUrl"
        [alt]="category.name"
        loading="lazy"
        class="h-44 w-full object-cover transition group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-brand-950/80 to-transparent"></div>
      <div class="absolute bottom-0 w-full p-4">
        <h3 class="text-lg font-bold text-white">{{ category.name }}</h3>
        @if (category.description) {
          <p class="line-clamp-1 text-sm text-white/80">{{ category.description }}</p>
        }
      </div>
    </a>
  `,
})
export class CategoryCardComponent {
  @Input({ required: true }) category!: Category;
}
