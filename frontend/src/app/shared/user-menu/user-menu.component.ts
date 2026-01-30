import {
  Component,
  ElementRef,
  HostListener,
  Input,
  output,
  viewChild,
} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [],
  template: `
    @if (inlineMode) {
      <div class="user-inline">
        <span class="user-inline-email" title="{{ userEmail }}">{{ userEmail }}</span>
        <button type="button" class="user-inline-btn" (click)="openChangePasswordModal()">Passwort ändern</button>
        <button type="button" class="user-inline-btn user-inline-btn--logout" (click)="onLogout()">Abmelden</button>
      </div>
    } @else {
      <div class="user-menu" #menuHost>
        <button
          type="button"
          class="user-menu-trigger"
          (click)="toggle()"
          [attr.aria-expanded]="open"
          aria-haspopup="true"
          aria-label="Konto-Menü"
        >
          <span class="user-menu-label">{{ displayName }}</span>
          <span class="user-menu-chevron" [class.open]="open" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </span>
        </button>
        @if (open) {
          <div class="user-menu-dropdown" role="menu">
            <div class="user-menu-email" [title]="userEmail">{{ userEmail }}</div>
            <button
              type="button"
              class="user-menu-item"
              role="menuitem"
              (click)="openChangePasswordModal()"
            >
              Passwort ändern
            </button>
            <button
              type="button"
              class="user-menu-item user-menu-item--logout"
              role="menuitem"
              (click)="onLogout()"
            >
              Abmelden
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .user-menu {
      position: relative;
    }
    .user-menu-trigger {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.75rem;
      min-height: 36px;
      border: none;
      background: none;
      color: var(--text-secondary);
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      border-radius: 10px;
      -webkit-tap-highlight-color: transparent;
      transition: color 0.2s, background 0.2s;
    }
    .user-menu-trigger:hover {
      color: var(--accent);
      background: var(--accent-soft);
    }
    .user-menu-label {
      font-weight: 500;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .user-menu-chevron {
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .user-menu-chevron.open {
      transform: rotate(180deg);
    }
    .user-menu-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.375rem;
      min-width: 200px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: var(--radius-sm);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-light);
      padding: 0.375rem;
      z-index: 10;
    }
    .user-menu-item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.625rem 0.875rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: none;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      text-decoration: none;
      -webkit-tap-highlight-color: transparent;
      transition: color 0.2s, background 0.2s;
    }
    .user-menu-item:hover {
      color: var(--accent);
      background: var(--accent-soft);
    }
    .user-menu-item--logout:hover {
      color: var(--text);
      background: var(--border-light);
    }
    .user-menu-email {
      padding: 0.5rem 0.875rem 0.375rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 0.25rem;
    }
    @media (max-width: 599px) {
      .user-menu-dropdown {
        right: auto;
        left: 0;
        min-width: 100%;
      }
    }
    .user-inline {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .user-inline-email {
      font-size: 0.8125rem;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .user-inline-btn {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.625rem 0.875rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: none;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: color 0.2s, background 0.2s;
    }
    .user-inline-btn:hover {
      color: var(--accent);
      background: var(--accent-soft);
    }
    .user-inline-btn--logout:hover {
      color: var(--text);
      background: var(--border-light);
    }
  `],
})
export class UserMenuComponent {
  @Input() inlineMode = false;

  private menuHost = viewChild<ElementRef<HTMLElement>>('menuHost');
  open = false;

  readonly menuAction = output<void>();
  readonly openChangePassword = output<void>();

  constructor(protected auth: AuthService) {}

  get displayName(): string {
    const u = this.auth.user();
    return u?.name || u?.email || 'Benutzer';
  }

  get userEmail(): string {
    const u = this.auth.user();
    return u?.email || u?.name || '';
  }

  toggle(): void {
    this.open = !this.open;
  }

  close(): void {
    this.open = false;
  }

  openChangePasswordModal(): void {
    this.close();
    this.menuAction.emit();
    this.openChangePassword.emit();
  }

  onLogout(): void {
    this.auth.logout();
    this.close();
    this.menuAction.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const host = this.menuHost()?.nativeElement;
    if (this.open && host && !host.contains(event.target as Node)) {
      this.close();
    }
  }
}
