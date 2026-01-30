import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import type { Event as AppEvent } from '../../core/models/timeline.model';

const SENTINEL_YEAR = 2000;

function pad(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" #f="ngForm">
      <label class="label">Titel</label>
      <input type="text" name="title" [(ngModel)]="title" required placeholder="z.B. Urknall" />

      <label class="label">Jahr (v. Chr. negativ, n. Chr. positiv)</label>
      <input type="number" name="year" [(ngModel)]="year" required placeholder="-13700000000 oder 2024" step="any" />

      <div class="date-optional">
        <label class="label">Datum (optional)</label>
        <input
          type="date"
          name="date"
          [value]="dateInputValue"
          (input)="onDateInput($event)"
          class="date-input"
          [attr.title]="'Kalender öffnen oder Datum eingeben (TT.MM.JJJJ)'"
        />
      </div>

      <label class="label">Beschreibung (optional)</label>
      <textarea name="description" [(ngModel)]="description" placeholder="Kurze Beschreibung…"></textarea>

      <label class="checkbox-label">
        <input type="checkbox" name="isImportant" [(ngModel)]="isImportant" />
        Als wichtiges Ereignis markieren
      </label>

      @if (!event) {
        <div class="images-optional">
          <label class="label">Bilder (optional) – erstes = Hauptbild</label>
          <input
            type="file"
            name="images"
            #fileInput
            accept=".jpg,.jpeg,.png,.gif,.webp"
            multiple
            (change)="onFilesSelected($event)"
            class="file-input"
          />
          @if (selectedFiles.length) {
            <p class="file-hint">{{ selectedFiles.length }} Bild(er) ausgewählt</p>
          }
        </div>
      }

      <div class="actions">
        <button type="submit" [disabled]="!f.valid || saving">{{ submitLabel }}</button>
      </div>
    </form>
  `,
  styles: [`
    :host { display: block; box-sizing: border-box; width: 100%; min-width: 0; overflow-x: hidden; }
    form { width: 100%; min-width: 0; box-sizing: border-box; overflow-x: hidden; }
    label { display: block; }
    .label { font-size: 0.75rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.2rem; }
    input, textarea {
      margin-bottom: 0.5rem;
      box-sizing: border-box;
      max-width: 100%;
      font-size: 0.9375rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      min-height: 36px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .checkbox-label input { width: 1.1rem; height: 1.1rem; margin: 0; flex-shrink: 0; }
    .date-optional {
      margin-bottom: 0.3rem;
      width: 100%;
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }
    .date-optional .label { margin-bottom: 0.2rem; }
    .date-input {
      display: block;
      width: 100%;
      max-width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }
    /* Safari: width: 100% wird bei type=date nur mit display: block respektiert; Padding-Reset verhindert extra Abstand */
    .date-input::-webkit-datetime-edit,
    .date-input::-webkit-datetime-edit-fields-wrapper,
    .date-input::-webkit-datetime-edit-text,
    .date-input::-webkit-datetime-edit-day-field,
    .date-input::-webkit-datetime-edit-month-field,
    .date-input::-webkit-datetime-edit-year-field {
      padding: 0;
    }
    .date-input::-webkit-date-and-time-value { min-height: 1.5em; }
    .images-optional { margin-bottom: 0.5rem; }
    .images-optional .label { margin-bottom: 0.2rem; }
    .file-input { display: block; margin-bottom: 0.3rem; font-size: 0.875rem; max-width: 100%; }
    .file-hint { margin: 0; font-size: 0.75rem; color: var(--text-muted); }
    .actions { margin-top: 0.5rem; }
    .actions button { padding: 0.5rem 1rem; font-size: 0.875rem; }
    @media (max-width: 600px) {
      .label { font-size: 0.7rem; margin-bottom: 0.15rem; }
      input, textarea { margin-bottom: 0.4rem; font-size: 16px; }
      input::placeholder, textarea::placeholder { font-size: 0.8125rem; }
      .checkbox-label { margin-bottom: 0.35rem; font-size: 0.8125rem; min-height: 32px; }
      .checkbox-label input { width: 1rem; height: 1rem; }
      .date-optional { margin-bottom: 0.25rem; }
      .images-optional { margin-bottom: 0.35rem; }
      .file-input { font-size: 0.8125rem; margin-bottom: 0.25rem; }
      .file-hint { font-size: 0.7rem; }
      .actions { margin-top: 0.4rem; }
      .actions button { padding: 0.4rem 0.85rem; font-size: 0.8125rem; }
    }
    @media (max-height: 660px), (max-width: 380px) {
      .label { font-size: 0.6875rem; margin-bottom: 0.1rem; }
      input, textarea { margin-bottom: 0.3rem; font-size: 16px; }
      .checkbox-label { margin-bottom: 0.3rem; font-size: 0.75rem; min-height: 28px; }
      .checkbox-label input { width: 0.95rem; height: 0.95rem; }
      .date-optional { margin-bottom: 0.2rem; }
      .images-optional { margin-bottom: 0.3rem; }
      .actions { margin-top: 0.3rem; }
      .actions button { padding: 0.35rem 0.75rem; font-size: 0.75rem; }
    }
  `],
})
export class EventFormComponent implements OnChanges {
  @Input() timelineId!: number;
  /** Bearbeiten-Modus: wenn gesetzt, Formular vorbelegen und beim Speichern updateEvent aufrufen. */
  @Input() event: AppEvent | null = null;
  @Output() created = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  /** Wird emittiert, wenn Bilder im Hintergrund hochgeladen werden (Event ist bereits gespeichert). */
  @Output() imagesUploading = new EventEmitter<void>();

  title = '';
  year: number | null = null;
  month: number | null = null;
  day: number | null = null;
  description = '';
  isImportant = false;
  saving = false;
  selectedFiles: File[] = [];
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  get submitLabel(): string {
    if (this.saving) return this.event ? 'Wird gespeichert…' : 'Wird hinzugefügt…';
    return this.event ? 'Speichern' : 'Hinzufügen';
  }

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const ev = changes['event'];
    if (!ev) return;
    const e = ev.currentValue as AppEvent | null;
    if (e) {
      this.title = e.title;
      this.year = e.year;
      this.month = e.month ?? null;
      this.day = e.day ?? null;
      this.description = e.description ?? '';
      this.isImportant = e.isImportant ?? false;
      this.selectedFiles = [];
      const input = this.fileInputRef?.nativeElement;
      if (input) input.value = '';
    } else {
      this.title = '';
      this.year = null;
      this.month = null;
      this.day = null;
      this.description = '';
      this.isImportant = false;
      this.selectedFiles = [];
    }
  }

  onFilesSelected(e: globalThis.Event): void {
    const el = (e.target as HTMLInputElement) ?? null;
    const list = el?.files;
    this.selectedFiles = list ? Array.from(list) : [];
  }

  get dateInputValue(): string {
    const m = this.month ?? 1;
    const d = this.day ?? 1;
    const y = this.year != null && this.year >= 1 && this.year <= 9999 ? this.year : SENTINEL_YEAR;
    if (this.month == null && this.day == null) return '';
    return `${y}-${pad(m)}-${pad(d)}`;
  }

  onDateInput(e: globalThis.Event): void {
    const el = (e.target as HTMLInputElement) ?? null;
    const v = (el?.value ?? '').trim();
    if (!v) {
      this.month = null;
      this.day = null;
      return;
    }
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!match) return;
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      this.month = month;
      this.day = day;
    }
  }

  onSubmit(): void {
    if (this.year === null || !this.title.trim() || this.saving) return;
    this.saving = true;
    const payload = {
      title: this.title.trim(),
      year: this.year,
      month: this.month ?? undefined,
      day: this.day ?? undefined,
      description: this.description.trim() || undefined,
      isImportant: this.isImportant,
    };

    if (this.event) {
      this.api.updateEvent(this.event.id, payload).subscribe({
        next: () => {
          this.saving = false;
          this.updated.emit();
        },
        error: (err) => {
          this.saving = false;
          console.error(err?.error?.error || 'Ereignis konnte nicht gespeichert werden.');
        },
      });
      return;
    }

    const files = [...this.selectedFiles];
    this.api
      .createEvent({
        timelineId: this.timelineId,
        ...payload,
      })
      .subscribe({
        next: (event) => {
          this.title = '';
          this.year = null;
          this.month = null;
          this.day = null;
          this.description = '';
          this.isImportant = false;
          this.selectedFiles = [];
          const input = this.fileInputRef?.nativeElement;
          if (input) input.value = '';
          this.saving = false;
          this.created.emit();
          if (files.length) {
            this.imagesUploading.emit();
            this.api.uploadEventImages(event.id, files).subscribe({
              next: () => {},
              error: (err) =>
                console.error(err?.error?.error || 'Bilder konnten nicht hochgeladen werden.'),
            });
          }
        },
        error: (err) => {
          this.saving = false;
          console.error(err?.error?.error || 'Ereignis konnte nicht erstellt werden.');
        },
      });
  }
}
