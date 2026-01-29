import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import type { Event as AppEvent, EventImage } from '../../core/models/timeline.model';

@Component({
  selector: 'app-event-photos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="event-photos">
      <div class="upload-row">
        <label class="label">Neue Bilder hochladen</label>
        <input
          type="file"
          #fileInput
          accept=".jpg,.jpeg,.png,.gif,.webp"
          multiple
          (change)="onFilesSelected($event)"
          class="file-input"
        />
        @if (uploading) {
          <p class="muted">Wird hochgeladen…</p>
        }
      </div>

      @if (images.length) {
      <div class="gallery">
        @for (img of images; track img.id) {
        <div class="gallery-item">
          <img [src]="imageSrc(img.url)" [alt]="event?.title ?? ''" loading="lazy" class="thumb" />
          <div class="thumb-actions">
            @if (!img.isMain) {
              <button type="button" class="btn-small" (click)="setMain(img)">Als Hauptbild</button>
            } @else {
              <span class="main-badge">Hauptbild</span>
            }
            <button type="button" class="btn-small btn-secondary" (click)="remove(img)">Löschen</button>
          </div>
        </div>
        }
      </div>
      }

      @if (event && (!event.images || event.images.length === 0) && !uploading) {
        <p class="muted">Noch keine Bilder. Lade welche hoch.</p>
      }
    </div>
  `,
  styles: [`
    .event-photos { padding: 0; }
    .label { font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.25rem; display: block; }
    .upload-row { margin-bottom: var(--space-md); }
    .file-input { display: block; margin-top: 0.35rem; font-size: 0.9375rem; }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-sm);
    }
    .gallery-item {
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border-light);
      background: var(--border-light);
    }
    .thumb {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      display: block;
    }
    .thumb-actions {
      padding: 0.35rem 0.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      align-items: center;
    }
    .main-badge { font-size: 0.75rem; font-weight: 600; color: var(--accent); }
    .btn-small { font-size: 0.75rem; padding: 0.3rem 0.5rem; min-height: 32px; }
    .muted { font-size: 0.875rem; margin: 0.5rem 0 0 0; }
  `],
})
export class EventPhotosComponent {
  @Input() event: AppEvent | null = null;
  @Output() updated = new EventEmitter<void>();
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  uploading = false;

  get images(): EventImage[] {
    return this.event?.images ?? [];
  }

  constructor(private api: ApiService) {}

  imageSrc(url: string): string {
    return this.api.getImageUrl(url);
  }

  onFilesSelected(e: Event): void {
    const el = (e.target as HTMLInputElement | null) ?? undefined;
    const files = el?.files ? Array.from(el.files) : [];
    if (!files.length || !this.event) return;
    this.uploading = true;
    this.api.uploadEventImages(this.event.id, files).subscribe({
      next: () => {
        this.uploading = false;
        this.updated.emit();
        if (this.fileInputRef?.nativeElement) this.fileInputRef.nativeElement.value = '';
      },
      error: () => {
        this.uploading = false;
      },
    });
  }

  setMain(img: EventImage): void {
    if (!this.event) return;
    this.api.setEventMainImage(this.event.id, img.id).subscribe({
      next: () => this.updated.emit(),
      error: () => {},
    });
  }

  remove(img: EventImage): void {
    if (!this.event || !confirm('Bild wirklich löschen?')) return;
    this.api.deleteEventImage(this.event.id, img.id).subscribe({
      next: () => this.updated.emit(),
      error: () => {},
    });
  }
}
