import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Event } from '../../../core/models/timeline.model';

@Component({
  selector: 'app-important-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <header class="page-intro">
        <h1>Wichtige Ereignisse</h1>
        <p class="subtitle">Überblick über die als wichtig markierten Ereignisse aller Zeitstrahlen.</p>
      </header>

      @if (loading) {
        <p class="muted">Lade Ereignisse…</p>
      } @else if (error) {
        <p class="error">{{ error }}</p>
      } @else {
        <div class="event-list">
          @for (ev of events; track ev.id) {
            <div class="card event-card">
              <div class="event-header">
                <span class="year">{{ formatDate(ev) }}</span>
                @if (ev.timeline) {
                  <a [routerLink]="['/timelines', ev.timeline.slug]" class="timeline-link">{{ ev.timeline.name }}</a>
                }
              </div>
              <h3>{{ ev.title }}</h3>
              @if (ev.description) {
                <p>{{ ev.description }}</p>
              }
            </div>
          }
          @if (events.length === 0) {
            <p class="muted">Noch keine wichtigen Ereignisse markiert. Markiere in einem Zeitstrahl Ereignisse als „wichtig“.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .event-list { display: flex; flex-direction: column; gap: var(--space-md); }
    .event-card {
      max-width: 640px;
      border-left: 3px solid var(--accent);
      transition: box-shadow 0.2s;
    }
    .event-card:hover { box-shadow: var(--shadow-hover); }
    .event-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 0.75rem;
      margin-bottom: 0.5rem;
    }
    .year { font-size: 0.8125rem; font-weight: 600; color: var(--accent); letter-spacing: 0.02em; }
    .timeline-link {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary);
      min-height: var(--touch-min);
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0;
      -webkit-tap-highlight-color: transparent;
    }
    .timeline-link:hover { color: var(--accent); }
    .event-card h3 { margin: 0 0 0.3rem 0; font-size: 1.125rem; font-weight: 600; letter-spacing: -0.02em; }
    .event-card p { margin: 0; font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.5; }
  `],
})
export class ImportantEventsComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.getImportantEvents(50).subscribe({
      next: (list) => {
        this.events = list;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Ereignisse konnten nicht geladen werden.';
        this.loading = false;
      },
    });
  }

  private readonly monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  formatDate(ev: Event): string {
    const era = ev.year < 0 ? ` ${Math.abs(ev.year)} v. Chr.` : ` ${ev.year} n. Chr.`;
    if (ev.month != null && ev.month >= 1 && ev.month <= 12) {
      const monthStr = this.monthNames[ev.month - 1];
      if (ev.day != null && ev.day >= 1 && ev.day <= 31) {
        return `${ev.day}. ${monthStr}${era}`;
      }
      return `${monthStr}${era}`;
    }
    return (ev.year < 0 ? Math.abs(ev.year) + ' v. Chr.' : ev.year + ' n. Chr.');
  }
}
