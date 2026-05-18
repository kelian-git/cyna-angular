import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../core/models';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h1 class="mb-6 text-2xl font-bold text-brand-900">
      {{ editId() ? 'Modifier le produit' : 'Nouveau produit' }}
    </h1>

    <form
      [formGroup]="form"
      (ngSubmit)="submit()"
      class="card flex max-w-xl flex-col gap-4 p-6"
    >
      <div>
        <label class="mb-1 block text-sm font-medium" for="pname">Nom</label>
        <input id="pname" class="input-field" formControlName="name" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium" for="pdes">Description</label>
        <textarea id="pdes" rows="3" class="input-field" formControlName="des"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium" for="pprice">Prix (€)</label>
          <input id="pprice" type="number" class="input-field" formControlName="price" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium" for="pstock">Stock</label>
          <input id="pstock" type="number" class="input-field" formControlName="stock" />
        </div>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium" for="pcat">Catégorie</label>
        <select id="pcat" class="input-field" formControlName="categoryId">
          <option [ngValue]="null" disabled>— Choisir —</option>
          @for (c of categories(); track c.idCategory) {
            <option [ngValue]="c.idCategory">{{ c.name }}</option>
          }
        </select>
      </div>
      <div class="flex gap-3">
        <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
          Enregistrer
        </button>
        <button type="button" class="btn-secondary" (click)="cancel()">Annuler</button>
      </div>
    </form>
  `,
})
export class AdminProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly categories = signal<Category[]>([]);
  readonly editId = signal<number | null>(null);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    des: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: this.fb.control<number | null>(null, Validators.required),
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((c) => this.categories.set(c));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(Number(id));
      this.productService.getById(Number(id)).subscribe((p) => {
        this.form.patchValue({
          name: p.name,
          des: p.des,
          price: p.price,
          stock: p.stock,
          categoryId: p.category?.idCategory ?? null,
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    const payload = { name: v.name, des: v.des, price: v.price, stock: v.stock };
    const id = this.editId();
    const done = () => {
      this.saving.set(false);
      this.toast.success(id ? 'Produit modifié.' : 'Produit créé.');
      this.router.navigate(['/admin/produits']);
    };
    const fail = () => {
      this.saving.set(false);
      this.toast.error('Échec de l’enregistrement.');
    };
    if (id) {
      this.productService.update(id, payload).subscribe({ next: done, error: fail });
    } else {
      this.productService
        .create(payload, v.categoryId as number)
        .subscribe({ next: done, error: fail });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/produits']);
  }
}
