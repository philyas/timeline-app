import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppHeaderComponent } from './shared/header/app-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent],
  template: `
    <div class="app">
      <app-header />
      <main class="main" [class.main--auth]="isAuthPage" [class.main--timeline-detail]="isTimelineDetailPage" [class.main--important-events]="isImportantEventsPage">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app { min-height: 100%; display: flex; flex-direction: column; position: relative; z-index: 1; }
    @media (max-width: 599px) {
      .app { min-height: 100dvh; }
    }
    .main { flex: 1; padding: var(--space-xl) 0; }
    @media (min-width: 600px) {
      .main { padding: var(--space-2xl) 0; }
    }
    .main--auth { padding: var(--space-sm) 0; }
    @media (min-width: 600px) {
      .main--auth { padding: var(--space-md) 0; }
    }
    @media (max-width: 599px) {
      .main--timeline-detail,
      .main--important-events {
        flex: 1;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding-top: 0.25rem;
        padding-bottom: 0;
      }
    }
  `],
})
export class AppComponent {
  isAuthPage = false;
  isTimelineDetailPage = false;
  isImportantEventsPage = false;

  constructor(private router: Router) {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
      const u = this.router.url;
      this.isAuthPage = /^\/(login|register|forgot-password|reset-password|verify-email)/.test(u);
      this.isTimelineDetailPage = /^\/timelines\/[^/]+/.test(u);
      this.isImportantEventsPage = /^\/important\/?$/.test(u);
    });
    const u = this.router.url;
    this.isAuthPage = /^\/(login|register|forgot-password|reset-password|verify-email)/.test(u);
    this.isTimelineDetailPage = /^\/timelines\/[^/]+/.test(u);
    this.isImportantEventsPage = /^\/important\/?$/.test(u);
  }
}
