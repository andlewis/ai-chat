import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from './side-bar/side-bar.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { PromptComponent } from './prompt/prompt.component';
import { ResponsesComponent } from './responses/responses.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SideBarComponent, HeaderComponent, FooterComponent, PromptComponent, ResponsesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ai-chat';

  ngOnInit(): void {
    setTimeout(() => {
    const responses = document.getElementById("responses");
    responses!.scrollTop = responses!.scrollHeight;
    }, 1000);
  }
}
