import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { User, LoginDto, RegisterDto, AuthResponse, RegisterResponse } from '../models/auth.model';

const TOKEN_KEY = 'timeline_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;
  private userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(this.getStoredToken());

  readonly user = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  /** Nur true, wenn Token vorhanden und gültig (nicht abgelaufen). */
  readonly isLoggedIn = computed(() => {
    const t = this.tokenSignal();
    return t ? !!this.decodeUser(t) : false;
  });

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const t = this.getStoredToken();
    if (t) {
      const u = this.decodeUser(t);
      if (u) {
        this.userSignal.set(u);
      } else {
        this.clearAuth();
      }
    }
  }

  private getStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.tokenSignal.set(token);
    const u = this.decodeUser(token);
    if (u) this.userSignal.set(u);
  }

  private clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  private decodeUser(token: string): User | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const raw = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(raw)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(json) as { userId?: number; email?: string; exp?: number };
      if (!payload.userId || !payload.email) return null;
      if (payload.exp && payload.exp * 1000 < Date.now()) return null;
      return {
        id: payload.userId,
        email: payload.email,
        name: null,
        emailVerifiedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  register(dto: RegisterDto) {
    return this.http.post<RegisterResponse>(`${this.api}/register`, dto).pipe(
      tap((res) => this.userSignal.set(res.user)),
      catchError((err) => {
        throw err;
      })
    );
  }

  login(dto: LoginDto) {
    return this.http.post<AuthResponse>(`${this.api}/login`, dto).pipe(
      tap((res) => {
        this.setToken(res.token);
        this.userSignal.set(res.user);
      }),
      catchError((err) => {
        throw err;
      })
    );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  verifyEmail(token: string) {
    return this.http.get<{ user: User; message: string }>(`${this.api}/verify-email`, {
      params: { token },
    });
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(`${this.api}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string) {
    return this.http.post<{ message: string }>(`${this.api}/reset-password`, { token, password });
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${this.api}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  me() {
    return this.http.get<{ user: User }>(`${this.api}/me`).pipe(
      tap((res) => this.userSignal.set(res.user)),
      catchError(() => {
        this.clearAuth();
        return of(null);
      })
    );
  }
}
