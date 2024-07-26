import { Component, EventEmitter, output, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.scss'
})
export class PromptComponent {
  send = output<string>();

  text:string = '';

  onClickSend(){
    this.send.emit(this.text);
    this.text = '';
  }

  onKeyUp(event: KeyboardEvent){
    if(event.key === 'Enter')
      this.onClickSend();
  }
}
