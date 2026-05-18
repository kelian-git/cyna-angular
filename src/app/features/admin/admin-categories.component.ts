import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../core/models';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [ReactiveFormsModule, LoaderComponent],
  template: `
    <h1 class="mb-6 text-2xl font-bold text-brand-900">Catégories</h1>

    <form
      [formGroup]="createForm"
      (ngSubmit)="create()"
      class="card mb-6 flex max-w-md items-end gap-3 p-4"
    >
      <div class="flex-1">
        <label class="mb-1 block text-sm font-medium" for="newcat">Nouvelle catégorie</label>
        <input id="newcat" class="input-field" formControlName="name" />
      </div>
      <button type="submit" class="btn-primary" [disabled]="createForm.invalid">Ajouter</button>
    </form>

    @if (loading()) {
      <app-loader />
    } @else {
      <div class="flex flex-col gap-2">
        @for (c of categories(); track c.idCategory; let i = $index) {
          <div class="card flex items-center gap-4 p-3">
            <img [src]="c.imageUrl" [alt]="c.name" class="h-12 w-12 rounded object-cover" />
            @if (editId() === c.idCategory) {
              <input class="input-field flex-1" [value]="c.name" #editInput />
              <button type="button" class="btn-primary" (click)="save(c, editInput.value)">
                Enregistrer
              </button>
              <button type="button" class="btn-secondary" (click)="editId.set(null)">
                Annuler
              </button>
            } @else {
              <div class="flex-1">
                <p class="font-semibold text-brand-900">{{ c.name }}</p>
                <p class="text-sm text-gray-500">{{ c.products?.length || 0 }} produit(s)</p>
              </div>
              <button
                type="button"
                class="px-2 text-gray-500 disabled:opacity-30"
                [disabled]="i === 0"
                aria-label="Monter"
                (click)="move(i, -1)"
              >
                ↑
              </button>
              <button
                type="button"
                class="px-2 text-gray-500 disabled:opacity-30"
                [disabled]="i === categories().length - 1"
                aria-label="Descendre"
                (click)="move(i, 1)"
              >
                ↓
              </button>
              <button type="button" class="text-brand-700" (click)="editId.set(c.idCategory)">
                Modifier
              </button>
              <button type="button" class="text-danger" (click)="remove(c)">Supprimer</button>
            }
          </div>
        }
      </div>
    }
  `,
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
