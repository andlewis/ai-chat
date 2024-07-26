import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-responses',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './responses.component.html',
  styleUrl: './responses.component.scss'
})
export class ResponsesComponent implements OnInit {
  responses: Array<{ name: string, response: string, role: number, on: Date }> = [
    { name: 'Alice', response: 'Hello!', role: 1, on: new Date() },
    { name: 'Bob', response: 'Hi!', role: 2, on: new Date() },
    { name: 'Alice', response: 'How are you?', role: 1, on: new Date() },
    { name: 'Bob', response: 'Good, thanks!', role: 2, on: new Date() },
    { name: 'Alice', response: 'What are you doing?', role: 1, on: new Date() },
    { name: 'Bob', response: 'I am working on my project.', role: 2, on: new Date() },
    { name: 'Alice', response: 'That\'s cool!', role: 1, on: new Date() },
    { name: 'Bob', response: 'Thanks!', role: 2, on: new Date() },
    { name: 'Alice', response: 'Bye!', role: 1, on: new Date() },
    { name: 'Bob', response: 'Goodbye!', role: 2, on: new Date() },
  ];

  ngOnInit(): void {

  }
}
