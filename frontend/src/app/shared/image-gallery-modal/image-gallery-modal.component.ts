import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import type { EventImage } from '../../core/models/timeline.model';

@Component({
  selector: 'app-image-gallery-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen && images.length > 0) {
      <div
        class="gallery-overlay"
        (click)="onOverlayClick($event)"
        role="presentation"
      >
        <button
          type="button"
          class="gallery-close"
          (click)="close()"
          [attr.aria-label]="'Schließen'"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        @if (images.length > 1) {
          <button
            type="button"
            class="gallery-nav gallery-prev"
            (click)="prev(); $event.stopPropagation()"
            [attr.aria-label]="'Vorheriges Bild'"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button
            type="button"
            class="gallery-nav gallery-next"
            (click)="next(); $event.stopPropagation()"
            [attr.aria-label]="'Nächstes Bild'"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        }

        <div class="gallery-content" (click)="$event.stopPropagation()">
          <img
            [src]="imageSrc(currentImage.url)"
            [alt]="alt"
            class="gallery-image"
            (click)="$event.stopPropagation()"
          />
        </div>

        @if (images.length > 1) {
          <div class="gallery-counter">
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .gallery-overlay {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(0, 0, 0, 0.94);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    }
    .gallery-close {
      position: absolute;
      top: calc(var(--space-md) + env(safe-area-inset-top));
      right: calc(var(--space-md) + env(safe-area-inset-right));
      width: 44px;
      height: 44px;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      -webkit-tap-highlight-color: transparent;
    }
    .gallery-close:hover {
      background: rgba(255, 255, 255, 0.25);
      color: #fff;
    }
    .gallery-close svg {
      flex-shrink: 0;
      stroke-width: 2.5;
    }
    .gallery-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 48px;
      height: 48px;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      -webkit-tap-highlight-color: transparent;
    }
    .gallery-nav:hover {
      background: rgba(255, 255, 255, 0.25);
      color: #fff;
    }
    .gallery-prev { left: var(--space-md); }
    .gallery-next { right: var(--space-md); }
    @media (max-width: 599px) {
      .gallery-prev { left: var(--space-sm); }
      .gallery-next { right: var(--space-sm); }
    }
    .gallery-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      max-width: 100%;
      padding: 4rem 3rem 3.5rem;
    }
    .gallery-image {
      max-width: 100%;
      max-height: calc(100vh - 8rem);
      max-height: calc(100dvh - 8rem);
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
    }
    .gallery-counter {
      position: absolute;
      bottom: calc(var(--space-lg) + env(safe-area-inset-bottom));
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      padding: 0.4rem 0.75rem;
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 999px;
    }
  `],
})
export class ImageGalleryModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() images: EventImage[] = [];
  @Input() initialIndex = 0;
  @Input() alt = '';
  @Output() closed = new EventEmitter<void>();

  currentIndex = 0;

  get currentImage(): EventImage {
    return this.images[this.currentIndex] ?? this.images[0];
  }

  constructor(private api: ApiService) {}

  ngOnChanges(): void {
    if (this.isOpen && this.images.length > 0) {
      const i = Math.max(0, Math.min(this.initialIndex, this.images.length - 1));
      this.currentIndex = i;
    }
  }

  imageSrc(url: string): string {
    return this.api.getImageUrl(url);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }

  @HostListener('document:keydown.arrowleft')
  onArrowLeft(): void {
    if (this.isOpen && this.images.length > 1) this.prev();
  }

  @HostListener('document:keydown.arrowright')
  onArrowRight(): void {
    if (this.isOpen && this.images.length > 1) this.next();
  }

  prev(): void {
    this.currentIndex = this.currentIndex <= 0
      ? this.images.length - 1
      : this.currentIndex - 1;
  }

  next(): void {
    this.currentIndex = this.currentIndex >= this.images.length - 1
      ? 0
      : this.currentIndex + 1;
  }

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('gallery-overlay')) {
      this.close();
    }
  }
}
