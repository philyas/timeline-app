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
    <div class="container">
      <div class="auth-card card">
        <header class="page-intro">
          <h1>Passwort zurücksetzen</h1>
          <p class="subtitle">Gib dein neues Passwort ein (min. 8 Zeichen).</p>
        </header>

        @if (error) {
          <p class="error">{{ error }}</p>
        }
        @if (success) {
          <p class="success">{{ success }}</p>
          <div class="actions">
            <a routerLink="/login" class="btn">Zum Login</a>
          </div>
        } @else if (token) {
          <form (ngSubmit)="onSubmit()">
            <label class="label">Neues Passwort</label>
            <input type="password" name="password" [(ngModel)]="password" required placeholder="••••••••" minlength="8" />
            <label class="label">Passwort bestätigen</label>
            <input type="password" name="confirm" [(ngModel)]="confirm" required placeholder="••••••••" minlength="8" />
            <div class="actions">
              <button type="submit" [disabled]="saving">{{ saving ? 'Wird gespeichert…' : 'Passwort setzen' }}</button>
            </div>
          </form>
        } @else {
          <p class="error">Ungültiger oder fehlender Link. Bitte fordere einen neuen Link an.</p>
          <a routerLink="/forgot-password">Passwort vergessen</a>
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
