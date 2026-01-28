import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Timeline, Event } from '../../../core/models/timeline.model';
import { EventFormComponent } from '../../../shared/event-form/event-form.component';
import { ModalComponent } from '../../../shared/modal/modal.component';

@Component({
  selector: 'app-timeline-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, EventFormComponent, ModalComponent],
  template: `
    <div class="container">
      <a routerLink="/timelines" class="back">← Zeitstrahlen</a>

      @if (loading) {
        <p class="muted">Lade Zeitstrahl…</p>
      } @else if (error) {
        <p class="error">{{ error }}</p>
      } @else if (timeline) {
        <header class="timeline-header" [style.--timeline-color]="timeline.color || '#0d6b5c'">
          <span class="dot"></span>
          <h1>{{ timeline.name }}</h1>
          @if (timeline.description) {
            <p class="desc">{{ timeline.description }}</p>
          }
        </header>

        <div class="timeline-visual" [style.--timeline-color]="timeline.color || '#0d6b5c'">
          @for (ev of events; track ev.id) {
            <div class="event-row" [class.important]="ev.isImportant">
              <div class="event-date">
                <span class="date-label">{{ formatDate(ev) }}</span>
                @if (getPositionInYear(ev) !== null) {
                  <div class="year-bar" title="Position im Jahr">
                    <span class="year-marker" [style.left.%]="getPositionInYear(ev) ?? 0"></span>
                  </div>
                }
              </div>
              <div class="event-content">
                <h3>{{ ev.title }}</h3>
                @if (ev.description) {
                  <p>{{ ev.description }}</p>
                }
                <div class="actions-inline">
                  <button type="button" class="btn-small" [class.btn-important]="ev.isImportant" (click)="toggleImportant(ev)">
                    {{ ev.isImportant ? '★ Wichtig' : '☆ Als wichtig markieren' }}
                  </button>
                  <button type="button" class="btn-small btn-secondary" (click)="deleteEvent(ev)">Löschen</button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    @if (timeline && !loading && !error) {
      <button type="button" class="add-fab" (click)="openModal()" [attr.aria-label]="'Ereignis hinzufügen'">
        <span class="add-fab-icon" aria-hidden="true">+</span>
        <span class="add-fab-text">Hinzufügen</span>
      </button>
    }

    @if (timeline) {
      <app-modal [isOpen]="modalOpen" title="Ereignis hinzufügen" (closed)="closeModal()">
        <app-event-form
          [timelineId]="timeline.id"
          (created)="onEventCreatedAndClose()"
        />
      </app-modal>
    }
  `,
  styles: [`
    .back {
      display: inline-flex;
      align-items: center;
      margin-bottom: var(--space-md);
      color: var(--text-secondary);
      font-size: 0.9375rem;
      font-weight: 500;
      min-height: var(--touch-min);
      padding: 0.25rem 0;
      -webkit-tap-highlight-color: transparent;
      transition: color 0.2s;
    }
    .back:hover { color: var(--accent); }
    .timeline-header {
      margin-bottom: var(--space-xl);
      padding-bottom: var(--space-md);
      border-bottom: 1px solid var(--border-light);
    }
    .dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 0.6rem;
      vertical-align: middle;
      background: var(--timeline-color);
    }
    .desc { color: var(--text-secondary); margin-top: 0.35rem; font-size: 0.9375rem; line-height: 1.5; }
    .timeline-visual {
      margin-bottom: var(--space-xl);
      border-left: 3px solid var(--timeline-color);
      margin-left: 5px;
      padding-left: var(--space-md);
    }
    @media (min-width: 480px) {
      .timeline-visual { margin-left: 6px; padding-left: var(--space-lg); }
    }
    .event-row {
      padding: var(--space-md) 0;
      border-bottom: 1px solid var(--border-light);
      position: relative;
    }
    .event-row::before {
      content: '';
      position: absolute;
      left: calc(-1 * var(--space-md) - 5px);
      top: 1.35rem;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--bg-card);
      border: 2px solid var(--timeline-color);
      box-sizing: border-box;
    }
    .event-row:last-child { border-bottom: none; }
    .event-row.important .date-label { font-weight: 600; color: var(--accent); }
    .event-row.important::before { background: var(--timeline-color); }
    .event-date {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.35rem;
    }
    .date-label { display: block; margin-bottom: 0.25rem; }
    .year-bar {
      position: relative;
      width: 100%;
      max-width: 140px;
      height: 6px;
      background: var(--border);
      border-radius: 3px;
      overflow: visible;
    }
    .year-marker {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--timeline-color);
      box-shadow: 0 0 0 2px var(--bg);
    }
    .event-content h3 { margin: 0 0 0.3rem 0; font-size: 1.125rem; font-weight: 600; letter-spacing: -0.02em; }
    .event-content p { margin: 0 0 0.5rem 0; font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.5; }
    .actions-inline {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.6rem;
    }
    .btn-small {
      font-size: 0.8125rem;
      min-height: 36px;
      padding: 0.45rem 0.85rem;
      -webkit-tap-highlight-color: transparent;
    }
    .btn-small.btn-important {
      background: var(--important-soft);
      color: var(--important);
      border: 1px solid rgba(180, 83, 9, 0.35);
      font-weight: 600;
      box-shadow: none;
    }
    .btn-small.btn-important:hover {
      background: rgba(180, 83, 9, 0.18);
      border-color: var(--important);
      color: var(--important-hover);
      box-shadow: none;
    }
  `],
})
export class TimelineDetailComponent implements OnInit {
  timeline: Timeline | null = null;
  events: Event[] = [];
  loading = true;
  error: string | null = null;
  modalOpen = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      if (slug) this.load(slug);
    });
  }

  load(slug: string): void {
    this.loading = true;
    this.error = null;
    this.api.getTimelineBySlug(slug).subscribe({
      next: (t) => {
        this.timeline = t;
        this.events = t.events || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Zeitstrahl konnte nicht geladen werden.';
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

  /** Position im Jahr 0–100 % (nur wenn Monat gesetzt), sonst null */
  getPositionInYear(ev: Event): number | null {
    if (ev.month == null || ev.month < 1 || ev.month > 12) return null;
    const day = ev.day != null && ev.day >= 1 && ev.day <= 31 ? ev.day : 15;
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][ev.month - 1];
    const dayFraction = Math.min(1, (day - 1) / daysInMonth);
    const monthFraction = (ev.month - 1 + dayFraction) / 12;
    return Math.min(100, Math.max(0, monthFraction * 100));
  }

  openModal(): void {
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  onEventCreated(): void {
    if (this.timeline) this.load(this.timeline.slug);
  }

  onEventCreatedAndClose(): void {
    this.closeModal();
    this.onEventCreated();
  }

  toggleImportant(ev: Event): void {
    this.api.updateEvent(ev.id, { isImportant: !ev.isImportant }).subscribe({
      next: () => {
        ev.isImportant = !ev.isImportant;
      },
      error: (e) => console.error(e),
    });
  }

  deleteEvent(ev: Event): void {
    if (!confirm(`„${ev.title}" wirklich löschen?`)) return;
    this.api.deleteEvent(ev.id).subscribe({
      next: () => this.onEventCreated(),
      error: (e) => console.error(e),
    });
  }
}
