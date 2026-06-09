import { NgClass } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselSlide } from '../../../core/models';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './carousel.component.html'
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() slides: CarouselSlide[] = [];
  @Input() interval = 6000;

  readonly current = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    if (this.slides.length > 1) {
      this.timer = setInterval(() => this.next(), this.interval);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  next(): void {
    this.current.set((this.current() + 1) % this.slides.length);
  }

  goTo(i: number): void {
    this.current.set(i);
  }
}
