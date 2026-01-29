import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Event, EventImage } from '../../../core/models/timeline.model';
import { ModalComponent } from '../../../shared/modal/modal.component';

@Component({
  selector: 'app-important-events',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalComponent],
  template: `
    <div class="important-events-layout">
      <div class="important-events-top">
        <div class="container">
          <a routerLink="/timelines" class="back back--full">← Zeitstrahlen</a>
          <header class="page-intro">
            <div class="header-row">
              <a routerLink="/timelines" class="back-inline" aria-label="Zurück zu Zeitstrahlen">←</a>
              <h1>Wichtige Ereignisse</h1>
            </div>
            <p class="subtitle">Überblick über die als wichtig markierten Ereignisse aller Zeitstrahlen.</p>
          </header>

          @if (!loading && !error && events.length > 0) {
            <div class="sort-bar">
              <span class="sort-label">Reihenfolge:</span>
              <div class="sort-toggle" role="group" aria-label="Sortierung">
                <button type="button" class="sort-btn" [class.active]="sortOrder === 'asc'" (click)="setSortOrder('asc')">
                  Älteste zuerst
                </button>
                <button type="button" class="sort-btn" [class.active]="sortOrder === 'desc'" (click)="setSortOrder('desc')">
                  Neueste zuerst
                </button>
              </div>
            </div>
          }

          @if (loading) {
            <p class="muted">Lade Ereignisse…</p>
          } @else if (error) {
            <p class="error">{{ error }}</p>
          } @else if (events.length === 0) {
            <p class="muted">Noch keine wichtigen Ereignisse markiert. Markiere in einem Zeitstrahl Ereignisse als „wichtig“.</p>
          }
        </div>
      </div>

      @if (!loading && !error && events.length > 0) {
        <div class="important-events-scroll-wrap">
          <div class="important-events-scroll">
            <div class="container">
              <div class="important-timeline-visual">
                @for (ev of sortedEvents; track ev.id) {
                  <div class="event-row">
                    <span class="year-badge">{{ formatYear(ev) }}</span>
                    <div class="event-body">
                      <div class="event-content">
                        <div class="event-main">
                          <div class="event-text">
                            <h3>{{ ev.title }}</h3>
                            @if (ev.month) {
                              <span class="date-detail">{{ formatDate(ev) }}</span>
                            }
                            @if (ev.timeline) {
                              <a [routerLink]="['/timelines', ev.timeline.slug]" class="timeline-link">{{ ev.timeline.name }}</a>
                            }
                            @if (ev.description) {
                              <p>{{ ev.description }}</p>
                            }
                            @if (ev.images && ev.images.length > 0) {
                              <button type="button" class="btn-small btn-photos" (click)="openPhotosModal(ev)">
                                Fotos ({{ ev.images.length }})
                              </button>
                            }
                          </div>
                          @if (getMainImage(ev); as img) {
                            <button type="button" class="event-thumb-wrap" (click)="openPhotosModal(ev)" aria-label="Fotos anzeigen">
                              <img [src]="imageSrc(img.url)" [alt]="ev.title" class="event-thumb" loading="lazy" />
                            </button>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>

    @if (photosModalEvent) {
      <app-modal
        [isOpen]="true"
        [title]="'Fotos: ' + photosModalEvent.title"
        [fullscreenOnMobile]="true"
        (closed)="closePhotosModal()"
      >
        <div class="photos-gallery">
          @for (img of sortedImages(photosModalEvent); track img.id) {
            <div class="photos-gallery-item">
              <img [src]="imageSrc(img.url)" [alt]="photosModalEvent.title" loading="lazy" />
              @if (img.isMain) {
                <span class="main-badge">Hauptbild</span>
              }
            </div>
          }
        </div>
        @if (!photosModalEvent.images || photosModalEvent.images.length === 0) {
          <p class="muted">Noch keine Bilder zu diesem Ereignis.</p>
        }
      </app-modal>
    }
  `,
  styles: [`
    .important-events-layout {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    @media (max-width: 599px) {
      .important-events-layout { flex: 1; min-height: 0; overflow: hidden; }
      .important-events-top { flex-shrink: 0; }
      .back--full { display: none !important; }
      .back-inline {
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 34px;
        height: 34px;
        margin-right: 0.35rem;
        padding: 0;
        font-size: 1.1rem;
        color: var(--text-secondary);
        background: var(--border-light);
        border-radius: 8px;
        -webkit-tap-highlight-color: transparent;
        transition: color 0.2s, background 0.2s;
      }
      .back-inline:hover { color: var(--accent); background: var(--border); }
      .important-events-top .container { padding-top: 0; }
      .important-events-top .page-intro {
        margin-bottom: 0.5rem;
        padding-bottom: 0.35rem;
        border-bottom-width: 1px;
      }
      .header-row {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        margin-bottom: 0.2rem;
      }
      .important-events-top .page-intro h1 { font-size: 1.15rem; margin: 0; }
      .important-events-top .page-intro .subtitle {
        font-size: 0.8125rem;
        margin-top: 0;
        margin-bottom: 0;
        line-height: 1.4;
      }
      .important-events-scroll-wrap {
        flex: 1;
        min-height: 0;
        position: relative;
      }
      .important-events-scroll {
        position: absolute;
        inset: 0;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: contain;
        touch-action: pan-y;
      }
      .important-events-scroll .container {
        padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom));
      }
      .important-events-scroll .event-row { padding: var(--space-sm) 0; }
      .important-events-scroll .event-main h3 { font-size: 1.05rem; }
      .important-events-scroll .event-main p { font-size: 0.875rem; }
      .important-events-scroll .event-thumb { max-width: 80px; }
    }
    @media (min-width: 600px) {
      .back-inline { display: none !important; }
    }
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
    .sort-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem var(--space-sm);
      margin-bottom: var(--space-md);
    }
    .sort-label { font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); }
    .sort-toggle {
      display: inline-flex;
      background: var(--border-light);
      border-radius: var(--radius-sm);
      padding: 2px;
    }
    .sort-btn {
      font-size: 0.8125rem;
      font-weight: 500;
      padding: 0.35rem 0.75rem;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--text-secondary);
      -webkit-tap-highlight-color: transparent;
      transition: background 0.2s, color 0.2s;
    }
    .sort-btn:hover { color: var(--text); background: var(--border); }
    .sort-btn.active {
      background: var(--important-soft);
      color: var(--important);
      box-shadow: var(--shadow);
    }
    @media (max-width: 599px) {
      .important-events-top .sort-bar {
        margin-bottom: 0.5rem;
        gap: 0.35rem 0.5rem;
      }
      .important-events-top .sort-label { font-size: 0.75rem; }
      .important-events-top .sort-toggle { padding: 2px; }
      .sort-btn { min-height: 34px; padding: 0 0.6rem; font-size: 0.75rem; }
    }
    .header-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .header-row h1 { margin: 0; }
    .page-intro .subtitle { margin: 0.35rem 0 0 0; }
    /* Zeitstrahl-Design für Wichtige Ereignisse (Farbe --important) */
    .important-timeline-visual {
      margin-bottom: var(--space-xl);
      margin-left: 2.5rem;
      padding-left: var(--space-md);
      position: relative;
    }
    .important-timeline-visual::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--important);
      border-radius: 2px;
      z-index: 0;
    }
    @media (min-width: 480px) {
      .important-timeline-visual { margin-left: 3rem; padding-left: var(--space-lg); }
    }
    .event-row {
      padding: var(--space-md) 0;
      border-bottom: 1px solid var(--border-light);
      position: relative;
      z-index: 1;
    }
    .event-row:last-child { border-bottom: none; }
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
      color: var(--important);
      background: color-mix(in srgb, var(--important) 12%, var(--bg-card));
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
      background: color-mix(in srgb, var(--important) 55%, black);
    }
    .event-body { }
    .event-content h3 { margin: 0; font-size: 1.125rem; font-weight: 600; letter-spacing: -0.02em; }
    .date-detail {
      display: block;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--important);
      margin-top: 0.15rem;
      margin-bottom: 0.25rem;
    }
    .timeline-link {
      display: inline-block;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
      min-height: var(--touch-min);
      padding: 0.25rem 0;
      -webkit-tap-highlight-color: transparent;
    }
    .timeline-link:hover { color: var(--accent); }
    .event-content p { margin: 0.25rem 0 0.5rem 0; font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.5; }
    .event-main {
      display: flex;
      gap: var(--space-sm);
      align-items: flex-start;
    }
    .event-text { flex: 1; min-width: 0; }
    .event-thumb-wrap {
      display: block;
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 6px;
      overflow: hidden;
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }
    .event-thumb {
      width: 100%;
      max-width: 100px;
      aspect-ratio: 4/3;
      object-fit: cover;
      display: block;
    }
    .btn-small {
      font-size: 0.8125rem;
      min-height: 36px;
      padding: 0.45rem 0.85rem;
      -webkit-tap-highlight-color: transparent;
    }
    .btn-photos {
      margin-top: 0.5rem;
      font-size: 0.8125rem;
      color: var(--important);
      background: var(--important-soft);
      border: 1px solid rgba(91, 95, 199, 0.3);
    }
    .btn-photos:hover { background: color-mix(in srgb, var(--important) 18%, var(--bg-card)); color: var(--important-hover); }
    .photos-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-sm);
    }
    .photos-gallery-item {
      position: relative;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border-light);
      background: var(--border-light);
    }
    .photos-gallery-item img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      display: block;
    }
    .photos-gallery-item .main-badge {
      position: absolute;
      bottom: 0.25rem;
      left: 0.25rem;
      font-size: 0.6875rem;
      font-weight: 600;
      color: #fff;
      background: var(--important);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }
    @media (max-width: 599px) {
      .important-events-scroll .event-main { gap: 0.5rem; }
      .important-events-scroll .event-thumb { max-width: 80px; }
      .photos-gallery { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
    }
  `],
})
export class ImportantEventsComponent implements OnInit {
  events: Event[] = [];
  sortOrder: 'asc' | 'desc' = 'asc';
  loading = true;
  error: string | null = null;
  photosModalEvent: Event | null = null;

