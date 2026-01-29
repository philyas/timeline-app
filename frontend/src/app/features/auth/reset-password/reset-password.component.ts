import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <header class="auth-header">
            <h1>Passwort zurücksetzen</h1>
            <p class="auth-subtitle">Gib dein neues Passwort ein (min. 8 Zeichen).</p>
          </header>

          @if (error) {
            <div class="auth-error">{{ error }}</div>
          }
          @if (success) {
            <div class="auth-success">{{ success }}</div>
            <div class="auth-actions" style="margin-top: 1rem;">
              <a routerLink="/login" class="btn" style="width: 100%; text-align: center;">Zum Login</a>
            </div>
          } @else if (token) {
            <form (ngSubmit)="onSubmit()" class="auth-form">
              <label class="label">Neues Passwort</label>
              <input type="password" name="password" [(ngModel)]="password" required placeholder="••••••••" minlength="8" />
              <label class="label">Passwort bestätigen</label>
              <input type="password" name="confirm" [(ngModel)]="confirm" required placeholder="••••••••" minlength="8" />
              <div class="auth-actions">
                <button type="submit" [disabled]="saving">{{ saving ? 'Wird gespeichert…' : 'Passwort setzen' }}</button>
              </div>
            </form>
          } @else {
            <div class="auth-error">Ungültiger oder fehlender Link. Bitte fordere einen neuen Link an.</div>
            <a routerLink="/forgot-password" class="auth-link" style="margin-top: 0.5rem; display: inline-block;">Passwort vergessen</a>
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
    .auth-link { color: var(--accent); font-size: 0.9375rem; }
    .auth-link:hover { color: var(--accent-hover); }
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
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirm = '';
  error: string | null = null;
  success: string | null = null;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.token = (this.route.snapshot.queryParamMap.get('token') ?? '').trim();
  }

  onSubmit(): void {
    this.error = null;
    if (!this.password || this.password.length < 8) {
      this.error = 'Das Passwort muss mindestens 8 Zeichen haben.';
      return;
    }
    if (this.password !== this.confirm) {
      this.error = 'Passwörter stimmen nicht überein.';
      return;
    }
    this.saving = true;
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: (res) => {
        this.success = res.message;
        this.saving = false;
      },
      error: (err) => {
        this.error = err?.error?.error ?? 'Passwort konnte nicht zurückgesetzt werden.';
        this.saving = false;
      },
    });
  }
}
