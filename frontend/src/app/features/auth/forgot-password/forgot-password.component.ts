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
    <div class="container">
      <div class="auth-card card">
        <header class="page-intro">
          <h1>Passwort vergessen</h1>
          <p class="subtitle">Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link zum Zurücksetzen des Passworts.</p>
        </header>

        @if (error) {
          <p class="error">{{ error }}</p>
        }
        @if (success) {
          <p class="success">{{ success }}</p>
        }

        @if (!success) {
          <form (ngSubmit)="onSubmit()">
            <label class="label">E-Mail</label>
            <input type="email" name="email" [(ngModel)]="email" required placeholder="deine@email.de" />
            <div class="actions">
              <button type="submit" [disabled]="saving">{{ saving ? 'Wird gesendet…' : 'Link senden' }}</button>
            </div>
          </form>
        } @else {
          <div class="actions">
            <a routerLink="/login" class="btn">Zurück zum Login</a>
          </div>
        }

        <p class="auth-footer">
          <a routerLink="/login">← Zurück zum Login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-card { max-width: 420px; margin-left: auto; margin-right: auto; }
    .auth-card .page-intro { margin-bottom: var(--space-md); padding-bottom: var(--space-sm); }
    .auth-card .error { margin-bottom: var(--space-sm); }
    .auth-card .success { margin-bottom: var(--space-sm); color: var(--accent); font-weight: 500; }
    .auth-card form { display: flex; flex-direction: column; gap: var(--space-sm); }
    .actions { display: flex; flex-direction: column; gap: var(--space-sm); margin-top: var(--space-sm); }
    .actions button, .actions a.btn { width: 100%; text-align: center; }
    .auth-footer { margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--border-light); text-align: center; }
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
