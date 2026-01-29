import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div
        class="modal-overlay"
        [class.modal-overlay--compact]="compact"
        [class.modal-overlay--fullscreen-mobile]="fullscreenOnMobile"
        (click)="onOverlayClick($event)"
        role="presentation"
      >
        <div
          class="modal-dialog"
          [class.modal-dialog--compact]="compact"
          [class.modal-dialog--fullscreen-mobile]="fullscreenOnMobile"
          role="dialog"
          [attr.aria-modal]="true"
          [attr.aria-labelledby]="titleId"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header">
            <h2 class="modal-title" [id]="titleId">{{ title }}</h2>
            <button
              type="button"
              class="modal-close"
              (click)="close()"
              [attr.aria-label]="'Schließen'"
            >
              <span class="modal-close-icon" aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-sm);
      padding-left: calc(var(--space-sm) + env(safe-area-inset-left));
      padding-right: calc(var(--space-sm) + env(safe-area-inset-right));
      padding-bottom: calc(var(--space-sm) + env(safe-area-inset-bottom));
      background: rgba(0, 0, 0, 0.4);
    }
    .modal-overlay--compact {
      padding: 0.35rem;
      padding-left: calc(0.35rem + env(safe-area-inset-left));
      padding-right: calc(0.35rem + env(safe-area-inset-right));
      padding-bottom: calc(0.35rem + env(safe-area-inset-bottom));
    }
    .modal-overlay:not(.modal-overlay--compact) {
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .modal-dialog {
      width: 100%;
      max-width: 480px;
      max-height: calc(100vh - 2 * var(--space-sm));
      max-height: calc(100dvh - 2 * var(--space-sm));
      display: flex;
      flex-direction: column;
      background: var(--bg-card);
      border-radius: var(--radius);
      box-shadow: var(--shadow-hover);
      border: 1px solid var(--border-light);
      margin: auto;
    }
    .modal-dialog--compact {
      max-height: min(200px, 62dvh);
      max-width: 320px;
      margin: auto;
    }
    .modal-dialog--compact .modal-header {
      padding: 0.2rem 0.35rem 0 0.35rem;
      min-height: 0;
    }
    .modal-dialog--compact .modal-title {
      font-size: 0.875rem;
      font-weight: 600;
    }
    .modal-dialog--compact .modal-close {
      width: 28px;
      height: 28px;
    }
    .modal-dialog--compact .modal-close-icon {
      font-size: 1.2rem;
    }
    .modal-dialog--compact .modal-body {
      padding: 0.15rem 0.35rem 0.35rem;
      overflow: visible;
    }
    @media (min-width: 600px) {
      .modal-dialog {
        max-width: 520px;
        max-height: calc(100vh - 2 * var(--space-lg));
        max-height: calc(100dvh - 2 * var(--space-lg));
      }
      .modal-dialog--compact {
        max-height: min(220px, 62dvh);
        max-width: 340px;
      }
      .modal-dialog--compact .modal-body {
        padding: 0.25rem 0.4rem 0.4rem;
      }
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-sm);
      padding: var(--space-md) var(--space-md) 0;
      flex-shrink: 0;
    }
    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text);
    }
    .modal-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--touch-min);
      height: var(--touch-min);
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      -webkit-tap-highlight-color: transparent;
      transition: color 0.2s, background 0.2s;
    }
    .modal-close:hover {
      color: var(--text);
      background: var(--border-light);
    }
    .modal-close-icon {
      font-size: 1.75rem;
      line-height: 1;
      font-weight: 300;
    }
    .modal-body {
      padding: var(--space-md);
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }
    @media (min-width: 600px) {
      .modal-body { padding: var(--space-lg); }
    }
    /* Fullscreen unter Nav-Header (mobil): Header bleibt sichtbar */
    @media (max-width: 599px) {
      .modal-overlay--fullscreen-mobile {
        top: var(--app-header-offset, calc(48px + env(safe-area-inset-top)));
        left: 0;
        right: 0;
        bottom: 0;
        padding: 0;
        align-items: stretch;
      }
      .modal-overlay--fullscreen-mobile .modal-dialog--fullscreen-mobile {
        max-width: none;
        width: 100%;
        height: 100%;
        max-height: none;
        border-radius: 0;
        border: none;
        border-left: none;
        border-right: none;
        border-bottom: none;
      }
      .modal-dialog--fullscreen-mobile .modal-header {
        padding-left: var(--container-padding);
        padding-right: var(--container-padding);
      }
      .modal-dialog--fullscreen-mobile .modal-body {
        padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom));
      }
    }
  `],
})
export class ModalComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() compact = false;
  @Input() fullscreenOnMobile = false;
  @Input() closeOnOverlayClick = true;
  @Output() closed = new EventEmitter<void>();

  titleId = 'modal-title';

  ngOnChanges(): void {
    this.toggleBodyClass(this.isOpen);
  }

  ngOnDestroy(): void {
    this.toggleBodyClass(false);
  }

  private toggleBodyClass(open: boolean): void {
    if (typeof document === 'undefined') return;
    if (open) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: Event): void {
    if (this.closeOnOverlayClick && (event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }
}
