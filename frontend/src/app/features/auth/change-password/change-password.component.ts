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
      <div class="container">
      <div class="auth-card card">
        <header class="page-intro">
          <h1>Passwort ändern</h1>
          <p class="subtitle">Gib dein aktuelles Passwort und das neue Passwort ein (min. 8 Zeichen).</p>
        </header>

        @if (error) {
          <p class="error">{{ error }}</p>
        }
        @if (success) {
          <p class="success">{{ success }}</p>
          <div class="actions actions-single">
            <a routerLink="/timelines" class="btn">Zurück zu Zeitstrahlen</a>
          </div>
        } @else {
          <form (ngSubmit)="onSubmit()">
            <label class="label">Aktuelles Passwort</label>
            <input type="password" name="current" [(ngModel)]="currentPassword" required placeholder="••••••••" />
            <label class="label">Neues Passwort</label>
            <input type="password" name="password" [(ngModel)]="newPassword" required placeholder="••••••••" minlength="8" />
            <label class="label">Neues Passwort bestätigen</label>
            <input type="password" name="confirm" [(ngModel)]="confirm" required placeholder="••••••••" minlength="8" />
            <div class="actions">
              <a routerLink="/timelines" class="btn btn-secondary">Abbrechen</a>
              <button type="submit" [disabled]="saving">{{ saving ? 'Wird gespeichert…' : 'Passwort ändern' }}</button>
            </div>
          </form>
        }

        <p class="auth-footer">
          <a routerLink="/timelines">← Zurück zu Zeitstrahlen</a>
        </p>
      </div>
      </div>
    }
  `,
  styles: [`
    .change-password-modal { padding: 0; }
    .change-password-modal .error { margin: 0 0 0.2rem; font-size: 0.7rem; }
    .change-password-modal .success { margin: 0 0 0.2rem; font-size: 0.7rem; color: var(--accent); font-weight: 500; }
    .change-password-modal .cp-row { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.2rem; }
    .change-password-modal .cp-label { flex: 0 0 56px; font-size: 0.7rem; color: var(--text-secondary); }
    .change-password-modal input { flex: 1; padding: 0.2rem 0.35rem; font-size: 0.8125rem; min-height: 26px; border-radius: 6px; }
    .change-password-modal .cp-actions { display: flex; gap: 0.3rem; margin-top: 0.3rem; }
    .change-password-modal .cp-actions .btn, .change-password-modal .cp-actions button { flex: 1; padding: 0.2rem 0.35rem; font-size: 0.75rem; min-height: 26px; }
    .change-password-modal .btn-block { width: 100%; margin-top: 0.2rem; padding: 0.2rem; font-size: 0.75rem; min-height: 26px; }
    .auth-card { max-width: 420px; margin-left: auto; margin-right: auto; }
    .auth-card .page-intro { margin-bottom: var(--space-md); padding-bottom: var(--space-sm); }
    .auth-card .error { margin-bottom: var(--space-sm); }
    .auth-card .success { margin-bottom: var(--space-sm); color: var(--accent); font-weight: 500; }
    .auth-card form { display: flex; flex-direction: column; gap: var(--space-sm); }
    .actions { display: flex; gap: var(--space-sm); margin-top: var(--space-sm); flex-wrap: wrap; }
    .actions a.btn, .actions button { flex: 1; min-width: 120px; text-align: center; }
    .actions-single .btn { flex: none; }
    .auth-footer { margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--border-light); text-align: center; }
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
