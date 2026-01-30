import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Timeline } from '../../../core/models/timeline.model';
import { ModalComponent } from '../../../shared/modal/modal.component';

@Component({
  selector: 'app-timeline-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent],
  template: `
    <div class="page-timelines">
      <div class="container">
        <header class="page-hero">
          <h1>Deine Zeitstrahlen</h1>
          <p class="subtitle">Wähle eine Zeitlinie oder erstelle eine neue – vom Urknall bis heute.</p>
        </header>

        @if (loading) {
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Lade Zeitstrahlen…</p>
          </div>
        } @else if (error) {
          <div class="error-state">
            <p>{{ error }}</p>
          </div>
        } @else if (timelines.length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <h2>Noch keine Zeitstrahlen</h2>
            <p>Erstelle deinen ersten Zeitstrahl und füge Ereignisse hinzu.</p>
            <button type="button" class="btn-empty-cta" (click)="openModal()">Erste Zeitlinie erstellen</button>
          </div>
        } @else {
          <div class="timeline-grid">
            @for (t of timelines; track t.id) {
              <div
                class="timeline-card"
                [style.--timeline-color]="t.color || '#0071e3'"
                (click)="goToTimeline(t.slug)"
                (keydown.enter)="goToTimeline(t.slug)"
                role="link"
                tabindex="0"
              >
                <div class="timeline-card-accent"></div>
                <div class="timeline-card-content">
                  <span class="timeline-name">{{ t.name }}</span>
                  @if (t.description) {
                    <span class="timeline-desc">{{ t.description }}</span>
                  }
                  <span class="timeline-type">{{ typeLabel(t.type) }}</span>
                </div>
                <span class="timeline-arrow" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            }
          </div>
        }
      </div>
    </div>

    @if (!loading && !error) {
      <button type="button" class="add-fab" (click)="openModal()" [attr.aria-label]="'Neue Zeitlinie hinzufügen'">
        <span class="add-fab-icon" aria-hidden="true">+</span>
        <span class="add-fab-text">Hinzufügen</span>
      </button>
    }

    <app-modal [isOpen]="modalOpen" title="Neue Zeitlinie" (closed)="closeModal()">
      <form (ngSubmit)="onSubmit()" #f="ngForm" class="modal-form">
        <label class="label">Name</label>
        <input type="text" name="name" [(ngModel)]="newName" required placeholder="z.B. Antike" />
        <div class="actions">
          <button type="button" class="btn-secondary" (click)="closeModal()">Abbrechen</button>
          <button type="submit" [disabled]="!newName.trim() || saving">{{ saving ? 'Wird erstellt…' : 'Hinzufügen' }}</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .page-timelines {
      padding: var(--space-2xl) 0 var(--space-3xl);
    }
    .page-hero {
      margin-bottom: var(--space-2xl);
      padding-bottom: var(--space-xl);
    }
    .page-hero h1 {
      margin-bottom: 0.5rem;
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 600;
      letter-spacing: -0.04em;
      line-height: 1.1;
    }
    .page-hero .subtitle {
      color: var(--text-secondary);
      font-size: clamp(1rem, 2vw, 1.25rem);
      line-height: 1.5;
      margin: 0;
      max-width: 42ch;
    }

    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: var(--space-2xl) 0;
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
    .error-state { color: #c41e3a; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--space-2xl) var(--space-md);
      gap: 1rem;
    }
    .empty-icon {
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent-soft);
      border-radius: 50%;
      color: var(--accent);
    }
    .empty-state h2 {
      font-size: 1.375rem;
      font-weight: 600;
      margin: 0;
    }
    .empty-state p {
      color: var(--text-secondary);
      margin: 0;
      max-width: 280px;
      font-size: 0.9375rem;
    }
    .btn-empty-cta {
      margin-top: 0.5rem;
    }

    .timeline-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-md);
    }
    @media (min-width: 480px) {
      .timeline-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--space-lg);
      }
    }

    .timeline-card {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-lg);
      background: var(--bg-card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      border: 1px solid var(--border-light);
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      -webkit-tap-highlight-color: transparent;
      overflow: hidden;
    }
    .timeline-card:hover, .timeline-card:focus-visible {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
      border-color: var(--border);
    }
    .timeline-card:active { transform: translateY(-2px); }

    .timeline-card-accent {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--timeline-color);
      border-radius: 4px 0 0 4px;
    }
    .timeline-card:hover .timeline-card-accent {
      width: 5px;
    }

    .timeline-card-content {
      flex: 1;
      min-width: 0;
      padding-left: 0.5rem;
    }
    .timeline-name {
      display: block;
      font-size: 1.125rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin-bottom: 0.35rem;
      color: var(--text);
    }
    .timeline-desc {
      display: block;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0 0 0.5rem 0;
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .timeline-type {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .timeline-arrow {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--accent-soft);
      color: var(--accent);
      transition: all 0.2s;
    }
    .timeline-card:hover .timeline-arrow {
      background: var(--accent);
      color: #fff;
    }

    .modal-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .actions {
      display: flex;
      gap: var(--space-sm);
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }
    .actions button:last-child { margin-left: auto; }
  `],
})
export class TimelineListComponent implements OnInit {
  timelines: Timeline[] = [];
  loading = true;
  error: string | null = null;
  newName = '';
  saving = false;
  modalOpen = false;

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  goToTimeline(slug: string): void {
    this.router.navigate(['/timelines', slug]);
  }

  openModal(): void {
    this.modalOpen = true;
    this.newName = '';
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.getTimelines().subscribe({
      next: (list) => {
        this.timelines = list;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Zeitstrahlen konnten nicht geladen werden.';
        this.loading = false;
      },
    });
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = { nation: 'Nation', continent: 'Kontinent', custom: 'Eigene' };
    return map[type] || type;
  }

  onSubmit(): void {
    if (!this.newName.trim() || this.saving) return;
    this.saving = true;
    this.api.createTimeline({ name: this.newName.trim() }).subscribe({
      next: () => {
        this.newName = '';
        this.saving = false;
        this.closeModal();
        this.load();
      },
      error: (err) => {
        this.error = err?.error?.error || 'Zeitlinie konnte nicht erstellt werden.';
        this.saving = false;
      },
    });
  }
}
