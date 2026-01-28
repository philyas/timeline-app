import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'timelines', pathMatch: 'full' },
  { path: 'timelines', loadComponent: () => import('./features/timelines/timeline-list/timeline-list.component').then(m => m.TimelineListComponent) },
  { path: 'timelines/:slug', loadComponent: () => import('./features/timelines/timeline-detail/timeline-detail.component').then(m => m.TimelineDetailComponent) },
  { path: 'important', loadComponent: () => import('./features/events/important-events/important-events.component').then(m => m.ImportantEventsComponent) },
  { path: '**', redirectTo: 'timelines' },
];
