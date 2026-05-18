import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Category } from '../../core/models';
import { CategoryService } from '../../core/services/category.service';
import { CategoryCardComponent } from '../../shared/ui/category-card/category-card.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [TranslateModule, CategoryCardComponent, LoaderComponent],
  template: `
    <div class="container-page">
      <h1 class="mb-6 text-2xl font-bold text-brand-900">{{ 'nav.catalog' | translate }}</h1>
      @if (loading()) {
        <app-loader />
      } @else {
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (c of categories(); track c.idCategory) {
            <app-category-card [category]="c" />
          }
        </div>
      }
    </div>
  `,
})
export class CatalogueComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (c) => this.categories.set(c),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }
}
