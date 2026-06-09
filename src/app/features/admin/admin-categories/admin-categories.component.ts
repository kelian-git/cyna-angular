import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../shared/ui/loader/loader.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [ReactiveFormsModule, LoaderComponent],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss'
})
export class AdminCategoriesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly editId = signal<number | null>(null);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.categoryService.withProducts().subscribe({
      next: (c) => this.categories.set(c),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  create(): void {
    if (this.createForm.invalid) return;
    this.categoryService.create(this.createForm.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Catégorie créée.');
        this.createForm.reset();
        this.load();
      },
    });
  }

  save(c: Category, name: string): void {
    if (!name.trim()) return;
    this.categoryService.update(c.idCategory, { name }).subscribe({
      next: () => {
        this.toast.success('Catégorie modifiée.');
        this.editId.set(null);
        this.load();
      },
    });
  }

  remove(c: Category): void {
    if (!confirm(`Supprimer la catégorie "${c.name}" ?`)) return;
    this.categoryService.remove(c.idCategory).subscribe({
      next: () => {
        this.toast.success('Catégorie supprimée.');
        this.load();
      },
      error: () => this.toast.error('Suppression impossible (catégorie non vide ?).'),
    });
  }

  move(index: number, dir: -1 | 1): void {
    const list = [...this.categories()];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    this.categories.set(list);
  }
}
