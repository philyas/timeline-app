import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, UserMenuComponent],
  template: `
    <header class="header">
      <div class="container header-inner">
        <a routerLink="/" class="logo" (click)="closeMenu()">
          <span class="logo-text">Timeline</span>
        </a>
        <button
          type="button"
          class="menu-btn"
          [class.open]="menuOpen"
          (click)="toggleMenu()"
          [attr.aria-expanded]="menuOpen"
          [attr.aria-label]="menuOpen ? 'Menü schließen' : 'Menü öffnen'"
        >
          <span class="menu-icon"></span>
        </button>
        <div class="nav-wrap" [class.open]="menuOpen">
          <nav class="nav">
            @if (auth.isLoggedIn()) {
              <a routerLink="/timelines" routerLinkActive="active" (click)="closeMenu()">Zeitstrahlen</a>
              <a routerLink="/important" routerLinkActive="active" (click)="closeMenu()">Wichtige Ereignisse</a>
            } @else {
              <a routerLink="/login" routerLinkActive="active" (click)="closeMenu()">Anmelden</a>
            }
          </nav>
          @if (auth.isLoggedIn()) {
            <div class="header-user">
              <app-user-menu [inlineMode]="menuOpen" (menuAction)="closeMenu()" />
            </div>
          }
        </div>
      </div>
      @if (menuOpen) {
        <div class="nav-overlay" (click)="closeMenu()" role="button" tabindex="0" aria-label="Menü schließen"></div>
      }
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(251, 251, 253, 0.8);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    }
    @media (max-width: 599px) {
      .header { padding-top: env(safe-area-inset-top); }
      .header-inner { min-height: 52px; }
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: var(--header-height);
      position: relative;
    }
    .logo {
      text-decoration: none;
      padding: 0.5rem 0;
      min-height: var(--touch-min);
      display: inline-flex;
      align-items: center;
      -webkit-tap-highlight-color: transparent;
      transition: opacity 0.2s;
    }
    .logo:hover { text-decoration: none; opacity: 0.8; }
    .logo-text {
      font-weight: 600;
      font-size: 1.25rem;
      letter-spacing: -0.03em;
      color: var(--text);
    }

    .menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      border-radius: 12px;
      transition: background 0.2s;
    }
    .menu-btn:hover { background: rgba(0, 0, 0, 0.05); }
    .menu-icon {
      width: 20px;
      height: 2px;
      background: var(--text);
      position: relative;
      transition: background 0.2s;
    }
    .menu-icon::before,
    .menu-icon::after {
      content: '';
      position: absolute;
      left: 0;
      width: 20px;
      height: 2px;
      background: var(--text);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .menu-icon::before { top: -6px; }
    .menu-icon::after { top: 6px; }
    .menu-btn.open .menu-icon { background: transparent; }
    .menu-btn.open .menu-icon::before { top: 0; transform: rotate(45deg); }
    .menu-btn.open .menu-icon::after { top: 0; transform: rotate(-45deg); }

    .nav-wrap {
      display: none;
      gap: 0.5rem;
      align-items: center;
    }
    .nav {
      display: flex;
      gap: 0.125rem;
      align-items: center;
    }
    .nav a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9375rem;
      font-weight: 500;
      padding: 0.5rem 0.875rem;
      min-height: 36px;
      display: flex;
      align-items: center;
      border-radius: 10px;
      -webkit-tap-highlight-color: transparent;
      transition: color 0.2s, background 0.2s;
    }
    .nav a:hover { color: var(--text); background: rgba(0, 0, 0, 0.04); text-decoration: none; }
    .nav a.active { color: var(--link); background: var(--accent-soft); font-weight: 600; }

    .header-user { flex-shrink: 0; }

    @media (max-width: 599px) {
      .nav-wrap { gap: 0; }
      .nav { gap: 0; }
      .nav a { padding: 0.75rem 1rem; min-height: 48px; border-radius: 12px; }
      .nav-wrap.open {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        position: absolute;
        top: 100%;
        left: var(--container-padding);
        right: var(--container-padding);
        margin-top: 0.5rem;
        background: rgba(255, 255, 255, 0.94);
        backdrop-filter: blur(20px);
        border-radius: var(--radius);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        border: 1px solid var(--border-light);
        padding: 0.5rem;
      }
      .nav-wrap.open .header-user {
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border-light);
      }
      .nav-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.2);
        z-index: -1;
        backdrop-filter: blur(2px);
      }
    }

    @media (min-width: 600px) {
      .menu-btn { display: none; }
      .nav-wrap { display: flex; }
    }
  `],
})
export class AppHeaderComponent {
  menuOpen = false;

  constructor(protected auth: AuthService) {}

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
