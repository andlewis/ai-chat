import { Component, input, output } from '@angular/core';
import { Conversation } from '../data/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  conversations = input.required<Conversation[]>();
  newConversation = output();
  select = output<Conversation>();

  onNew(){
    this.newConversation.emit();
  }

  onSelect(conversation: Conversation){
    this.select.emit(conversation);
  }
}
