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
  clear = output();
  change = output<Config>();  

  onHide() {
    this.hide.emit();
  }

  onDelete() {
    this.clear.emit();
    this.hide.emit();
  }

  onSave() {
    persistData('config', this.config());
    this.change.emit(this.config());
    this.onHide();
  }

  onCopy(){
    navigator.clipboard.writeText(JSON.stringify(this.config()));
  }

  onLoad(){
    navigator.clipboard.readText().then(text => {
      const o:Config = JSON.parse(text) as Config;
      this.config().apiKey = o.apiKey;
      this.config().apiVersion = o.apiVersion;
      this.config().deployment = o.deployment;
      this.config().endpoint = o.endpoint;
      this.config().imageApiKey = o.imageApiKey;
      this.config().imageDeployment = o.imageDeployment;
      this.config().imageEndpoint = o.imageEndpoint;
    });
  }
}
