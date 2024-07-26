import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings-modal.component.html',
  styleUrl: './settings-modal.component.scss'
})
export class SettingsModalComponent {
  isVisible = input.required<boolean>();
  hide = output();

  deployment: string | null = null;
  apiKey: string | null = null;

  onHide() {
    this.hide.emit();
  }

  onDelete() {

  }

  onSave() {
    this.onHide();
  }
}
