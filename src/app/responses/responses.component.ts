import { DatePipe } from '@angular/common';
import { Component, computed, input, Input, OnInit } from '@angular/core';
import { Conversation } from '../data/models';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-responses',
  standalone: true,
  imports: [DatePipe, MarkdownModule],
  templateUrl: './responses.component.html',
  styleUrl: './responses.component.scss'
})
export class ResponsesComponent implements OnInit {
  conversation = input.required<Conversation>();

  numberOfMessages = computed(()=> this.conversation ? this.conversation().messages?.length : 0);

  ngOnInit(): void {

  }
}
