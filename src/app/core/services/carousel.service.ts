import { Injectable, signal } from '@angular/core';
import { CarouselSlide } from '../models';
import { nextId } from '../utils/id.util';
import { readJson, writeJson } from '../utils/storage.util';

const STORAGE_KEY = 'cyna-carousel';

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    title: 'Protégez votre entreprise',
    subtitle: 'Nos solutions SOC, EDR et XDR au service de votre cybersécurité.',
    cta: 'Découvrir',
    href: '/categories',
    bg: 'from-brand-700 to-brand-950',
  },
  {
    id: 2,
    title: 'XDR Suite 360',
    subtitle: 'Vision unifiée, corrélation IA, réponse en temps réel.',
    cta: "Voir l'offre",
    href: '/produits/5',
    bg: 'from-brand-600 to-brand-900',
  },
  {
    id: 3,
    title: 'SOC managé 24/7',
    subtitle: "Une équipe d'experts dédiée à votre infrastructure.",
    cta: 'En savoir plus',
    href: '/produits/9',
    bg: 'from-brand-800 to-brand-950',
  },
];

const DEFAULT_FIXED_TEXT =
  'Cyna accompagne les entreprises dans leur stratégie de cybersécurité depuis plus de 10 ans. Solutions SaaS, services managés, audits — tout-en-un.';

interface CarouselState {
  slides: CarouselSlide[];
  fixedText: string;
}

/** Mock : pas de controller Carousel côté back. Stocké en localStorage. */
@Injectable({ providedIn: 'root' })
export class CarouselService {
  private readonly state = signal<CarouselState>(
    readJson<CarouselState>(STORAGE_KEY, { slides: DEFAULT_SLIDES, fixedText: DEFAULT_FIXED_TEXT }),
  );

  readonly slides = signal<CarouselSlide[]>(this.state().slides);
  readonly fixedText = signal<string>(this.state().fixedText);

  private save(): void {
    const next = { slides: this.slides(), fixedText: this.fixedText() };
    this.state.set(next);
    writeJson(STORAGE_KEY, next);
  }

  reset(): void {
    this.slides.set([...DEFAULT_SLIDES]);
    this.fixedText.set(DEFAULT_FIXED_TEXT);
    this.save();
  }

  add(slide: Omit<CarouselSlide, 'id'>): void {
    this.slides.set([...this.slides(), { ...slide, id: nextId() }]);
    this.save();
  }

  update(id: number, patch: Partial<CarouselSlide>): void {
    this.slides.set(this.slides().map((s) => (s.id === id ? { ...s, ...patch } : s)));
    this.save();
  }

  remove(id: number): void {
    this.slides.set(this.slides().filter((s) => s.id !== id));
    this.save();
  }

  move(id: number, dir: -1 | 1): void {
    const slides = [...this.slides()];
    const idx = slides.findIndex((s) => s.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= slides.length) return;
    [slides[idx], slides[target]] = [slides[target], slides[idx]];
    this.slides.set(slides);
    this.save();
  }

  setFixedText(text: string): void {
    this.fixedText.set(text);
    this.save();
  }
}
