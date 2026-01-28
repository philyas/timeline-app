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
        <a routerLink="/" class="logo" (click)="closeMenu()">Timeline</a>
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
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-light);
      box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset;
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%);
      opacity: 0.85;
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: var(--header-height);
      position: relative;
    }
    .logo {
      font-weight: 700;
      font-size: 1.35rem;
      letter-spacing: -0.03em;
      color: var(--text);
      text-decoration: none;
      padding: 0.5rem 0;
      min-height: var(--touch-min);
      display: inline-flex;
      align-items: center;
      -webkit-tap-highlight-color: transparent;
      transition: color 0.2s;
    }
    .logo:hover { text-decoration: none; color: var(--accent); }

    .menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--touch-min);
      height: var(--touch-min);
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      border-radius: var(--radius-sm);
      transition: background 0.2s;
    }
    .menu-btn:hover { background: var(--accent-soft); }
    .menu-icon {
      width: 22px;
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
      width: 22px;
      height: 2px;
      background: var(--text);
      transition: transform 0.25s ease;
    }
    .menu-icon::before { top: -7px; }
    .menu-icon::after { top: 7px; }
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
      gap: 0.25rem;
      align-items: center;
    }
    .nav a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9375rem;
      font-weight: 500;
      padding: 0.5rem 0.9rem;
      min-height: var(--touch-min);
      display: flex;
      align-items: center;
      border-radius: var(--radius-sm);
      -webkit-tap-highlight-color: transparent;
      transition: color 0.2s, background 0.2s;
    }
    .nav a:hover, .nav a.active { color: var(--accent); background: var(--accent-soft); }
    .nav a:hover { text-decoration: none; }
    .nav a.active { font-weight: 600; }

    .header-user {
      flex-shrink: 0;
    }
    @media (max-width: 599px) {
      .nav-wrap { gap: 0; }
      .nav { gap: 0; }
      .nav a { padding: 0.6rem 1rem; }
      .nav-wrap.open {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        position: absolute;
        top: 100%;
        left: var(--container-padding);
        right: var(--container-padding);
        margin-top: 0.5rem;
        background: var(--bg-card);
        border-radius: var(--radius);
        box-shadow: var(--shadow-hover);
        padding: 0.5rem;
        border: 1px solid var(--border-light);
      }
      .nav-wrap.open .header-user {
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border-light);
      }
      .nav-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.15);
        z-index: -1;
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
