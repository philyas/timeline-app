import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app">
      <header class="header">
        <div class="container header-inner">
          <a routerLink="/" class="logo" (click)="closeMenu()">Timeline</a>
          <button type="button" class="menu-btn" [class.open]="menuOpen" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen" [attr.aria-label]="menuOpen ? 'Menü schließen' : 'Menü öffnen'">
            <span class="menu-icon"></span>
          </button>
          <nav class="nav" [class.open]="menuOpen">
            <a routerLink="/timelines" routerLinkActive="active" (click)="closeMenu()">Zeitstrahlen</a>
            <a routerLink="/important" routerLinkActive="active" (click)="closeMenu()">Wichtige Ereignisse</a>
          </nav>
        </div>
        @if (menuOpen) {
          <div class="nav-overlay" (click)="closeMenu()" role="button" tabindex="0" aria-label="Menü schließen"></div>
        }
      </header>
      <main class="main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app { min-height: 100%; display: flex; flex-direction: column; position: relative; z-index: 1; }
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

    .nav { display: none; gap: 0; }
    .nav a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9375rem;
      font-weight: 500;
      padding: 0.6rem 1rem;
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

    @media (max-width: 599px) {
      .nav.open {
        display: flex;
        flex-direction: column;
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
      .nav-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.15);
        z-index: -1;
      }
    }

    @media (min-width: 600px) {
      .menu-btn { display: none; }
      .nav { display: flex; gap: 0.25rem; }
      .nav a { padding: 0.5rem 0.9rem; }
    }

    .main { flex: 1; padding: var(--space-xl) 0; }
    @media (min-width: 600px) {
      .main { padding: var(--space-2xl) 0; }
    }
  `],
})
export class AppComponent {
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
