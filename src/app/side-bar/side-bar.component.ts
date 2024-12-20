import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Config, Conversation } from '../data/models';

@Component({
  selector: 'app-side-bar',
  imports: [DatePipe],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  conversations = input.required<Conversation[]>();
  newConversation = output();
  delete = output<Conversation>();
  config = input.required<Config>();
  select = output<Conversation>();
  toggleExpanded = output();
  toggleDarkMode = output();


  isExpanded = input.required<boolean>();

  onNew() {
    this.newConversation.emit();
    this.toggleExpanded.emit();
  }

  onSelect(conversation: Conversation) {
    this.select.emit(conversation);
    this.toggleExpanded.emit();
  }

  onDelete(conversation: Conversation) {
    this.delete.emit(conversation);
  }

  onCollapse() {
    this.toggleExpanded.emit();
  }

  onToggleDarkMode() {
    this.toggleDarkMode.emit();
  }

}
