import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

export type BadgeTone = 'success' | 'danger' | 'info' | 'warning' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  @Input() tone: BadgeTone = 'neutral';
}
