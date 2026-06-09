import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarouselService } from '../../../core/services/carousel.service';
import { ToastService } from '../../../core/services/toast.service';
import { CarouselComponent } from '../../../shared/ui/carousel/carousel.component';

@Component({
  selector: 'app-admin-carousel',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CarouselComponent],
  templateUrl: './admin-carousel.component.html'
})
export class AdminCarouselComponent {
  readonly carousel = inject(CarouselService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    subtitle: ['', Validators.required],
    cta: ['Découvrir', Validators.required],
    href: ['/categories', Validators.required],
    bg: ['from-brand-700 to-brand-950', Validators.required],
  });

  add(): void {
    if (this.form.invalid) return;
    this.carousel.add(this.form.getRawValue());
    this.form.reset({ cta: 'Découvrir', href: '/categories', bg: 'from-brand-700 to-brand-950' });
    this.toast.success('Diapositive ajoutée.');
  }

  reset(): void {
    this.carousel.reset();
    this.toast.success('Carrousel réinitialisé.');
  }
}
