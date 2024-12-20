import { DatePipe } from '@angular/common';
import { Component, computed, input, OnInit, output } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { Conversation, Message } from '../data/models';

@Component({
  selector: 'app-responses',
  imports: [DatePipe, MarkdownModule],
  templateUrl: './responses.component.html',
  styleUrl: './responses.component.scss'
})
export class ResponsesComponent implements OnInit {
  conversation = input.required<Conversation>();
  isLoading = input.required<boolean>();
  isDarkMode = input.required<boolean>();
  error = input.required<any>();

  deleteMessage = output<Message>();

  numberOfMessages = computed(() => this.conversation() ? this.conversation().messages?.length : 0);

  ngOnInit(): void {

  }

  onDelete(e: Event, message: Message) {
    e.preventDefault();
    this.deleteMessage.emit(message);
  }

  onCopy(e: Event, message: Message) {
    e.preventDefault();
    navigator.clipboard.writeText(message.content ?? '');
  }
}
