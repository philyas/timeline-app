import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="auth-card card">
        <header class="page-intro">
          <h1>Anmelden</h1>
          <p class="subtitle">Melde dich mit deiner E-Mail und deinem Passwort an.</p>
        </header>

        @if (error) {
          <p class="error">{{ error }}</p>
        }

        <form (ngSubmit)="onSubmit()">
          <label class="label">E-Mail</label>
          <input type="email" name="email" [(ngModel)]="email" required placeholder="deine@email.de" />
          <label class="label">Passwort</label>
          <input type="password" name="password" [(ngModel)]="password" required placeholder="••••••••" />
          <div class="actions">
            <a routerLink="/forgot-password" class="link-forgot">Passwort vergessen?</a>
            <button type="submit" [disabled]="saving">{{ saving ? 'Wird angemeldet…' : 'Anmelden' }}</button>
          </div>
        </form>

        <p class="auth-footer">
          Noch kein Konto? <a routerLink="/register">Registrieren</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-card { max-width: 420px; margin-left: auto; margin-right: auto; }
    .auth-card .page-intro { margin-bottom: var(--space-md); padding-bottom: var(--space-sm); }
    .auth-card .error { margin-bottom: var(--space-sm); }
    .auth-card form { display: flex; flex-direction: column; gap: var(--space-sm); }
    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      margin-top: var(--space-sm);
    }
    .actions button { width: 100%; }
    .link-forgot { font-size: 0.9375rem; color: var(--text-secondary); }
    .link-forgot:hover { color: var(--accent); }
    .auth-footer { margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--border-light); text-align: center; color: var(--text-secondary); font-size: 0.9375rem; }
    .auth-footer a { font-weight: 500; }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  error: string | null = null;
  saving = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    this.error = null;
    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'E-Mail und Passwort eingeben.';
      return;
    }
    this.saving = true;
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/timelines']);
      },
      error: (err) => {
        this.error = err?.error?.error ?? 'Anmeldung fehlgeschlagen.';
        this.saving = false;
      },
    });
  }
}
