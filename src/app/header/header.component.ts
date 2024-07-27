import { Component, input, Input } from '@angular/core';
import { Config, Conversation } from '../data/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  conversation = input.required<Conversation>();
  config = input.required<Config>();
}
