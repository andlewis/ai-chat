import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { addSampleData, persistData, retrienveData as retrieveData } from './data/context';
import { Config, Conversation, Message } from './data/models';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PromptComponent } from './prompt/prompt.component';
import { ResponsesComponent } from './responses/responses.component';
import { SideBarComponent } from './side-bar/side-bar.component';

import { AzureOpenAI } from "openai";
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionUserMessageParam } from 'openai/resources/index.mjs';

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
  conversation: Conversation = new Conversation();
  config: Config = {};
  error: any = null;
  isLoading = false;

  key_conversations = 'conversations';
  key_config = 'config';
  key_responses_id = 'responses';


  ngOnInit(): void {
    this.config = retrieveData(this.key_config) as Config ?? new Config();
    this.conversations = retrieveData(this.key_conversations) as Conversation[];
    if (!this.conversations || this.conversations.length === 0) {
      console.log(this.conversations);
      this.conversations = addSampleData();
    }
    this.conversations.forEach(element => {
      if (!element.messages) {
        element.messages = [];
      }
    });
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
    this.conversation.messages.push({ content: text, role: 'user', on: new Date() });
    this.isLoading = true;
    this.scrollBottom(1);
    const p: ChatCompletionCreateParamsNonStreaming = {
      messages: this.conversation.messages.map(m => ({ role: m.role, content: m.content } as ChatCompletionUserMessageParam)),
      model: this.config.deployment!
    };

    this.backend(p);


  }

  backend(p: any) {
    const client = new AzureOpenAI({ apiKey: this.config.apiKey, endpoint: this.config.endpoint, apiVersion: this.config.apiVersion, dangerouslyAllowBrowser: true });

    client.chat.completions.create(p).then((response) => {
      this.isLoading = false;
      this.conversation.messages!.push({ content: response.choices[0].message.content ?? '', role: 'system', on: new Date() });
      this.conversations[this.selectedIndex] = this.conversation!;
      this.scrollBottom(1);
      this.onSummarize();
    }).catch((error) => {
      if (error.code == '429') {
        console.log('Retrying...');
        setTimeout(() => this.backend(p), 5000);
      } else {
        this.error = error;
        this.isLoading = false;
      }
    });
  }

  onSummarize() {
    const c = this.conversation.messages.map(m => m.role + ': ' + m.content).join('\n');

    const p: ChatCompletionCreateParamsNonStreaming = {
      messages: [{ role: 'user', content: 'summarize the following conversation: \n' + c } as ChatCompletionUserMessageParam],
      model: this.config.deployment!
    };

    const client = new AzureOpenAI({ apiKey: this.config.apiKey, endpoint: this.config.endpoint, apiVersion: this.config.apiVersion, dangerouslyAllowBrowser: true });

    client.chat.completions.create(p).then((response) => {
      this.isLoading = false;
      this.conversation.title = response.choices[0].message.content ?? '';
      persistData(this.key_conversations, this.conversations);
    }).catch((error) => {
      if (error.code == '429') {
        alert('too many questions');
      }
    });
  }

  onSelect(conversation: Conversation) {
    this.isLoading = false;
    this.conversation = conversation;
    this.selectedIndex = this.conversations.indexOf(conversation);
    this.scrollBottom(100);

  }

  onNew() {
    const conversation: Conversation = { messages: new Array<Message>(), title: 'New Conversation', id: this.conversations.length + 1, on: new Date() };
    this.conversations.unshift(conversation);
    this.conversation = conversation;
  }

}
