import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'timelines', pathMatch: 'full' },
  { path: 'timelines', loadComponent: () => import('./features/timelines/timeline-list/timeline-list.component').then(m => m.TimelineListComponent), canActivate: [authGuard] },
  { path: 'timelines/:slug', loadComponent: () => import('./features/timelines/timeline-detail/timeline-detail.component').then(m => m.TimelineDetailComponent), canActivate: [authGuard] },
  { path: 'important', loadComponent: () => import('./features/events/important-events/important-events.component').then(m => m.ImportantEventsComponent), canActivate: [authGuard] },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'change-password', loadComponent: () => import('./features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent), canActivate: [authGuard] },
  { path: 'verify-email', loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent) },
  { path: '**', redirectTo: 'timelines' },
];
