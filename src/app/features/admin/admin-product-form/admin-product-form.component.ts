import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-product-form.component.html'
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
