import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatbotWidgetComponent } from '../../components/chatbot-widget/chatbot-widget.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatbotWidgetComponent],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {}
