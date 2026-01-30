import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Timeline, Event, EventImage } from '../../../core/models/timeline.model';
import { EventFormComponent } from '../../../shared/event-form/event-form.component';
import { EventPhotosComponent } from '../../../shared/event-photos/event-photos.component';
import { ImageGalleryModalComponent } from '../../../shared/image-gallery-modal/image-gallery-modal.component';
import { ModalComponent } from '../../../shared/modal/modal.component';

@Component({
  selector: 'app-timeline-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, EventFormComponent, EventPhotosComponent, ImageGalleryModalComponent, ModalComponent],
  template: `
    <div class="timeline-page" [style.--timeline-color]="timeline?.color || '#0071e3'">
      <!-- Header -->
      <header class="timeline-header">
        <div class="header-content">
          <a routerLink="/timelines" class="back-btn" aria-label="Zurück">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </a>
          @if (timeline) {
            <div class="header-info">
              <h1>{{ timeline.name }}</h1>
              @if (timeline.description) {
                <p>{{ timeline.description }}</p>
              }
            </div>
            <button type="button" class="header-action" (click)="deleteTimeline()" aria-label="Zeitlinie löschen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          }
        </div>
      </header>

      @if (loading) {
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Lade Zeitstrahl…</p>
        </div>
      } @else if (error) {
        <div class="error-state">
          <p>{{ error }}</p>
        </div>
      } @else if (timeline) {
        <!-- Timeline section: fixed year bar + scrollable track -->
        <div class="timeline-section">
          @if (events.length > 0) {
            <div class="center-year-bar" aria-hidden="true">
              <span class="center-year-label">{{ centerYearLabel }}</span>
            </div>
          }
          <div class="timeline-container"
               #timelineContainer
               (scroll)="onTimelineScroll()"
               (mousedown)="onDragStart($event)"
               (touchstart)="onTouchStart($event)"
               [class.dragging]="isDragging"
               [class.empty]="events.length === 0">
          
          @if (events.length === 0) {
            <!-- Empty State with centered Add Button -->
            <div class="empty-state">
              <button type="button" class="add-first-btn" (click)="openModal()">
                <span class="add-icon">+</span>
              </button>
              <p>Erstes Ereignis hinzufügen</p>
            </div>
          } @else {
            <!-- Timeline Track -->
            <div class="timeline-track" #timelineTrack [style.width.px]="trackWidth">
              <!-- The axis line -->
              <div class="axis-line"></div>
              
              <!-- Year markers -->
              @for (year of yearMarkers; track year) {
                <div class="year-marker" [style.left.px]="getYearPosition(year)">
                  <span class="year-label">{{ formatYearLabel(year) }}</span>
                  <div class="marker-tick"></div>
                </div>
              }
              
              <!-- Events -->
              @for (ev of sortedEvents; track ev.id; let i = $index) {
                <div class="event-node" 
                     [class.important]="ev.isImportant"
                     [class.above]="i % 2 === 0"
                     [class.below]="i % 2 !== 0"
                     [style.left.px]="eventPositions[ev.id]"
                     (click)="selectEvent(ev)">
                  <div class="event-dot"></div>
                  <div class="event-connector"></div>
                  <div class="event-card" [class.selected]="selectedEvent?.id === ev.id">
                    @if (getMainImage(ev); as img) {
                      <div class="event-image" (click)="openImageGallery(ev); $event.stopPropagation()" role="button" tabindex="0" (keydown.enter)="openImageGallery(ev)" (keydown.space)="openImageGallery(ev); $event.preventDefault()" [attr.aria-label]="'Bild vergrößern'">
                        <img [src]="imageSrc(img.url)" [alt]="ev.title" loading="lazy" />
                      </div>
                    }
                    <div class="event-info">
                      <span class="event-year">{{ formatYear(ev) }}</span>
                      <h3>{{ ev.title }}</h3>
                      @if (ev.description) {
                        <p class="event-desc">{{ ev.description }}</p>
                      }
                    </div>
                    @if (selectedEvent?.id === ev.id) {
                      <div class="event-actions">
                        <button type="button" class="action-btn" (click)="openEditModal(ev); $event.stopPropagation()" title="Bearbeiten">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button type="button" class="action-btn" [class.active]="ev.isImportant" (click)="toggleImportant(ev); $event.stopPropagation()">
                          <svg width="16" height="16" viewBox="0 0 24 24" [attr.fill]="ev.isImportant ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </button>
                        <button type="button" class="action-btn" (click)="openPhotosModal(ev); $event.stopPropagation()">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </button>
                        <button type="button" class="action-btn delete" (click)="deleteEvent(ev); $event.stopPropagation()">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }
              
              <!-- Floating Add Button -->
              <button type="button" class="add-event-btn" [style.left.px]="addButtonPosition" (click)="openModal()">
                <span>+</span>
              </button>
            </div>
          }
        </div>
        </div>

        <!-- Scroll hint -->
        @if (events.length > 0 && showScrollHint) {
          <div class="scroll-hint">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <span>Ziehen zum Scrollen</span>
          </div>
        }
      }
    </div>

    @if (timeline) {
      <app-modal [isOpen]="modalOpen" title="Ereignis hinzufügen" (closed)="closeModal()">
        <app-event-form
          [timelineId]="timeline.id"
          (created)="onEventCreatedAndClose()"
          (imagesUploading)="showImagesUploadingBanner()"
        />
      </app-modal>
      @if (editModalEvent) {
        <app-modal [isOpen]="true" title="Ereignis bearbeiten" (closed)="closeEditModal()">
          <app-event-form
            [timelineId]="timeline.id"
            [event]="editModalEvent"
            (updated)="onEventUpdatedAndClose()"
          />
        </app-modal>
      }
    }

    @if (photosModalEvent) {
      <app-modal [isOpen]="true" [title]="'Fotos: ' + photosModalEvent.title" (closed)="closePhotosModal()">
        <app-event-photos
          [event]="photosModalEvent"
          (updated)="onPhotosUpdated()"
        />
      </app-modal>
    }

    @if (galleryEvent && galleryEvent.images && galleryEvent.images.length) {
      <app-image-gallery-modal
        [isOpen]="true"
        [images]="galleryEvent.images"
        [initialIndex]="galleryIndex"
        [alt]="galleryEvent.title"
        (closed)="closeImageGallery()"
      />
    }
  `,
  styles: [`
    /* Apple-like Timeline Design – fills available space exactly */
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }
    .timeline-page {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      background: linear-gradient(180deg, var(--bg) 0%, #f0efed 100%);
    }

    /* Header – fixed height */
    .timeline-header {
      flex-shrink: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.72);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
    .header-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      max-width: 100%;
      padding: 0.625rem 1.25rem;
    }
    @media (max-width: 599px) {
      .header-content { padding: 0.5rem 1rem; }
    }
    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      color: var(--timeline-color);
      background: transparent;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .back-btn:hover {
      background: rgba(0, 0, 0, 0.05);
      text-decoration: none;
    }
    .header-info {
      flex: 1;
      min-width: 0;
    }
    .header-info h1 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .header-info p {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin: 0.125rem 0 0;
    }
    .header-action {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: transparent;
      color: var(--text-secondary);
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
      box-shadow: none;
    }
    .header-action:hover {
      background: rgba(185, 28, 28, 0.08);
      color: #b91c1c;
    }

    /* Loading & Error States */
    .loading-state, .error-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      color: var(--text-secondary);
    }
    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-light);
      border-top-color: var(--timeline-color);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .error-state { color: #b91c1c; }

    /* Timeline section: fixed year bar + scrollable track */
    .timeline-section {
      flex: 1;
      min-height: 0;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    /* Fixed year display – Glas, groß, clean, weich über dem Zahlenstrahl */
    .center-year-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 88px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 30;
      pointer-events: none;
      background: linear-gradient(180deg,
        rgba(255, 255, 255, 0.45) 0%,
        rgba(255, 255, 255, 0.25) 50%,
        rgba(255, 255, 255, 0.08) 85%,
        transparent 100%
      );
      backdrop-filter: blur(20px) saturate(1.2);
      -webkit-backdrop-filter: blur(20px) saturate(1.2);
    }
    .center-year-label {
      font-size: 2rem;
      font-weight: 600;
      letter-spacing: -0.04em;
      color: var(--timeline-color);
      padding: 0.5rem 1.5rem;
      background: rgba(255, 255, 255, 0.35);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow:
        0 4px 24px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(0, 0, 0, 0.03),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      transition: color 0.2s ease, box-shadow 0.2s ease;
    }
    @media (max-width: 599px) {
      .center-year-bar { height: 72px; }
      .center-year-label {
        font-size: 1.5rem;
        padding: 0.4rem 1.15rem;
        border-radius: 14px;
      }
    }

    /* Timeline Container – fills remaining space, horizontal scroll only */
    .timeline-container {
      flex: 1;
      min-height: 0;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow-x: auto;
      overflow-y: visible;
      cursor: grab;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .timeline-container::-webkit-scrollbar { display: none; }
    .timeline-container.dragging { cursor: grabbing; }
    .timeline-container.empty {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 1.5rem;
    }
    .add-first-btn {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 2px dashed var(--border);
      background: var(--bg-card);
      color: var(--timeline-color);
      font-size: 2.5rem;
      font-weight: 300;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .add-first-btn:hover {
      border-color: var(--timeline-color);
      background: var(--timeline-color);
      color: white;
      transform: scale(1.05);
      box-shadow: 0 8px 24px rgba(0, 113, 227, 0.25);
    }
    .add-first-btn .add-icon {
      line-height: 1;
      margin-top: -2px;
    }
    .empty-state p {
      color: var(--text-secondary);
      font-size: 0.9375rem;
      margin: 0;
    }

    /* Timeline Track – exact container height so axis stays vertically centered */
    .timeline-track {
      position: relative;
      flex: 1;
      min-height: 0;
      width: 100%;
      padding: 0 100px;
    }
    @media (max-width: 599px) {
      .timeline-track { padding: 0 60px; }
    }

    /* Axis Line – sichtbarer Zahlenstrahl in Timeline-Farbe */
    .axis-line {
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 3px;
      margin-top: -1.5px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        var(--timeline-color) 3%, 
        var(--timeline-color) 97%, 
        transparent 100%
      );
      opacity: 0.9;
      z-index: 1;
      border-radius: 2px;
    }

    /* Year Markers – Jahreszahlen auf dem Zahlenstrahl */
    .year-marker {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
      z-index: 2;
    }
    .year-label {
      position: absolute;
      bottom: 100%;
      margin-bottom: 6px;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--timeline-color);
      white-space: nowrap;
      letter-spacing: 0.02em;
    }
    .marker-tick {
      width: 2px;
      height: 10px;
      background: var(--timeline-color);
      border-radius: 1px;
      flex-shrink: 0;
    }

    /* Event Nodes */
    .event-node {
      position: absolute;
      top: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      z-index: 10;
    }
    .event-node.above {
      flex-direction: column-reverse;
    }
    .event-node.above .event-connector { margin-top: 0; margin-bottom: 0; }
    .event-node.above .event-card { 
      margin-bottom: 8px;
      transform-origin: bottom center;
    }
    .event-node.below .event-card { 
      margin-top: 8px; 
      transform-origin: top center;
    }

    .event-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--bg-card);
      border: 3px solid var(--timeline-color);
      transition: all 0.2s;
      z-index: 12;
      flex-shrink: 0;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
    }
    .event-node:hover .event-dot,
    .event-node .event-card.selected ~ .event-dot {
      background: var(--timeline-color);
      transform: scale(1.2);
    }
    .event-node.important .event-dot {
      border-color: var(--important);
    }
    .event-node.important:hover .event-dot {
      background: var(--important);
    }

    .event-connector {
      width: 2px;
      height: 24px;
      background: linear-gradient(180deg, var(--timeline-color), transparent);
      flex-shrink: 0;
    }
    .event-node.above .event-connector {
      background: linear-gradient(0deg, var(--timeline-color), transparent);
    }
    .event-node.important .event-connector {
      background: linear-gradient(180deg, var(--important), transparent);
    }
    .event-node.important.above .event-connector {
      background: linear-gradient(0deg, var(--important), transparent);
    }

    /* Event Card – kompakt */
    .event-card {
      width: 180px;
      background: var(--bg-card);
      border-radius: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }
    @media (max-width: 599px) {
      .event-card { width: 150px; }
    }
    .event-card:hover, .event-card.selected {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.06);
      transform: scale(1.02);
    }
    .event-card.selected {
      box-shadow: 0 8px 24px rgba(0, 113, 227, 0.2), 0 0 0 2px var(--timeline-color);
    }
    .event-node.important .event-card.selected {
      box-shadow: 0 8px 24px rgba(91, 95, 199, 0.2), 0 0 0 2px var(--important);
    }

    .event-image {
      width: 100%;
      height: 70px;
      overflow: hidden;
      border-radius: 14px 14px 0 0;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .event-image:hover { opacity: 0.92; }
    @media (max-width: 599px) {
      .event-image { height: 60px; }
    }
    .event-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .event-info {
      padding: 0.625rem 0.75rem;
    }
    .event-info h3 {
      font-size: 0.8125rem;
      font-weight: 600;
      margin: 0;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }
    .event-info p.event-desc {
      font-size: 0.6875rem;
      color: var(--text-secondary);
      margin: 0.25rem 0 0;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .event-year {
      display: inline-block;
      font-size: 0.625rem;
      font-weight: 600;
      color: var(--timeline-color);
      background: color-mix(in srgb, var(--timeline-color) 10%, transparent);
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      margin-bottom: 0.35rem;
    }
    .event-node.important .event-year {
      color: var(--important);
      background: color-mix(in srgb, var(--important) 10%, transparent);
    }

    /* Event Actions – kompakt */
    .event-actions {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-top: 1px solid var(--border-light);
    }
    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      border: none;
      border-radius: 6px;
      background: var(--border-light);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: none;
      padding: 0;
      min-height: auto;
    }
    .action-btn:hover {
      background: var(--border);
      color: var(--text);
    }
    .action-btn.active {
      background: color-mix(in srgb, var(--important) 15%, transparent);
      color: var(--important);
    }
    .action-btn.delete:hover {
      background: rgba(185, 28, 28, 0.1);
      color: #b91c1c;
    }

    /* Add Event Button */
    .add-event-btn {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px dashed var(--border);
      background: var(--bg-card);
      color: var(--text-muted);
      font-size: 1.5rem;
      font-weight: 300;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 5;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      padding: 0;
      min-height: auto;
    }
    .add-event-btn span {
      line-height: 1;
      margin-top: -1px;
    }
    .add-event-btn:hover {
      border-color: var(--timeline-color);
      background: var(--timeline-color);
      color: white;
      transform: translate(-50%, -50%) scale(1.1);
      box-shadow: 0 4px 16px rgba(0, 113, 227, 0.3);
    }

    /* Scroll Hint */
    .scroll-hint {
      position: fixed;
      bottom: calc(1.5rem + env(safe-area-inset-bottom));
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 999px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      color: var(--text-secondary);
      font-size: 0.8125rem;
      font-weight: 500;
      animation: fadeInUp 0.5s ease-out, fadeOut 0.5s ease-out 3s forwards;
      pointer-events: none;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
    @keyframes fadeOut {
      to { opacity: 0; }
    }
  `],
})
export class TimelineDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('timelineContainer') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('timelineTrack') trackRef!: ElementRef<HTMLDivElement>;

  timeline: Timeline | null = null;
  events: Event[] = [];
  loading = true;
  error: string | null = null;
  modalOpen = false;
  editModalEvent: Event | null = null;
  photosModalEvent: Event | null = null;
  galleryEvent: Event | null = null;
  galleryIndex = 0;
  imagesUploadingBanner = false;
  selectedEvent: Event | null = null;
  showScrollHint = true;
  /** Event dessen Jahr aktuell in der Viewport-Mitte steht (für fixe Jahres-Anzeige) */
  centerYearEvent: Event | null = null;

  // Drag scrolling state
  isDragging = false;
  private startX = 0;
  private scrollLeft = 0;
  private velocity = 0;
  private lastX = 0;
  private lastTime = 0;
  private momentumId: number | null = null;

  // Timeline calculation – einfache lineare Positionierung
  private readonly minEventGap = 260;     // Mindestabstand zwischen Events
  private readonly padding = 150;

  get sortedEvents(): Event[] {
    return [...this.events].sort((a, b) => {
      const y = Math.sign(a.year - b.year);
      if (y !== 0) return y;
      const ma = a.month ?? 0;
      const mb = b.month ?? 0;
      const m = Math.sign(ma - mb);
      if (m !== 0) return m;
      const da = a.day ?? 0;
      const db = b.day ?? 0;
      return Math.sign(da - db);
    });
  }

  /** Einfache lineare Positionierung: Events werden gleichmäßig verteilt */
  get eventPositions(): Record<number, number> {
    const out: Record<number, number> = {};
    if (this.events.length === 0) return out;
    
    const sorted = this.sortedEvents;
    // Einfache lineare Positionierung mit minEventGap
    for (let i = 0; i < sorted.length; i++) {
      out[sorted[i].id] = this.padding + i * this.minEventGap;
    }
    return out;
  }

  get trackWidth(): number {
    if (this.events.length === 0) return 0;
    return this.padding + this.events.length * this.minEventGap + this.padding;
  }

  /** Nur Jahre mit Events anzeigen (keine Zwischenjahre) */
  get yearMarkers(): number[] {
    if (this.events.length === 0) return [];
    // Eindeutige Jahre extrahieren
    const yearsSet = new Set(this.events.map(e => e.year));
    return Array.from(yearsSet).sort((a, b) => a - b);
  }

  get addButtonPosition(): number {
    if (this.events.length === 0) return this.padding;
    const positions = this.eventPositions;
    const maxX = Object.values(positions).length ? Math.max(...Object.values(positions)) : this.padding;
    return maxX + 160;
  }

  get centerYearLabel(): string {
    return this.centerYearEvent ? this.formatYear(this.centerYearEvent) : '';
  }

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
    // Hide scroll hint after 4 seconds
    setTimeout(() => this.showScrollHint = false, 4000);
  }

  ngAfterViewInit(): void {
    // Center the timeline initially after a brief delay
    setTimeout(() => this.centerTimeline(), 100);
  }

  ngOnDestroy(): void {
    if (this.momentumId) {
      cancelAnimationFrame(this.momentumId);
    }
  }

  load(slug: string): void {
    this.loading = true;
    this.error = null;
    this.api.getTimelineBySlug(slug).subscribe({
      next: (t) => {
        this.timeline = t;
        this.events = t.events || [];
        this.loading = false;
        setTimeout(() => this.centerTimeline(), 100);
      },
      error: (err) => {
        this.error = err?.error?.error || 'Zeitstrahl konnte nicht geladen werden.';
        this.loading = false;
      },
    });
  }

  private centerTimeline(): void {
    if (!this.containerRef?.nativeElement) return;
    const container = this.containerRef.nativeElement;
    const centerPos = this.events.length > 0
      ? (this.trackWidth - this.padding - 100) / 2
      : 0;
    container.scrollLeft = Math.max(0, centerPos - container.clientWidth / 2);
    this.updateCenterYearEvent();
  }

  onTimelineScroll(): void {
    this.updateCenterYearEvent();
  }

  private updateCenterYearEvent(): void {
    if (!this.containerRef?.nativeElement || this.events.length === 0) return;
    const container = this.containerRef.nativeElement;
    if (container.clientWidth <= 0) return;
    const centerX = container.scrollLeft + container.clientWidth / 2;
    const positions = this.eventPositions;
    let closest: Event | null = null;
    let best = Infinity;
    for (const ev of this.sortedEvents) {
      const x = positions[ev.id];
      if (x == null) continue;
      const d = Math.abs(x - centerX);
      if (d < best) {
        best = d;
        closest = ev;
      }
    }
    this.centerYearEvent = closest;
  }

  // Drag scrolling methods
  onDragStart(e: MouseEvent): void {
    if (this.events.length === 0) return;
    this.isDragging = true;
    this.startX = e.pageX - this.containerRef.nativeElement.offsetLeft;
    this.scrollLeft = this.containerRef.nativeElement.scrollLeft;
    this.lastX = e.pageX;
    this.lastTime = Date.now();
    this.velocity = 0;
    if (this.momentumId) {
      cancelAnimationFrame(this.momentumId);
      this.momentumId = null;
    }
  }

  onTouchStart(e: TouchEvent): void {
    if (this.events.length === 0) return;
    this.isDragging = true;
    const touch = e.touches[0];
    this.startX = touch.pageX - this.containerRef.nativeElement.offsetLeft;
    this.scrollLeft = this.containerRef.nativeElement.scrollLeft;
    this.lastX = touch.pageX;
    this.lastTime = Date.now();
    this.velocity = 0;
    if (this.momentumId) {
      cancelAnimationFrame(this.momentumId);
      this.momentumId = null;
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onDragMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    e.preventDefault();
    const x = e.pageX - this.containerRef.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.2;
    this.containerRef.nativeElement.scrollLeft = this.scrollLeft - walk;

    // Track velocity for momentum
    const now = Date.now();
    const dt = now - this.lastTime;
    if (dt > 0) {
      this.velocity = (e.pageX - this.lastX) / dt;
    }
    this.lastX = e.pageX;
    this.lastTime = now;
    this.updateCenterYearEvent();
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(e: TouchEvent): void {
    if (!this.isDragging) return;
    const touch = e.touches[0];
    const x = touch.pageX - this.containerRef.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.2;
    this.containerRef.nativeElement.scrollLeft = this.scrollLeft - walk;

    const now = Date.now();
    const dt = now - this.lastTime;
    if (dt > 0) {
      this.velocity = (touch.pageX - this.lastX) / dt;
    }
    this.lastX = touch.pageX;
    this.lastTime = now;
    this.updateCenterYearEvent();
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  onDragEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.applyMomentum();
  }

  private applyMomentum(): void {
    if (Math.abs(this.velocity) < 0.1) return;

    const friction = 0.95;
    const animate = () => {
      this.velocity *= friction;
      this.containerRef.nativeElement.scrollLeft -= this.velocity * 16;

      if (Math.abs(this.velocity) > 0.1) {
        this.momentumId = requestAnimationFrame(animate);
      }
    };
    this.momentumId = requestAnimationFrame(animate);
  }

  getYearPosition(year: number): number {
    if (this.events.length === 0) return this.padding;
    
    // Finde alle Events dieses Jahres
    const eventsOfYear = this.sortedEvents.filter(e => e.year === year);
    if (eventsOfYear.length === 0) return this.padding;
    
    // Berechne die mittlere Position der Events dieses Jahres
    const positions = this.eventPositions;
    const yearPositions = eventsOfYear.map(e => positions[e.id]).filter(p => p !== undefined);
    if (yearPositions.length === 0) return this.padding;
    
    // Mittelwert der Positionen
    const sum = yearPositions.reduce((a, b) => a + b, 0);
    return sum / yearPositions.length;
  }

  formatYearLabel(year: number): string {
    return year < 0 ? `${Math.abs(year)} v.Chr.` : `${year}`;
  }

  selectEvent(ev: Event): void {
    this.selectedEvent = this.selectedEvent?.id === ev.id ? null : ev;
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

  openEditModal(ev: Event): void {
    this.editModalEvent = ev;
  }

  closeEditModal(): void {
    this.editModalEvent = null;
  }

  onEventCreated(): void {
    if (this.timeline) this.load(this.timeline.slug);
  }

  onEventCreatedAndClose(): void {
    this.closeModal();
    this.onEventCreated();
  }

  onEventUpdatedAndClose(): void {
    this.closeEditModal();
    this.onEventCreated();
  }

  showImagesUploadingBanner(): void {
    this.imagesUploadingBanner = true;
    setTimeout(() => (this.imagesUploadingBanner = false), 8000);
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

  openImageGallery(ev: Event): void {
    const imgs = ev.images ?? [];
    if (imgs.length === 0) return;
    const idx = imgs.findIndex((i) => i.isMain);
    this.galleryIndex = idx >= 0 ? idx : 0;
    this.galleryEvent = ev;
  }

  closeImageGallery(): void {
    this.galleryEvent = null;
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
