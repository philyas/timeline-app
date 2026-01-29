import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

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
        <label class="label">Datum (optional) – Picker oder manuell eingeben</label>
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

      <div class="actions">
        <button type="submit" [disabled]="!f.valid || saving">{{ saving ? 'Wird hinzugefügt…' : 'Hinzufügen' }}</button>
      </div>
    </form>
  `,
  styles: [`
    label { display: block; }
    .label { font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.25rem; }
    input, textarea { margin-bottom: 1rem; }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      font-size: 0.9375rem;
      min-height: var(--touch-min);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .checkbox-label input { width: 1.25rem; height: 1.25rem; margin: 0; flex-shrink: 0; }
    .date-optional { margin-bottom: 0.5rem; }
    .date-optional .label { margin-bottom: 0.25rem; }
    .date-input {
      width: 100%;
      min-width: 160px;
      box-sizing: border-box;
    }
    .images-optional { margin-bottom: 1rem; }
    .images-optional .label { margin-bottom: 0.25rem; }
    .file-input { display: block; margin-bottom: 0.35rem; font-size: 0.9375rem; }
    .file-hint { margin: 0; font-size: 0.8125rem; color: var(--text-muted); }
    .actions { margin-top: 1rem; }
  `],
})
export class EventFormComponent {
  @Input() timelineId!: number;
  @Output() created = new EventEmitter<void>();
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

  constructor(private api: ApiService) {}

  onFilesSelected(e: Event): void {
    const el = e.target as HTMLInputElement;
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

  onDateInput(e: Event): void {
    const el = e.target as HTMLInputElement;
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
    const files = [...this.selectedFiles];
    this.api
      .createEvent({
        timelineId: this.timelineId,
        title: this.title.trim(),
        year: this.year,
        month: this.month ?? undefined,
        day: this.day ?? undefined,
        description: this.description.trim() || undefined,
        isImportant: this.isImportant,
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
