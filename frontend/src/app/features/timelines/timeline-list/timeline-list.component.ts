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
    <div class="container">
      <header class="page-intro">
        <h1>Deine Zeitstrahlen</h1>
        <p class="subtitle">Wähle eine Zeitlinie oder erstelle eine neue, um Ereignisse vom Urknall bis heute zu erkunden.</p>
      </header>

      @if (loading) {
        <p class="muted">Lade Zeitstrahlen…</p>
      } @else if (error) {
        <p class="error">{{ error }}</p>
      } @else {
        <div class="timeline-grid">
          @for (t of timelines; track t.id) {
            <div class="timeline-card" [style.--timeline-color]="t.color || '#0d6b5c'" (click)="goToTimeline(t.slug)" (keydown.enter)="goToTimeline(t.slug)" role="link" tabindex="0">
              <span class="timeline-name">{{ t.name }}</span>
              <span class="desc">{{ t.description }}</span>
              <span class="type">{{ typeLabel(t.type) }}</span>
            </div>
          }
        </div>
      }
    </div>

    @if (!loading && !error) {
      <button type="button" class="add-fab" (click)="openModal()" [attr.aria-label]="'Neue Zeitlinie hinzufügen'">
        <span class="add-fab-icon" aria-hidden="true">+</span>
        <span class="add-fab-text">Hinzufügen</span>
      </button>
    }

    <app-modal [isOpen]="modalOpen" title="Neue Zeitlinie" (closed)="closeModal()">
      <form (ngSubmit)="onSubmit()" #f="ngForm">
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
    .timeline-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    @media (min-width: 480px) {
      .timeline-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
    }
    .timeline-card {
      display: block;
      padding: var(--space-md) var(--space-md) var(--space-md) calc(var(--space-md) + 4px);
      background: var(--bg-card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      border: 1px solid var(--border-light);
      border-left: 4px solid var(--timeline-color);
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, border-left-color 0.2s;
      -webkit-tap-highlight-color: transparent;
      min-height: 88px;
      position: relative;
    }
    .timeline-card:hover, .timeline-card:focus-visible {
      transform: translateY(-3px);
      box-shadow: var(--shadow-hover);
      border-left-width: 5px;
      border-left-color: var(--timeline-color);
    }
    .timeline-card:active { transform: translateY(-1px); }
    .timeline-name {
      display: block;
      font-size: 1.125rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin-bottom: 0.35rem;
      color: var(--text);
    }
    .timeline-card .desc {
      display: block;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0 0 0.5rem 0;
      line-height: 1.45;
    }
    .timeline-card .desc:empty { display: none; }
    .type {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .actions {
      display: flex;
      gap: var(--space-sm);
      margin-top: 1.25rem;
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
