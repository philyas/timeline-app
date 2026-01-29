import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <header class="auth-header">
            <h1>E-Mail bestätigen</h1>
            <p class="auth-subtitle">Deine E-Mail-Adresse wird verifiziert…</p>
          </header>

          @if (loading) {
            <div class="auth-loading">
              <div class="loading-spinner"></div>
              <p>Bitte warten…</p>
            </div>
          } @else if (error) {
            <div class="auth-error">{{ error }}</div>
            <a routerLink="/login" class="btn" style="width: 100%; text-align: center; margin-top: 1rem;">Zum Login</a>
          } @else if (success) {
            <div class="auth-success">{{ success }}</div>
            <a routerLink="/login" class="btn" style="width: 100%; text-align: center; margin-top: 1rem;">Jetzt anmelden</a>
          }
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
    .auth-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: var(--space-md) 0;
      color: var(--text-secondary);
    }
    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-light);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-error {
      padding: 0.75rem 1rem;
      background: rgba(196, 30, 58, 0.08);
      color: #c41e3a;
      border-radius: var(--radius-sm);
      font-size: 0.9375rem;
      font-weight: 500;
    }
    .auth-success {
      padding: 0.75rem 1rem;
      background: var(--accent-soft);
      color: var(--accent);
      border-radius: var(--radius-sm);
      font-size: 0.9375rem;
      font-weight: 500;
    }
  `],
})
export class VerifyEmailComponent implements OnInit {
  loading = true;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    const token = (this.route.snapshot.queryParamMap.get('token') ?? '').trim();
    if (!token) {
      this.loading = false;
      this.error = 'Verifizierungslink ungültig oder abgelaufen.';
      return;
    }
    this.auth.verifyEmail(token).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = res.message;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error ?? 'Verifizierung fehlgeschlagen.';
      },
    });
  }
}
