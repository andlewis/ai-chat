import { Component, OnInit } from '@angular/core';
import { persistData, retrienveData as retrieveData } from './data/context';
import { Config, Conversation, Message } from './data/models';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PromptComponent } from './prompt/prompt.component';
import { ResponsesComponent } from './responses/responses.component';
import { SideBarComponent } from './side-bar/side-bar.component';

import { AssistantsClient, AzureKeyCredential, RequiredFunctionToolCall, ThreadMessage, ToolDefinition } from '@azure/openai-assistants';
import { AzureOpenAI } from "openai";
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionUserMessageParam, ImageGenerateParams } from 'openai/resources/index.mjs';
import { WelcomeComponent } from './welcome/welcome.component';

@Component({
  selector: 'app-root',
  imports: [SideBarComponent, HeaderComponent, FooterComponent, PromptComponent, ResponsesComponent, WelcomeComponent],
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
  isDarkMode = true;

  key_conversations = 'conversations';
  key_config = 'config';
  key_responses_id = 'responses';


  ngOnInit(): void {
    this.isExpanded = !this.isMobile();
    this.load();
    this.conversation = this.conversations[this.selectedIndex];
    this.scrollBottom();
  }

  isMobile(): boolean {
    var ua = navigator.userAgent;
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua));
  }

  load() {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.setTheme();
    this.config = retrieveData(this.key_config) as Config ?? new Config();
    this.conversations = retrieveData(this.key_conversations) as Conversation[];
    if (!this.conversations || this.conversations.length == 0) {
      this.isExpanded = false;
    }

    if (!this.conversations || this.conversations.length === 0) {
      this.conversations = [];
      //this.conversations = addSampleData();
    }
    this.conversations.forEach(element => {
      if (!element.messages) {
        element.messages = [];
      }
    });
  }

  scrollBottom(timeout: number = 1000, resetLoading: boolean = false) {
    setTimeout(() => {
      const responses = document.getElementById(this.key_responses_id);
      if (responses) {
        responses!.scrollTop = responses!.scrollHeight;
      }
      if (resetLoading) {
        this.isLoading = false;
      }
    }, timeout);
  }

  onToggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;

    this.setTheme();

  }

  setTheme() {
    let theme = this.isDarkMode ? 'dark' : 'light'
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }

  async onSend(text: string) {
    if (!this.conversation) {
      this.onNew();
    }
    this.conversation.messages.push({ content: text, role: 'user', on: new Date() });
    this.isLoading = true;
    this.scrollBottom(1, false);
    const p: ChatCompletionCreateParamsNonStreaming = {
      messages: this.conversation.messages.map(m => ({ role: m.role, content: m.content } as ChatCompletionUserMessageParam)),
      model: this.config.deployment!,
      tools: this.getTools()?.map((t: any) => ({ function: t.function, type: 'function' }))
    };

    ////this.GenerateImage(text);
    //await this.GenerateAssistant();
    this.GetCompletion(p);

    this.scrollBottom(100);

    persistData(this.key_conversations, this.conversations);
    setTimeout(() => this.onSummarize(), 9000);
    this.scrollBottom(5000);
  }

  GetCompletion(p: any) {
    const client = new AzureOpenAI({ apiKey: this.config.apiKey, endpoint: this.config.endpoint, apiVersion: this.config.apiVersion, dangerouslyAllowBrowser: true });

    client.chat.completions.create(p).then((response) => {
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
        this.error = null;
      }
      this.conversations[this.selectedIndex] = this.conversation!;
    }).catch((error) => {
      if (error.code == '429') {
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
      tools: this.getTools()?.map((t: any) => ({ function: t.function, type: 'function' }))
    };

    const client = new AzureOpenAI({ apiKey: this.config.apiKey, endpoint: this.config.endpoint, apiVersion: this.config.apiVersion, dangerouslyAllowBrowser: true });

    client.chat.completions.create(p).then(response => {
      this.conversation.title = response.choices[0].message.content ?? '';
      if (this.conversation.title.length > 200) {
        this.conversation.title = this.conversation.title.substring(0, 200) + '...';
      }
      persistData(this.key_conversations, this.conversations);
    }).catch(error => {
      if (error.code == '429') {
        setTimeout(() => this.onSummarize(), 5000);
      }
    });
  }

  onClear() {
    persistData(this.key_conversations, []);
    persistData(this.key_config, new Config());
    this.load();
    this.conversation = this.conversations[this.selectedIndex];
  }

  async GenerateImage(prompt: string): Promise<string> {
    const p: ImageGenerateParams = {
      prompt: prompt,
      model: this.config.imageDeployment!
    };

    const client = new AzureOpenAI({ apiKey: this.config.imageApiKey, endpoint: this.config.imageEndpoint, apiVersion: this.config.apiVersion, dangerouslyAllowBrowser: true });

    const response = await client.images.generate(p);

    const content = `Here's an image I generated. Please remember that images are only kept for 24 hours, so if you want to keep it, save it locally. I also updated your prompt to this: ${response.data[0].revised_prompt}\n\n<img src="${response.data[0].url}" class="img-fluid img-thumbnail" style="max-width:50%"/>`;

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

  onConfigChange(config: Config) {
    //this.config = config;
  }

  getTools(): ToolDefinition[] | undefined {
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
      return tools;
    }

    return undefined;
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
