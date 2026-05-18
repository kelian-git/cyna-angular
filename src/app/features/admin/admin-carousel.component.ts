import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarouselService } from '../../core/services/carousel.service';
import { ToastService } from '../../core/services/toast.service';
import { CarouselComponent } from '../../shared/ui/carousel/carousel.component';

@Component({
  selector: 'app-admin-carousel',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CarouselComponent],
  template: `
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-brand-900">Carrousel d'accueil</h1>
      <button type="button" class="btn-secondary" (click)="reset()">Réinitialiser</button>
    </div>

    <section class="mt-4">
      <h2 class="mb-2 font-bold text-brand-900">Aperçu en temps réel</h2>
      <app-carousel [slides]="carousel.slides()" />
    </section>

    <section class="mt-6 card p-5">
      <h2 class="mb-2 font-bold text-brand-900">Texte fixe (sous le carrousel)</h2>
      <textarea
        rows="2"
        class="input-field"
        [ngModel]="carousel.fixedText()"
        (ngModelChange)="carousel.setFixedText($event)"
        aria-label="Texte fixe"
      ></textarea>
    </section>

    <section class="mt-6">
      <h2 class="mb-2 font-bold text-brand-900">Diapositives</h2>
      <div class="flex flex-col gap-2">
        @for (s of carousel.slides(); track s.id; let i = $index) {
          <div class="card flex flex-wrap items-center gap-2 p-3 text-sm">
            <span class="font-semibold text-brand-900">{{ s.title }}</span>
            <span class="text-gray-500">{{ s.subtitle }}</span>
            <span class="ml-auto flex gap-2">
              <button
                type="button"
                class="px-2 disabled:opacity-30"
                [disabled]="i === 0"
                aria-label="Monter"
                (click)="carousel.move(s.id, -1)"
              >
                ↑
              </button>
              <button
                type="button"
                class="px-2 disabled:opacity-30"
                [disabled]="i === carousel.slides().length - 1"
                aria-label="Descendre"
                (click)="carousel.move(s.id, 1)"
              >
                ↓
              </button>
              <button type="button" class="text-danger" (click)="carousel.remove(s.id)">
                Supprimer
              </button>
            </span>
          </div>
        }
      </div>
    </section>

    <section class="mt-6 card p-5">
      <h2 class="mb-3 font-bold text-brand-900">Ajouter une diapositive</h2>
      <form [formGroup]="form" (ngSubmit)="add()" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input class="input-field" formControlName="title" placeholder="Titre" />
        <input class="input-field" formControlName="subtitle" placeholder="Sous-titre" />
        <input class="input-field" formControlName="cta" placeholder="Texte du bouton" />
        <input class="input-field" formControlName="href" placeholder="Lien (ex: /categories)" />
        <input
          class="input-field sm:col-span-2"
          formControlName="bg"
          placeholder="Dégradé Tailwind (ex: from-brand-700 to-brand-950)"
        />
        <button type="submit" class="btn-primary sm:col-span-2" [disabled]="form.invalid">
          Ajouter
        </button>
      </form>
    </section>
  `,
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
