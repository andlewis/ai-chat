import { Component, input, output } from '@angular/core';
import { Config, Conversation } from '../data/models';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SettingsModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  conversation = input.required<Conversation>();
  config = input.required<Config>();
  isExpanded = input.required<boolean>();
  change = output<Config>();
  clear = output();
  toggleExpanded = output();
  isSettingsVisible = false;

  onToggleExapanded(){
    this.toggleExpanded.emit();
  }


  onSettings() {
    this.isSettingsVisible = true;
  }

  onChange(config: Config) {
    this.change.emit(config);
  }

  onClear(){
    this.clear.emit();
  }
}
