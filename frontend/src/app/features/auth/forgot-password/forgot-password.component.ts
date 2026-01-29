import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <header class="auth-header">
            <h1>Passwort vergessen</h1>
            <p class="auth-subtitle">Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link zum Zurücksetzen.</p>
          </header>

          @if (error) {
            <div class="auth-error">{{ error }}</div>
          }
          @if (success) {
            <div class="auth-success">{{ success }}</div>
          }

          @if (!success) {
            <form (ngSubmit)="onSubmit()" class="auth-form">
              <label class="label">E-Mail</label>
              <input type="email" name="email" [(ngModel)]="email" required placeholder="deine@email.de" />
              <div class="auth-actions">
                <button type="submit" [disabled]="saving">{{ saving ? 'Wird gesendet…' : 'Link senden' }}</button>
              </div>
            </form>
          } @else {
            <div class="auth-actions" style="margin-top: 1rem;">
              <a routerLink="/login" class="btn" style="width: 100%; text-align: center;">Zurück zum Login</a>
            </div>
          }

          <p class="auth-footer">
            <a routerLink="/login">← Zurück zum Login</a>
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
    .auth-container { width: 100%; max-width: 420px; }
    .auth-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: var(--radius);
      box-shadow: var(--shadow-hover);
      border: 1px solid var(--border-light);
      padding: var(--space-xl);
    }
    .auth-header { margin-bottom: var(--space-lg); }
    .auth-header h1 { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.03em; margin-bottom: 0.5rem; }
    .auth-subtitle { color: var(--text-secondary); font-size: 1rem; margin: 0; line-height: 1.5; }
    .auth-error {
      padding: 0.75rem 1rem;
      background: rgba(196, 30, 58, 0.08);
      color: #c41e3a;
      border-radius: var(--radius-sm);
      font-size: 0.9375rem;
      font-weight: 500;
      margin-bottom: var(--space-md);
    }
    .auth-success {
      padding: 0.75rem 1rem;
      background: var(--accent-soft);
      color: var(--accent);
      border-radius: var(--radius-sm);
      font-size: 0.9375rem;
      font-weight: 500;
      margin-bottom: var(--space-md);
    }
    .auth-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .auth-actions { display: flex; flex-direction: column; gap: var(--space-sm); margin-top: 0.5rem; }
    .auth-actions button, .auth-actions .btn { width: 100%; }
    .auth-footer {
      margin-top: var(--space-xl);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border-light);
      text-align: center;
    }
    .auth-footer a { font-size: 0.9375rem; color: var(--text-secondary); }
    .auth-footer a:hover { color: var(--accent); }
  `],
})
export class ForgotPasswordComponent {
  email = '';
  error: string | null = null;
  success: string | null = null;
  saving = false;

  constructor(private auth: AuthService) {}

  onSubmit(): void {
    this.error = null;
    if (!this.email.trim()) {
      this.error = 'E-Mail eingeben.';
      return;
    }
    this.saving = true;
    this.auth.forgotPassword(this.email.trim()).subscribe({
      next: (res) => {
        this.success = res.message;
        this.saving = false;
      },
      error: (err) => {
        this.error = err?.error?.error ?? 'Anfrage fehlgeschlagen.';
        this.saving = false;
      },
    });
  }
}
