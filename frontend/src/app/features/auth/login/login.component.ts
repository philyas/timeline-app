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
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <header class="auth-header">
            <h1>Anmelden</h1>
            <p class="auth-subtitle">Melde dich mit E-Mail und Passwort an.</p>
          </header>

          @if (error) {
            <div class="auth-error">{{ error }}</div>
          }

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <label class="label">E-Mail</label>
            <input type="email" name="email" [(ngModel)]="email" required placeholder="deine@email.de" />
            <label class="label">Passwort</label>
            <input type="password" name="password" [(ngModel)]="password" required placeholder="••••••••" />
            <div class="auth-actions">
              <a routerLink="/forgot-password" class="auth-link">Passwort vergessen?</a>
              <button type="submit" [disabled]="saving">{{ saving ? 'Wird angemeldet…' : 'Anmelden' }}</button>
            </div>
          </form>

          <p class="auth-footer">
            Noch kein Konto? <a routerLink="/register">Registrieren</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xl) var(--container-padding);
    }
    .auth-container {
      width: 100%;
      max-width: 420px;
    }
    .auth-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: var(--radius);
      box-shadow: var(--shadow-hover);
      border: 1px solid var(--border-light);
      padding: var(--space-xl);
    }
    .auth-header {
      margin-bottom: var(--space-lg);
    }
    .auth-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 0.5rem;
    }
    .auth-subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
      margin: 0;
      line-height: 1.5;
    }
    .auth-error {
      padding: 0.75rem 1rem;
      background: rgba(196, 30, 58, 0.08);
      color: #c41e3a;
      border-radius: var(--radius-sm);
      font-size: 0.9375rem;
      font-weight: 500;
      margin-bottom: var(--space-md);
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .auth-form .label { margin-bottom: 0.25rem; }
    .auth-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      margin-top: 0.5rem;
    }
    .auth-actions button { width: 100%; }
    .auth-link {
      font-size: 0.9375rem;
      color: var(--text-secondary);
    }
    .auth-link:hover { color: var(--accent); }
    .auth-footer {
      margin-top: var(--space-xl);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border-light);
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }
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
