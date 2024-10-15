import { DatePipe, JsonPipe } from '@angular/common';
import { Component, computed, input, Input, OnInit, output } from '@angular/core';
import { Conversation, Message } from '../data/models';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-responses',
  standalone: true,
  imports: [DatePipe, MarkdownModule, JsonPipe],
  templateUrl: './responses.component.html',
  styleUrl: './responses.component.scss'
})
export class ResponsesComponent implements OnInit {
  conversation = input.required<Conversation>();
  isLoading = input.required<boolean>();
  isDarkMode = input.required<boolean>();
  error = input.required<any>();

  deleteMessage = output<Message>();

  numberOfMessages = computed(()=> this.conversation() ? this.conversation().messages?.length : 0);

  ngOnInit(): void {

  }

  onDelete(e:Event, message:Message) {
    e.preventDefault();
    this.deleteMessage.emit(message);
  }
}
