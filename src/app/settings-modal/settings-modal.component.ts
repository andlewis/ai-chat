import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { persistData } from '../data/context';
import { Config } from '../data/models';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings-modal.component.html',
  styleUrl: './settings-modal.component.scss'
})
export class SettingsModalComponent {
  isVisible = input.required<boolean>();
  config = input.required<Config>();
  hide = output();
  change = output<Config>();

  onHide() {
    this.hide.emit();
  }

  onDelete() {

  }

  onSave() {
    persistData('config', this.config());
    this.change.emit(this.config());
    this.onHide();
  }
}
