import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Timeline, Event, EventImage } from '../../../core/models/timeline.model';
import { EventFormComponent } from '../../../shared/event-form/event-form.component';
import { EventPhotosComponent } from '../../../shared/event-photos/event-photos.component';
import { ModalComponent } from '../../../shared/modal/modal.component';

@Component({
  selector: 'app-timeline-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, EventFormComponent, EventPhotosComponent, ModalComponent],
  template: `
    <div class="container">
      <a routerLink="/timelines" class="back">← Zeitstrahlen</a>

      @if (loading) {
        <p class="muted">Lade Zeitstrahl…</p>
      } @else if (error) {
        <p class="error">{{ error }}</p>
      } @else if (timeline) {
        <header class="timeline-header" [style.--timeline-color]="timeline.color || '#0d6b5c'">
          <div class="header-top">
            <div class="header-title">
              <span class="dot"></span>
              <h1>{{ timeline.name }}</h1>
            </div>
            <button type="button" class="btn-small btn-secondary btn-delete-timeline" (click)="deleteTimeline()">
              Zeitlinie löschen
            </button>
          </div>
          @if (timeline.description) {
            <p class="desc">{{ timeline.description }}</p>
          }
        </header>

        <div class="timeline-visual" [style.--timeline-color]="timeline.color || '#0d6b5c'">
          @for (ev of events; track ev.id) {
            <div class="event-row" [class.important]="ev.isImportant">
              <span class="year-badge">{{ formatYear(ev) }}</span>
              <div class="event-body">
                <div class="event-content">
                  <div class="event-main">
                    <div class="event-text">
                      <h3>{{ ev.title }}</h3>
                      @if (ev.month) {
                        <span class="date-detail">{{ formatDate(ev) }}</span>
                      }
                      @if (ev.description) {
                        <p>{{ ev.description }}</p>
                      }
                    </div>
                    @if (getMainImage(ev); as img) {
                      <img [src]="imageSrc(img.url)" [alt]="ev.title" class="event-thumb" loading="lazy" />
                    }
                  </div>
                  <div class="actions-inline">
                    <button type="button" class="btn-small" [class.btn-important]="ev.isImportant" (click)="toggleImportant(ev)">
                      {{ ev.isImportant ? '★ Wichtig' : '☆ Als wichtig markieren' }}
                    </button>
                    <button type="button" class="btn-small btn-secondary" (click)="openPhotosModal(ev)">Fotos</button>
                    <button type="button" class="btn-small btn-secondary" (click)="deleteEvent(ev)">Löschen</button>
                  </div>
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

    @if (photosModalEvent) {
      <app-modal [isOpen]="true" [title]="'Fotos: ' + photosModalEvent.title" (closed)="closePhotosModal()">
        <app-event-photos
          [event]="photosModalEvent"
          (updated)="onPhotosUpdated()"
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
    .header-top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-sm);
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 0;
    }
    .header-title .dot {
      flex-shrink: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--timeline-color);
    }
    .header-title h1 { margin: 0; }
    .btn-delete-timeline { flex-shrink: 0; }
    .desc { color: var(--text-secondary); margin: 0.35rem 0 0 0; font-size: 0.9375rem; line-height: 1.5; }
    .timeline-visual {
      margin-bottom: var(--space-xl);
      margin-left: 2.5rem;
      padding-left: var(--space-md);
      position: relative;
    }
    .timeline-visual::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--timeline-color);
      z-index: 0;
    }
    @media (min-width: 480px) {
      .timeline-visual { margin-left: 3rem; padding-left: var(--space-lg); }
    }
    .event-row {
      padding: var(--space-md) 0;
      border-bottom: 1px solid var(--border-light);
      position: relative;
      z-index: 1;
    }
    .event-row:last-child { border-bottom: none; }
    .event-row.important { z-index: 2; }
    .event-row.important .year-badge { z-index: 3; }
    .year-badge {
      position: absolute;
      left: calc(-1 * var(--space-md) - 3px);
      top: calc(var(--space-md) + 0.1rem);
      transform: translateX(-100%);
      z-index: 2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.3rem 0.6rem;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--timeline-color);
      background: color-mix(in srgb, var(--timeline-color) 12%, var(--bg-card));
      border-radius: 6px;
      white-space: nowrap;
      letter-spacing: 0.02em;
    }
    .year-badge::after {
      content: '';
      position: absolute;
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--bg) 55%, black);
    }
    .event-row.important .year-badge {
      color: var(--important);
      background: color-mix(in srgb, var(--important) 11%, var(--bg-card));
    }
    .event-row.important .year-badge::after {
      background: color-mix(in srgb, var(--important) 55%, black);
    }
    .event-body { }
    .event-content h3 { margin: 0; font-size: 1.125rem; font-weight: 600; letter-spacing: -0.02em; }
    .date-detail {
      display: block;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-top: 0.15rem;
      margin-bottom: 0.25rem;
    }
    .event-row.important .date-detail { color: var(--important); }
    .event-content p { margin: 0.25rem 0 0.5rem 0; font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.5; }
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
      border: 1px solid rgba(91, 95, 199, 0.3);
      font-weight: 600;
      box-shadow: none;
    }
    .btn-small.btn-important:hover {
      background: color-mix(in srgb, var(--important) 18%, var(--bg-card));
      border-color: var(--important);
      color: var(--important-hover);
      box-shadow: none;
    }
    .event-main {
      display: flex;
      gap: var(--space-sm);
      align-items: flex-start;
    }
    .event-text { flex: 1; min-width: 0; }
    .event-thumb {
      width: 100%;
      max-width: 100px;
      aspect-ratio: 4/3;
      object-fit: cover;
      border-radius: 6px;
      flex-shrink: 0;
    }
  `],
})
export class TimelineDetailComponent implements OnInit {
  timeline: Timeline | null = null;
  events: Event[] = [];
  loading = true;
  error: string | null = null;
  modalOpen = false;
  photosModalEvent: Event | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

  formatYear(ev: Event): string {
    return ev.year < 0 ? Math.abs(ev.year) + ' v. Chr.' : String(ev.year);
  }

  getMainImage(ev: Event): EventImage | null {
    const imgs = ev.images ?? [];
    const main = imgs.find((i) => i.isMain);
    return main ?? imgs[0] ?? null;
  }

  imageSrc(url: string): string {
    return this.api.getImageUrl(url);
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

  deleteTimeline(): void {
    if (!this.timeline) return;
    if (!confirm(`Zeitlinie „${this.timeline.name}" inkl. aller Ereignisse wirklich löschen?`)) return;
    this.api.deleteTimeline(this.timeline.id).subscribe({
      next: () => this.router.navigate(['/timelines']),
      error: (e) => console.error(e?.error?.error ?? 'Zeitlinie konnte nicht gelöscht werden.'),
    });
  }

  openPhotosModal(ev: Event): void {
    this.photosModalEvent = ev;
  }

  closePhotosModal(): void {
    this.photosModalEvent = null;
  }

  onPhotosUpdated(): void {
    if (!this.timeline || !this.photosModalEvent) return;
    const id = this.photosModalEvent.id;
    this.api.getEventById(id).subscribe({
      next: (ev) => {
        this.photosModalEvent = ev;
        const idx = this.events.findIndex((e) => e.id === id);
        if (idx >= 0) this.events[idx] = ev;
      },
    });
  }
}
