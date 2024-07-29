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
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionTool, ChatCompletionUserMessageParam, ImageGenerateParams } from 'openai/resources/index.mjs';
import { AssistantsClient, AzureKeyCredential, RequiredFunctionToolCall, ThreadMessage, ToolDefinition } from '@azure/openai-assistants';
import { Thread } from 'openai/resources/beta/threads/threads.mjs';
import { RequestOptions } from 'openai/core.mjs';

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
  isExpanded = false;

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
    this.isExpanded = !this.isMobile();
    this.scrollBottom();
  }

  isMobile(): boolean {
    var ua = navigator.userAgent;
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua));
  }

  scrollBottom(timeout: number = 1000, resetLoading: boolean = false) {
    setTimeout(() => {
      const responses = document.getElementById(this.key_responses_id);
      responses!.scrollTop = responses!.scrollHeight;
      if (resetLoading) {
        this.isLoading = false;
      }
    }, timeout);
  }

  async onSend(text: string) {
    this.conversation.messages.push({ content: text, role: 'user', on: new Date() });
    this.isLoading = true;
    this.scrollBottom(1, false);
    const p: ChatCompletionCreateParamsNonStreaming = {
      messages: this.conversation.messages.map(m => ({ role: m.role, content: m.content } as ChatCompletionUserMessageParam)),
      model: this.config.deployment!,
      tools: this.getTools().map((t: any) => ({ function: t.function, type: 'function' }))
    };

    ////this.GenerateImage(text);
    //await this.GenerateAssistant();
    this.GetCompletion(p);

    this.scrollBottom(100);

    persistData(this.key_conversations, this.conversations);
    setTimeout(() => this.onSummarize(), 9000);
  }

  GetCompletion(p: any) {
    const client = new AzureOpenAI({ apiKey: this.config.apiKey, endpoint: this.config.endpoint, apiVersion: this.config.apiVersion, dangerouslyAllowBrowser: true });

    client.chat.completions.create(p).then((response) => {
      console.log('response', response);
      if (response.choices[0].finish_reason === 'tool_calls') {
        response.choices[0].message!.tool_calls!.forEach(async (toolCall: any) => {
          const content = await this.getResolvedToolOutput(toolCall);
          this.conversation.messages!.push({ content: content.output ?? '', role: 'assistant', on: new Date() });
          persistData(this.key_conversations, this.conversations);
          this.scrollBottom(100, true);
        });
      } else {
        this.conversation.messages!.push({ content: response.choices[0].message.content ?? '', role: 'assistant', on: new Date() });
        persistData(this.key_conversations, this.conversations);
        this.scrollBottom(100, true);
      }
      this.conversations[this.selectedIndex] = this.conversation!;
    }).catch((error) => {
      if (error.code == '429') {
        console.log('Retrying...');
        setTimeout(() => this.GetCompletion(p), 5000);
      } else {
        this.error = error;

      }
    });
  }

  onSummarize() {
    const c = this.conversation.messages.map(m => m.role + ': ' + m.content).join('\n');

    const p: ChatCompletionCreateParamsNonStreaming = {
      messages: [{ role: 'user', content: 'summarize the following conversation in one concise phrase of no more than 7 words: \n' + c } as ChatCompletionUserMessageParam],
      model: this.config.deployment!,
      tools: this.getTools().map((t: any) => ({ function: t.function, type: 'function' }))
    };

    const client = new AzureOpenAI({ apiKey: this.config.apiKey, endpoint: this.config.endpoint, apiVersion: this.config.apiVersion, dangerouslyAllowBrowser: true });

    client.chat.completions.create(p).then(response => {
      this.conversation.title = response.choices[0].message.content ?? '';
      persistData(this.key_conversations, this.conversations);
    }).catch(error => {
      if (error.code == '429') {
        console.log('Retrying Summary...');
        setTimeout(() => this.onSummarize(), 5000);
      }
    });
  }

  async GenerateImage(prompt: string): Promise<string> {
    const p: ImageGenerateParams = {
      prompt: prompt,
      model: this.config.imageDeployment!
    };

    const client = new AzureOpenAI({ apiKey: this.config.imageApiKey, endpoint: this.config.imageEndpoint, apiVersion: this.config.apiVersion, dangerouslyAllowBrowser: true });

    const response = await client.images.generate(p);

    const content = `Here's an image I generated, based on this prompt: ${response.data[0].revised_prompt}\n\n<img src="${response.data[0].url}" class="img-fluid img-thumbnail" style="max-width:50%"/>`;

    return content;
  }

  onSelect(conversation: Conversation) {
    this.isLoading = false;
    this.error = null;
    this.conversation = conversation;
    this.selectedIndex = this.conversations.indexOf(conversation);
    this.scrollBottom(100);

  }

  onDeleteConversation(conversation: Conversation) {
    const index = this.conversations.indexOf(conversation);
    this.conversations.splice(index, 1);
    if (this.selectedIndex === index) {
      this.selectedIndex = 0;
      this.conversation = this.conversations[this.selectedIndex];
    }
    persistData(this.key_conversations, this.conversations);
  }

  onDeleteMessage(message: Message) {
    const index = this.conversation.messages.indexOf(message);
    this.conversation.messages.splice(index, 1);
    persistData(this.key_conversations, this.conversations);
  }

  onNew() {
    const conversation: Conversation = { messages: new Array<Message>(), title: 'New Conversation', id: this.conversations.length + 1, on: new Date() };
    this.conversations.unshift(conversation);
    this.conversation = conversation;
  }

  onToggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  getTools(): ToolDefinition[] {
    const imageGenerationTool: ToolDefinition = {
      type: 'function',
      function: {
        name: 'generateImage',
        description: 'Generates an image and returns markdown containing the image prompt and url.',
        parameters: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The prompt to generate the image from'
            }
          }
        }
      }
    };

    const tools: ToolDefinition[] = [];
    if (!!this.config.imageApiKey) {
      tools.push(imageGenerationTool);
    }

    return tools;
  }

  async GenerateAssistant() {

    const assistantsClient = new AssistantsClient(this.config.endpoint!, new AzureKeyCredential(this.config.apiKey!));



    const assistant = await assistantsClient.createAssistant({
      model: this.config.deployment!,
      name: 'MyAssistant',
      instructions: 'You are a general AI assistant. Use the provided functions to help respond to user queries.',
      tools: this.getTools()
    });

    let runResponse = await assistantsClient.createThreadAndRun({
      assistantId: assistant.id, thread: { messages: this.conversation.messages.map(m => ({ role: m.role!, content: m.content! })) }, tools: this.getTools()
    });

    do {
      await new Promise((resolve) => setTimeout(resolve, 500));
      runResponse = await assistantsClient.getRun(runResponse.threadId, runResponse.id);
      console.log('runResponse', runResponse);

      if (runResponse.status === "requires_action" && runResponse.requiredAction!.type === "submit_tool_outputs") {
        const toolOutputs = [];

        for (const toolCall of runResponse.requiredAction!.submitToolOutputs!.toolCalls) {
          toolOutputs.push(await this.getResolvedToolOutput(toolCall));
        }
        runResponse = await assistantsClient.submitToolOutputsToRun(runResponse.threadId, runResponse.id, toolOutputs);
      }
    } while (runResponse.status === "queued" || runResponse.status === "in_progress")

    const runMessages = (await assistantsClient.listMessages(runResponse.threadId));
    this.conversation.messages = [];
    runMessages.data.forEach((x: ThreadMessage) => {
      x.content.forEach((content: any) => {
        console.log(content);
        this.conversation.messages.unshift({ content: (x.content[0] as any).text.value, role: x.role, on: new Date(x.createdAt!) });
      });
    });
    if (runResponse.status === 'failed') {
      this.conversation.messages.push({ content: `I am sorry I'm unable to complete the request.\n` + runResponse.lastError?.message, role: 'assistant', on: new Date() });
    }
    persistData(this.key_conversations, this.conversations);
    this.onSummarize();

    this.scrollBottom(1);
  }

  async getResolvedToolOutput(toolCall: RequiredFunctionToolCall) {
    const toolOutput = { toolCallId: toolCall.id, output: '' };

    if (toolCall["function"]) {
      const functionCall = toolCall["function"];
      const functionName = functionCall.name;
      const functionArgs = JSON.parse(functionCall["arguments"] ?? {});

      console.log('getResolvedToolOutput', functionName, functionArgs);

      switch (functionName) {
        case "generateImage":
          toolOutput.output = await this.GenerateImage(functionArgs.prompt);
          break;
        default:
          toolOutput.output = `Unknown function: ${functionName}`;
          break;
      }
    }
    return toolOutput;
  }


}
