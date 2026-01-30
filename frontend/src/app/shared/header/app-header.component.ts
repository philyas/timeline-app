import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, UserMenuComponent],
  template: `
    <header class="header">
      <!-- Sticky Bar: Logo + Hamburger (mobil) / Nav (desktop) -->
      <div class="header-bar">
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
          <!-- Desktop: Inline-Nav + User-Menü -->
          <div class="nav-desktop-wrap">
            <nav class="nav nav--desktop">
              @if (auth.isLoggedIn()) {
                <a routerLink="/timelines" routerLinkActive="active" (click)="closeMenu()">Zeitstrahlen</a>
                <a routerLink="/important" routerLinkActive="active" (click)="closeMenu()">Wichtige Ereignisse</a>
              } @else {
                <a routerLink="/login" routerLinkActive="active" (click)="closeMenu()">Anmelden</a>
              }
            </nav>
            @if (auth.isLoggedIn()) {
              <div class="header-user">
                <app-user-menu [inlineMode]="false" (menuAction)="closeMenu()" (openChangePassword)="onOpenChangePassword()" />
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Mobil: Backdrop (klickbar zum Schließen) -->
      <div
        class="side-drawer-backdrop"
        [class.is-open]="menuOpen"
        (click)="closeMenu()"
        role="button"
        tabindex="-1"
        aria-label="Menü schließen"
        [attr.aria-hidden]="!menuOpen"
      ></div>

      <!-- Mobil: Side-Drawer von rechts -->
      <aside
        class="side-drawer"
        [class.is-open]="menuOpen"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="'Navigation'"
        [attr.aria-hidden]="!menuOpen"
      >
        <nav class="side-drawer-nav">
          @if (auth.isLoggedIn()) {
            <a routerLink="/timelines" routerLinkActive="active" (click)="closeMenu()">Zeitstrahlen</a>
            <a routerLink="/important" routerLinkActive="active" (click)="closeMenu()">Wichtige Ereignisse</a>
          } @else {
            <a routerLink="/login" routerLinkActive="active" (click)="closeMenu()">Anmelden</a>
          }
        </nav>
        @if (auth.isLoggedIn()) {
          <div class="side-drawer-user">
            <app-user-menu
              [inlineMode]="true"
              (menuAction)="closeMenu()"
              (openChangePassword)="onOpenChangePassword()"
            />
          </div>
        }
      </aside>
    </header>
  `,
  styles: [`
    /* ---- Header Bar (sticky) ---- */
    .header {
      position: relative;
    }
    .header-bar {
      position: sticky;
      top: 0;
      z-index: 200;
      background: rgba(251, 251, 253, 0.8);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    }
    @media (max-width: 599px) {
      .header-bar { padding-top: env(safe-area-inset-top); }
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: var(--header-height);
      gap: var(--space-sm);
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

    /* ---- Hamburger (nur Mobil) ---- */
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

    /* ---- Desktop-Nav (ab 600px) ---- */
    .nav-desktop-wrap {
      display: none;
      align-items: center;
      gap: 0.5rem;
    }
    .nav--desktop {
      display: flex;
      gap: 0.125rem;
      align-items: center;
    }
    .nav--desktop a,
    .side-drawer-nav a {
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
    .nav--desktop a:hover,
    .side-drawer-nav a:hover {
      color: var(--text);
      background: rgba(0, 0, 0, 0.04);
      text-decoration: none;
    }
    .nav--desktop a.active,
    .side-drawer-nav a.active {
      color: var(--link);
      background: var(--accent-soft);
      font-weight: 600;
    }
    .header-user { flex-shrink: 0; }

    @media (min-width: 600px) {
      .menu-btn { display: none; }
      .nav-desktop-wrap { display: flex; }
    }

    /* ---- Mobil: Backdrop ---- */
    .side-drawer-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 210;
      background: rgba(0, 0, 0, 0.4);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.25s ease, visibility 0.25s;
      -webkit-tap-highlight-color: transparent;
    }
    .side-drawer-backdrop.is-open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    /* ---- Mobil: Side-Drawer (rechts nach links) ---- */
    .side-drawer {
      display: none;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 220;
      width: min(300px, 88vw);
      max-width: 100%;
      background: var(--bg-card);
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
      border-left: 1px solid var(--border-light);
      padding: calc(env(safe-area-inset-top) + var(--space-lg)) var(--space-lg) calc(env(safe-area-inset-bottom) + var(--space-lg));
      flex-direction: column;
      transform: translateX(100%);
      visibility: hidden;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.25s;
      overflow-y: auto;
    }
    .side-drawer.is-open {
      transform: translateX(0);
      visibility: visible;
    }
    .side-drawer-nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .side-drawer-nav a {
      padding: 0.75rem 1rem;
      min-height: 48px;
      border-radius: 12px;
      font-size: 1rem;
    }
    .side-drawer-user {
      margin-top: auto;
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border-light);
    }

    @media (max-width: 599px) {
      .side-drawer-backdrop,
      .side-drawer {
        display: block;
      }
      .side-drawer {
        display: flex;
      }
    }

    @media (min-width: 600px) {
      .side-drawer-backdrop,
      .side-drawer { display: none !important; }
    }
  `],
})
export class AppHeaderComponent {
  menuOpen = false;

  @Output() openChangePassword = new EventEmitter<void>();

  constructor(protected auth: AuthService) {}

  private updateBodyScrollLock(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('side-drawer-open', this.menuOpen);
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.updateBodyScrollLock();
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.updateBodyScrollLock();
  }

  onOpenChangePassword(): void {
    this.closeMenu();
    this.openChangePassword.emit();
  }
}