  get sortedEvents(): Event[] {
    const dir = this.sortOrder === 'asc' ? 1 : -1;
    return [...this.events].sort((a, b) => {
      const y = Math.sign(a.year - b.year);
      if (y !== 0) return dir * y;
      const ma = a.month ?? 0;
      const mb = b.month ?? 0;
      const m = Math.sign(ma - mb);
      if (m !== 0) return dir * m;
      const da = a.day ?? 0;
      const db = b.day ?? 0;
      return dir * Math.sign(da - db);
    });
  }

  setSortOrder(order: 'asc' | 'desc'): void {
    this.sortOrder = order;
  }

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

  formatYear(ev: Event): string {
    return ev.year < 0 ? Math.abs(ev.year) + ' v. Chr.' : String(ev.year);
  }

  getMainImage(ev: Event): EventImage | null {
    const imgs = ev.images ?? [];
    const main = imgs.find((i) => i.isMain);
    return main ?? imgs[0] ?? null;
  }

  sortedImages(ev: Event): EventImage[] {
    const imgs = ev.images ?? [];
    return [...imgs].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return a.sortOrder - b.sortOrder;
    });
  }

  imageSrc(url: string): string {
    return this.api.getImageUrl(url);
  }

  openPhotosModal(ev: Event): void {
    this.photosModalEvent = ev;
  }

  closePhotosModal(): void {
    this.photosModalEvent = null;
  }
}
