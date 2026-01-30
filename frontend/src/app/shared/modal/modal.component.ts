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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
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
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-md);
      padding-left: calc(var(--space-md) + env(safe-area-inset-left));
      padding-right: calc(var(--space-md) + env(safe-area-inset-right));
      padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom));
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .modal-overlay--compact {
      padding: var(--space-sm);
      padding-left: calc(var(--space-sm) + env(safe-area-inset-left));
      padding-right: calc(var(--space-sm) + env(safe-area-inset-right));
      padding-bottom: calc(var(--space-sm) + env(safe-area-inset-bottom));
    }
    .modal-overlay:not(.modal-overlay--compact) {
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .modal-dialog {
      width: 100%;
      max-width: min(480px, calc(100vw - 2 * var(--space-md)));
      min-width: 0;
      max-height: calc(100dvh - 2 * var(--space-md));
      display: flex;
      flex-direction: column;
      background: var(--bg-card);
      border-radius: var(--radius);
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-light);
      margin: auto;
      overflow: hidden;
      box-sizing: border-box;
    }
    .modal-dialog--compact {
      max-height: min(720px, 92dvh);
      max-width: min(380px, calc(100vw - 2 * var(--space-md)));
      min-width: 0;
      margin: auto;
    }
    .modal-dialog--compact .modal-header {
      padding: var(--space-sm) var(--space-md);
      min-height: 0;
    }
    .modal-dialog--compact .modal-title {
      font-size: 1rem;
      font-weight: 600;
    }
    .modal-dialog--compact .modal-close {
      width: 32px;
      height: 32px;
      padding: 0;
    }
    .modal-dialog--compact .modal-body {
      padding: 0 var(--space-md) var(--space-md);
      overflow: visible;
      min-height: 0;
    }
    @media (min-width: 600px) {
      .modal-dialog {
        max-width: 520px;
        max-height: calc(100vh - 2 * var(--space-lg));
        max-height: calc(100dvh - 2 * var(--space-lg));
      }
      .modal-dialog--compact {
        max-height: min(740px, 90dvh);
        max-width: 400px;
      }
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-sm);
      padding: var(--space-lg) var(--space-lg) 0;
      flex-shrink: 0;
    }
    .modal-title {
      margin: 0;
      font-size: 1.375rem;
      font-weight: 600;
      letter-spacing: -0.025em;
      color: var(--text);
    }
    .modal-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 12px;
      color: var(--text-secondary);
      -webkit-tap-highlight-color: transparent;
      transition: color 0.2s, background 0.2s;
    }
    .modal-close:hover {
      color: var(--text);
      background: var(--border-light);
    }
    .modal-body {
      padding: var(--space-lg);
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }
    @media (min-width: 600px) {
      .modal-body { padding: var(--space-xl); }
    }
    @media (max-width: 599px) {
      .modal-overlay--fullscreen-mobile {
        top: var(--app-header-offset, calc(52px + env(safe-area-inset-top)));
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
        padding-bottom: calc(var(--space-lg) + env(safe-area-inset-bottom));
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
