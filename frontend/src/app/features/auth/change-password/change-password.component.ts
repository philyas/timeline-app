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
              <div class="auth-actions auth-actions--single">
                <a routerLink="/timelines" class="btn btn-full">Zurück zu Zeitstrahlen</a>
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
                  <a routerLink="/timelines" class="btn btn-secondary btn-flex">Abbrechen</a>
                  <button type="submit" class="btn-flex" [disabled]="saving">{{ saving ? 'Wird gespeichert…' : 'Passwort ändern' }}</button>
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
    /* —— Modal (User-Menü) —— responsive für alle Breiten */
    .change-password-modal {
      padding: 0;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }
    .change-password-modal .error { margin: 0 0 0.5rem; font-size: 0.8125rem; color: #c41e3a; font-weight: 500; }
    .change-password-modal .success { margin: 0 0 0.5rem; font-size: 0.8125rem; color: var(--accent); font-weight: 500; }
    .change-password-modal .cp-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      min-width: 0;
    }
    .change-password-modal .cp-label {
      flex: 0 0 72px;
      font-size: 0.8125rem;
      color: var(--text-secondary);
      font-weight: 500;
      flex-shrink: 0;
    }
    .change-password-modal input {
      flex: 1;
      min-width: 0;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      min-height: var(--touch-min);
      border-radius: 10px;
      box-sizing: border-box;
    }
    .change-password-modal .cp-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    .change-password-modal .cp-actions .btn,
    .change-password-modal .cp-actions button {
      flex: 1;
      min-width: 0;
      min-height: var(--touch-min);
      padding: 0.5rem 1rem;
      font-size: 0.9375rem;
    }
    .change-password-modal .btn-block {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.9375rem;
      min-height: var(--touch-min);
    }
    @media (max-width: 380px) {
      .change-password-modal .cp-row { flex-direction: column; align-items: stretch; gap: 0.25rem; }
      .change-password-modal .cp-label { flex: none; }
      .change-password-modal .cp-actions { flex-direction: column; }
      .change-password-modal .cp-actions .btn,
      .change-password-modal .cp-actions button { flex: none; width: 100%; }
    }

    /* —— Seite (eigene Route) —— responsive Mobil / Tablet / Laptop / Desktop */
    .auth-page {
      min-height: 100%;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-lg) var(--container-padding);
      padding-left: calc(var(--container-padding) + env(safe-area-inset-left));
      padding-right: calc(var(--container-padding) + env(safe-area-inset-right));
      padding-bottom: calc(var(--space-lg) + env(safe-area-inset-bottom));
      box-sizing: border-box;
    }
    @media (min-width: 600px) {
      .auth-page { padding: var(--space-xl) var(--container-padding); }
    }
    .auth-container {
      width: 100%;
      max-width: 420px;
      min-width: 0;
      box-sizing: border-box;
    }
    .auth-card {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      background: rgba(251, 251, 253, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: var(--radius);
      box-shadow: var(--shadow-hover);
      border: 1px solid var(--border-light);
      padding: var(--space-lg);
    }
    @media (min-width: 600px) {
      .auth-card { padding: var(--space-xl); }
    }
    .auth-header { margin-bottom: var(--space-lg); }
    .auth-header h1 {
      font-size: clamp(1.375rem, 4vw, 1.75rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }
    .auth-subtitle {
      color: var(--text-secondary);
      font-size: clamp(0.9375rem, 2vw, 1rem);
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
    .auth-success {
      padding: 0.75rem 1rem;
      background: var(--accent-soft);
      color: var(--accent);
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
    .auth-form input {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }
    .auth-actions {
      display: flex;
      gap: var(--space-sm);
      margin-top: 0.5rem;
      flex-wrap: wrap;
      min-width: 0;
    }
    .auth-actions a.btn,
    .auth-actions button {
      flex: 1;
      min-width: 0;
      min-height: var(--touch-min);
    }
    .auth-actions--single { margin-top: 1rem; }
    .btn-flex { flex: 1; min-width: 120px; }
    .btn-full { width: 100%; text-align: center; display: block; }
    @media (max-width: 480px) {
      .auth-actions { flex-direction: column; }
      .auth-actions a.btn,
      .auth-actions button { flex: none; width: 100%; }
      .btn-flex { min-width: 0; }
    }
    @media (min-width: 481px) and (max-width: 900px) {
      .auth-actions a.btn,
      .auth-actions button { min-width: 140px; }
    }
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
