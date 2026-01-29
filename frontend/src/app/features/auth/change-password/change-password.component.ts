import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (modalMode) {
      <div class="change-password-modal">
        @if (error) { <p class="error">{{ error }}</p> }
        @if (success) {
          <p class="success">{{ success }}</p>
          <button type="button" class="btn btn-block" (click)="closed.emit()">Schließen</button>
        } @else {
          <form (ngSubmit)="onSubmit()">
            <div class="cp-row">
              <label class="cp-label">Aktuell</label>
              <input type="password" name="current" [(ngModel)]="currentPassword" required placeholder="••••••••" />
            </div>
            <div class="cp-row">
              <label class="cp-label">Neu</label>
              <input type="password" name="password" [(ngModel)]="newPassword" required placeholder="••••••••" minlength="8" />
            </div>
            <div class="cp-row">
              <label class="cp-label">Bestätigen</label>
              <input type="password" name="confirm" [(ngModel)]="confirm" required placeholder="••••••••" minlength="8" />
            </div>
            <div class="cp-actions">
              <button type="button" class="btn btn-secondary" (click)="closed.emit()">Abbrechen</button>
              <button type="submit" [disabled]="saving">{{ saving ? '…' : 'Ändern' }}</button>
            </div>
          </form>
        }
      </div>
    } @else {
      <div class="auth-page">
        <div class="auth-container">
          <div class="auth-card">
            <header class="auth-header">
              <h1>Passwort ändern</h1>
              <p class="auth-subtitle">Gib dein aktuelles Passwort und das neue Passwort ein (min. 8 Zeichen).</p>
            </header>

            @if (error) {
              <div class="auth-error">{{ error }}</div>
            }
            @if (success) {
              <div class="auth-success">{{ success }}</div>
              <div class="auth-actions" style="margin-top: 1rem;">
                <a routerLink="/timelines" class="btn" style="width: 100%; text-align: center;">Zurück zu Zeitstrahlen</a>
              </div>
            } @else {
              <form (ngSubmit)="onSubmit()" class="auth-form">
                <label class="label">Aktuelles Passwort</label>
                <input type="password" name="current" [(ngModel)]="currentPassword" required placeholder="••••••••" />
                <label class="label">Neues Passwort</label>
                <input type="password" name="password" [(ngModel)]="newPassword" required placeholder="••••••••" minlength="8" />
                <label class="label">Neues Passwort bestätigen</label>
                <input type="password" name="confirm" [(ngModel)]="confirm" required placeholder="••••••••" minlength="8" />
                <div class="auth-actions">
                  <a routerLink="/timelines" class="btn btn-secondary" style="flex: 1; text-align: center;">Abbrechen</a>
                  <button type="submit" [disabled]="saving">{{ saving ? 'Wird gespeichert…' : 'Passwort ändern' }}</button>
                </div>
              </form>
            }

            <p class="auth-footer">
              <a routerLink="/timelines">← Zurück zu Zeitstrahlen</a>
            </p>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .change-password-modal { padding: 0; }
    .change-password-modal .error { margin: 0 0 0.5rem; font-size: 0.8125rem; color: #c41e3a; font-weight: 500; }
    .change-password-modal .success { margin: 0 0 0.5rem; font-size: 0.8125rem; color: var(--accent); font-weight: 500; }
    .change-password-modal .cp-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .change-password-modal .cp-label { flex: 0 0 56px; font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; }
    .change-password-modal input { flex: 1; padding: 0.4rem 0.5rem; font-size: 0.875rem; min-height: 36px; border-radius: 10px; }
    .change-password-modal .cp-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .change-password-modal .cp-actions .btn, .change-password-modal .cp-actions button { flex: 1; padding: 0.4rem; font-size: 0.8125rem; min-height: 36px; }
    .change-password-modal .btn-block { width: 100%; margin-top: 0.5rem; padding: 0.5rem; font-size: 0.875rem; min-height: 44px; }

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
    .auth-actions { display: flex; gap: var(--space-sm); margin-top: 0.5rem; flex-wrap: wrap; }
    .auth-actions a.btn, .auth-actions button { flex: 1; min-width: 120px; }
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
export class ChangePasswordComponent {
  @Input() modalMode = false;
  @Output() closed = new EventEmitter<void>();

  currentPassword = '';
  newPassword = '';
  confirm = '';
  error: string | null = null;
  success: string | null = null;
  saving = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    this.error = null;
    if (!this.currentPassword.trim()) {
      this.error = 'Aktuelles Passwort eingeben.';
      return;
    }
    if (!this.newPassword || this.newPassword.length < 8) {
      this.error = 'Das neue Passwort muss mindestens 8 Zeichen haben.';
      return;
    }
    if (this.newPassword !== this.confirm) {
      this.error = 'Neue Passwörter stimmen nicht überein.';
      return;
    }
    this.saving = true;
    this.auth.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (res) => {
        this.success = res.message;
        this.saving = false;
      },
      error: (err) => {
        this.error = err?.error?.error ?? 'Passwort konnte nicht geändert werden.';
        this.saving = false;
      },
    });
  }
}
