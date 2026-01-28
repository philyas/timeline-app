import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="auth-card card">
        <header class="page-intro">
          <h1>E-Mail bestätigen</h1>
          <p class="subtitle">Deine E-Mail-Adresse wird verifiziert…</p>
        </header>

        @if (loading) {
          <p class="muted">Bitte warten…</p>
        } @else if (error) {
          <p class="error">{{ error }}</p>
          <a routerLink="/login" class="btn">Zum Login</a>
        } @else if (success) {
          <p class="success">{{ success }}</p>
          <a routerLink="/login" class="btn">Jetzt anmelden</a>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-card { max-width: 420px; margin-left: auto; margin-right: auto; }
    .auth-card .page-intro { margin-bottom: var(--space-md); padding-bottom: var(--space-sm); }
    .auth-card .error { margin-bottom: var(--space-sm); }
    .auth-card .success { margin-bottom: var(--space-sm); color: var(--accent); font-weight: 500; }
    .auth-card .btn { display: inline-block; margin-top: var(--space-sm); }
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
