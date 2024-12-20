import { Component, EventEmitter, input, output, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Config } from '../data/models';

@Component({
    selector: 'app-prompt',
    imports: [FormsModule],
    templateUrl: './prompt.component.html',
    styleUrl: './prompt.component.scss'
})
export class PromptComponent {
  config = input.required<Config>();
  isDarkMode = input.required<boolean>();
  send = output<string>();
  isListening = false;
  text: string = '';

  validChatConfig(): boolean {
    return !!this.config().deployment && !!this.config().apiKey && !!this.config().apiVersion && !!this.config().endpoint;
  }

  validImageConfig(): boolean {
    return !!this.config().imageDeployment && !!this.config().imageApiKey && !!this.config().imageEndpoint;
  }

  onClickSend() {
    this.send.emit(this.text);
    this.text = '';
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter')
      this.onClickSend();
  }

  onClickMicrophone(){
    if(!this.isListening){
      const navigator = window.navigator as any;
      const constraints = { audio: true, video: false };
      navigator.mediaDevices.getUserMedia(constraints).then((stream:any) => {
        console.log('Microphone is ready');
        this.isListening = !this.isListening;
      });
    } else {
      this.isListening = !this.isListening;
    }
  }

}
