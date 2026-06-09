import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Category } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryCardComponent } from '../../../shared/ui/category-card/category-card.component';
import { LoaderComponent } from '../../../shared/ui/loader/loader.component';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [TranslateModule, CategoryCardComponent, LoaderComponent],
  templateUrl: './catalogue.component.html'
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
