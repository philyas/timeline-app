import {
  Component,
  ElementRef,
  HostListener,
  Input,
  output,
  viewChild,
} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ChangePasswordComponent } from '../../features/auth/change-password/change-password.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [ModalComponent, ChangePasswordComponent],
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
          <span class="user-menu-chevron" [class.open]="open" aria-hidden="true">▼</span>
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
    <app-modal
      [isOpen]="changePasswordModalOpen"
      [compact]="true"
      title="Passwort ändern"
      (closed)="closeChangePasswordModal()"
    >
      @if (changePasswordModalOpen) {
        <app-change-password [modalMode]="true" (closed)="closeChangePasswordModal()" />
      }
    </app-modal>
  `,
  styles: [`
    .user-menu {
      position: relative;
    }
    .user-menu-trigger {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 0.75rem;
      min-height: var(--touch-min);
      border: none;
      background: none;
      color: var(--text-secondary);
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      border-radius: var(--radius-sm);
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
      font-size: 0.6rem;
      opacity: 0.7;
      transition: transform 0.2s;
    }
    .user-menu-chevron.open {
      transform: rotate(180deg);
    }
    .user-menu-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.25rem;
      min-width: 180px;
      background: var(--bg-card);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-hover);
      border: 1px solid var(--border-light);
      padding: 0.25rem;
      z-index: 10;
    }
    .user-menu-item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.5rem 0.75rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      text-decoration: none;
      -webkit-tap-highlight-color: transparent;
      transition: color 0.2s, background 0.2s;
    }
    .user-menu-item:hover {
      color: var(--accent);
      background: var(--accent-soft);
    }
    .user-menu-item--logout {
      color: var(--text-secondary);
    }
    .user-menu-email {
      padding: 0.4rem 0.75rem 0.25rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 0.15rem;
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
      gap: 0.35rem;
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
      padding: 0.5rem 0.75rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: color 0.2s, background 0.2s;
    }
    .user-inline-btn:hover {
      color: var(--accent);
      background: var(--accent-soft);
    }
    .user-inline-btn--logout:hover {
      color: var(--text-secondary);
    }
  `],
})
export class UserMenuComponent {
  @Input() inlineMode = false;

  private menuHost = viewChild<ElementRef<HTMLElement>>('menuHost');
  open = false;

  readonly menuAction = output<void>();

  changePasswordModalOpen = false;

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
    this.changePasswordModalOpen = true;
    this.menuAction.emit();
  }

  closeChangePasswordModal(): void {
    this.changePasswordModalOpen = false;
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
