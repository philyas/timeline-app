import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChangePasswordComponent } from './features/auth/change-password/change-password.component';
import { AppHeaderComponent } from './shared/header/app-header.component';
import { ModalComponent } from './shared/modal/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent, ModalComponent, ChangePasswordComponent],
  template: `
    <div class="app">
      <app-header (openChangePassword)="openChangePasswordModal()" />
      <main class="main" [class.main--auth]="isAuthPage" [class.main--timeline-detail]="isTimelineDetailPage" [class.main--important-events]="isImportantEventsPage">
        <router-outlet></router-outlet>
      </main>
      <!-- Passwort-Modal hier, damit der Overlay den ganzen Viewport abdeckt (Header hat backdrop-filter) -->
      @if (changePasswordModalOpen) {
        <app-modal
          [isOpen]="true"
          [compact]="true"
          title="Passwort ändern"
          (closed)="closeChangePasswordModal()"
        >
          <app-change-password [modalMode]="true" (closed)="closeChangePasswordModal()" />
        </app-modal>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      min-height: 100dvh;
    }
    .app {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      position: relative;
      z-index: 1;
    }
    .main {
      flex: 1;
      padding: var(--space-lg) 0;
    }
    @media (min-width: 600px) {
      .main { padding: var(--space-xl) 0; }
    }
    .main--auth { padding: 0; }
    /* Timeline detail & Important events: fill remaining space, no padding */
    .main--timeline-detail,
    .main--important-events {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 0 !important;
    }
  `],
})
export class AppComponent {
  isAuthPage = false;
  isTimelineDetailPage = false;
  isImportantEventsPage = false;
  changePasswordModalOpen = false;

  constructor(private router: Router) {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
      const u = this.router.url;
      this.isAuthPage = /^\/(login|register|forgot-password|reset-password|verify-email|change-password)/.test(u);
      this.isTimelineDetailPage = /^\/timelines\/[^/]+/.test(u);
      this.isImportantEventsPage = /^\/important\/?$/.test(u);
    });
    const u = this.router.url;
    this.isAuthPage = /^\/(login|register|forgot-password|reset-password|verify-email|change-password)/.test(u);
    this.isTimelineDetailPage = /^\/timelines\/[^/]+/.test(u);
    this.isImportantEventsPage = /^\/important\/?$/.test(u);
  }

  openChangePasswordModal(): void {
    this.changePasswordModalOpen = true;
  }

  closeChangePasswordModal(): void {
    this.changePasswordModalOpen = false;
  }
}
