import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <header class="auth-header">
            <h1>Registrieren</h1>
            <p class="auth-subtitle">Erstelle ein Konto. Du erhältst einen Link zur E-Mail-Verifizierung.</p>
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
              <label class="label">Passwort (min. 8 Zeichen)</label>
              <input type="password" name="password" [(ngModel)]="password" required placeholder="••••••••" minlength="8" />
              <label class="label">Name (optional)</label>
              <input type="text" name="name" [(ngModel)]="name" placeholder="Dein Name" />
              <div class="auth-actions">
                <button type="submit" [disabled]="saving">{{ saving ? 'Wird registriert…' : 'Registrieren' }}</button>
              </div>
            </form>
          } @else {
            <p class="auth-muted">Prüfe dein E-Mail-Postfach und klicke auf den Verifizierungslink. Danach kannst du dich anmelden.</p>
            <div class="auth-actions" style="margin-top: 1rem;">
              <a routerLink="/login" class="btn" style="width: 100%; text-align: center;">Zum Login</a>
            </div>
          }

          <p class="auth-footer">
            Bereits registriert? <a routerLink="/login">Anmelden</a>
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
    .auth-form .label { margin-bottom: 0.25rem; }
    .auth-actions { display: flex; flex-direction: column; gap: var(--space-sm); margin-top: 0.5rem; }
    .auth-actions button { width: 100%; }
    .auth-muted { color: var(--text-secondary); margin: 0; font-size: 0.9375rem; line-height: 1.5; }
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
export class RegisterComponent {
  email = '';
  password = '';
  name = '';
  error: string | null = null;
  success: string | null = null;
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
    if (this.password.length < 8) {
      this.error = 'Das Passwort muss mindestens 8 Zeichen haben.';
      return;
    }
    this.saving = true;
    this.auth.register({ email: this.email.trim(), password: this.password, name: this.name.trim() || undefined }).subscribe({
      next: (res) => {
        this.success = res.message;
        this.saving = false;
      },
      error: (err) => {
        this.error = err?.error?.error ?? 'Registrierung fehlgeschlagen.';
        this.saving = false;
      },
    });
  }
}
