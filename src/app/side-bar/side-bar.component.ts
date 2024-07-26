import { Component, input, output } from '@angular/core';
import { Conversation } from '../data/models';
import { DatePipe } from '@angular/common';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [DatePipe, SettingsModalComponent],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  conversations = input.required<Conversation[]>();
  newConversation = output();
  select = output<Conversation>();

  isSettingsVisible=false;

  onNew() {
    this.newConversation.emit();
  }

  onSelect(conversation: Conversation) {
    this.select.emit(conversation);
  }

  onSettings(){
    this.isSettingsVisible = true;
  }

}
