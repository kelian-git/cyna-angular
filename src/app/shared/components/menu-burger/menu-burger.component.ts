import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-menu-burger',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './menu-burger.component.html',
  styleUrl: './menu-burger.component.scss'
})
export class MenuBurgerComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  readonly auth = inject(AuthService);
}
