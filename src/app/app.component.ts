import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { addSampleData, persistData, retrienveData as retrieveData } from './data/context';
import { Conversation } from './data/models';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PromptComponent } from './prompt/prompt.component';
import { ResponsesComponent } from './responses/responses.component';
import { SideBarComponent } from './side-bar/side-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SideBarComponent, HeaderComponent, FooterComponent, PromptComponent, ResponsesComponent, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ai-chat';
  selectedIndex = 0;
  conversations: Conversation[] = [];
  conversation: Conversation = {};

  key_conversations = 'conversations';
  key_responses_id = 'responses';


  ngOnInit(): void {
    this.conversations = retrieveData(this.key_conversations) as Conversation[];
    if (!this.conversations || this.conversations.length === 0) {
      console.log(this.conversations);
      this.conversations = addSampleData();
    }
    this.conversation = this.conversations[this.selectedIndex];

    this.scrollBottom();
  }

  scrollBottom(timeout: number = 1000) {
    setTimeout(() => {
      const responses = document.getElementById(this.key_responses_id);
      responses!.scrollTop = responses!.scrollHeight;
    }, timeout);
  }

  onSend(text: string) {
    if (!this.conversation.messages)
      this.conversation.messages = [];
    this.conversation.messages.push({ text: text, role: 1, on: new Date() });
    this.conversations[this.selectedIndex] = this.conversation!;
    persistData(this.key_conversations, this.conversations);
    this.scrollBottom(1);
  }

  onSelect(conversation: Conversation) {
    this.conversation = conversation;
    this.selectedIndex = this.conversations.indexOf(conversation);
    this.scrollBottom(100);
  }

  onNew() {
    const conversation: Conversation = { messages: [], title: 'New Conversation', id: this.conversations.length + 1, on: new Date() };
    this.conversations.unshift(conversation);
    this.conversation = conversation;
  }
}
