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
    <div class="container">
      <div class="auth-card card">
        <header class="page-intro">
          <h1>Registrieren</h1>
          <p class="subtitle">Erstelle ein Konto. Du erhältst einen Link zur E-Mail-Verifizierung.</p>
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
            <label class="label">Passwort (min. 8 Zeichen)</label>
            <input type="password" name="password" [(ngModel)]="password" required placeholder="••••••••" minlength="8" />
            <label class="label">Name (optional)</label>
            <input type="text" name="name" [(ngModel)]="name" placeholder="Dein Name" />
            <div class="actions">
              <button type="submit" [disabled]="saving">{{ saving ? 'Wird registriert…' : 'Registrieren' }}</button>
            </div>
          </form>
        } @else {
          <p class="muted">Prüfe dein E-Mail-Postfach und klicke auf den Verifizierungslink. Danach kannst du dich anmelden.</p>
          <div class="actions">
            <a routerLink="/login" class="btn">Zum Login</a>
          </div>
        }

        <p class="auth-footer">
          Bereits registriert? <a routerLink="/login">Anmelden</a>
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
    .auth-footer { margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--border-light); text-align: center; color: var(--text-secondary); font-size: 0.9375rem; }
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
