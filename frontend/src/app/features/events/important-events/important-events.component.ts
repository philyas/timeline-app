import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Event, EventImage } from '../../../core/models/timeline.model';
import { ModalComponent } from '../../../shared/modal/modal.component';

@Component({
  selector: 'app-important-events',
  standalone: true,
  imports: [CommonModule, SlicePipe, RouterLink, ModalComponent],
  template: `
    <div class="important-page">
      <!-- Header -->
      <header class="important-header">
        <div class="header-content">
          <a routerLink="/timelines" class="back-btn" aria-label="Zurück">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </a>
          <div class="header-info">
            <h1>Wichtige Ereignisse</h1>
            <p>Alle als wichtig markierten Ereignisse</p>
          </div>
          <div class="header-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>{{ events.length }}</span>
          </div>
        </div>
      </header>

      @if (loading) {
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Lade Ereignisse…</p>
        </div>
      } @else if (error) {
        <div class="error-state">
          <p>{{ error }}</p>
        </div>
      } @else if (events.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h2>Keine wichtigen Ereignisse</h2>
          <p>Markiere in einem Zeitstrahl Ereignisse als „wichtig", um sie hier zu sehen.</p>
          <a routerLink="/timelines" class="empty-cta">Zu den Zeitstrahlen</a>
        </div>
      } @else {
        <!-- Horizontal Timeline -->
        <div class="timeline-container"
             #timelineContainer
             (mousedown)="onDragStart($event)"
             (touchstart)="onTouchStart($event)"
             [class.dragging]="isDragging">
          
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
                   [class.above]="i % 2 === 0"
                   [class.below]="i % 2 !== 0"
                   [style.left.px]="getEventPosition(ev)"
                   (click)="selectEvent(ev)">
                <div class="event-dot"></div>
                <div class="event-connector"></div>
                <div class="event-card" [class.selected]="selectedEvent?.id === ev.id">
                  @if (getMainImage(ev); as img) {
                    <div class="event-image" (click)="openPhotosModal(ev); $event.stopPropagation()">
                      <img [src]="imageSrc(img.url)" [alt]="ev.title" loading="lazy" />
                      @if (ev.images && ev.images.length > 1) {
                        <span class="image-count">+{{ ev.images.length - 1 }}</span>
                      }
                    </div>
                  }
                  <div class="event-info">
                    <span class="event-year">{{ formatYear(ev) }}</span>
                    <h3>{{ ev.title }}</h3>
                    @if (ev.timeline) {
                      <a [routerLink]="['/timelines', ev.timeline.slug]" class="timeline-link" (click)="$event.stopPropagation()">
                        {{ ev.timeline.name }}
                      </a>
                    }
                    @if (ev.description) {
                      <p>{{ ev.description | slice:0:60 }}{{ ev.description.length > 60 ? '…' : '' }}</p>
                    }
                  </div>
                  @if (selectedEvent?.id === ev.id && ev.images && ev.images.length > 0) {
                    <div class="event-actions">
                      <button type="button" class="action-btn photos" (click)="openPhotosModal(ev); $event.stopPropagation()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>{{ ev.images.length }} Fotos</span>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Scroll hint -->
        @if (showScrollHint) {
          <div class="scroll-hint">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <span>Ziehen zum Scrollen</span>
          </div>
        }
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
    /* Apple-like Important Events Design */
    .important-page {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 100vh;
      background: linear-gradient(180deg, var(--bg) 0%, #efeef5 100%);
    }

    /* Header */
    .important-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.72);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(91, 95, 199, 0.1);
    }
    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 100%;
      padding: 0.875rem 1.25rem;
    }
    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      color: var(--important);
      background: transparent;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .back-btn:hover {
      background: rgba(91, 95, 199, 0.08);
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
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .header-info p {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin: 0.125rem 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .header-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      background: var(--important-soft);
      color: var(--important);
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 600;
      flex-shrink: 0;
    }
    .header-badge svg {
      width: 14px;
      height: 14px;
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
      border-top-color: var(--important);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .error-state { color: #b91c1c; }

    /* Empty State */
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
      text-align: center;
    }
    .empty-icon {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--important-soft);
      border-radius: 50%;
      color: var(--important);
    }
    .empty-state h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: var(--text);
    }
    .empty-state p {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      margin: 0;
      max-width: 280px;
      line-height: 1.5;
    }
    .empty-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      background: var(--important);
      color: white;
      border-radius: 12px;
      font-weight: 500;
      font-size: 0.9375rem;
      margin-top: 0.5rem;
      transition: all 0.2s;
    }
    .empty-cta:hover {
      background: var(--important-hover);
      text-decoration: none;
      transform: scale(1.02);
    }

    /* Timeline Container */
    .timeline-container {
      flex: 1;
      position: relative;
      overflow-x: auto;
      overflow-y: hidden;
      cursor: grab;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .timeline-container::-webkit-scrollbar { display: none; }
    .timeline-container.dragging { cursor: grabbing; }

    /* Timeline Track */
    .timeline-track {
      position: relative;
      height: 100%;
      min-height: 500px;
      padding: 0 100px;
    }
    @media (max-width: 599px) {
      .timeline-track { padding: 0 60px; min-height: 420px; }
    }

    /* Axis Line */
    .axis-line {
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 2px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        color-mix(in srgb, var(--important) 30%, var(--border)) 5%, 
        color-mix(in srgb, var(--important) 30%, var(--border)) 95%, 
        transparent 100%
      );
      transform: translateY(-50%);
    }

    /* Year Markers */
    .year-marker {
      position: absolute;
      top: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
    }
    .year-label {
      position: absolute;
      top: 12px;
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--text-muted);
      white-space: nowrap;
      letter-spacing: 0.02em;
    }
    .marker-tick {
      width: 1px;
      height: 8px;
      background: var(--border);
      margin-top: -4px;
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
      border: 3px solid var(--important);
      transition: all 0.2s;
      z-index: 2;
      flex-shrink: 0;
    }
    .event-node:hover .event-dot,
    .event-node .event-card.selected ~ .event-dot {
      background: var(--important);
      transform: scale(1.2);
    }

    .event-connector {
      width: 2px;
      height: 40px;
      background: linear-gradient(180deg, var(--important), transparent);
    }
    .event-node.above .event-connector {
      background: linear-gradient(0deg, var(--important), transparent);
    }

    /* Event Card */
    .event-card {
      width: 200px;
      background: var(--bg-card);
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(91, 95, 199, 0.08), 0 0 0 1px rgba(91, 95, 199, 0.06);
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @media (max-width: 599px) {
      .event-card { width: 160px; }
    }
    .event-card:hover, .event-card.selected {
      box-shadow: 0 8px 24px rgba(91, 95, 199, 0.15), 0 0 0 1px rgba(91, 95, 199, 0.1);
      transform: scale(1.02);
    }
    .event-card.selected {
      box-shadow: 0 8px 24px rgba(91, 95, 199, 0.2), 0 0 0 2px var(--important);
    }

    .event-image {
      position: relative;
      width: 100%;
      height: 100px;
      overflow: hidden;
      cursor: pointer;
    }
    @media (max-width: 599px) {
      .event-image { height: 80px; }
    }
    .event-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
    .event-image:hover img {
      transform: scale(1.05);
    }
    .image-count {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      padding: 0.2rem 0.5rem;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 0.6875rem;
      font-weight: 600;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    }

    .event-info {
      padding: 0.875rem;
    }
    .event-year {
      display: inline-block;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--important);
      background: var(--important-soft);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    .event-info h3 {
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0;
      line-height: 1.3;
      letter-spacing: -0.01em;
    }
    .timeline-link {
      display: inline-block;
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-top: 0.25rem;
      padding: 0.15rem 0;
      transition: color 0.2s;
    }
    .timeline-link:hover {
      color: var(--important);
      text-decoration: none;
    }
    .event-info p {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 0.375rem 0 0;
      line-height: 1.4;
    }

    /* Event Actions */
    .event-actions {
      padding: 0 0.75rem 0.75rem;
      border-top: 1px solid var(--border-light);
      padding-top: 0.625rem;
      margin-top: 0.5rem;
    }
    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      width: 100%;
      height: 32px;
      border: none;
      border-radius: 8px;
      background: var(--important-soft);
      color: var(--important);
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: none;
      padding: 0;
      min-height: auto;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .action-btn:hover {
      background: color-mix(in srgb, var(--important) 20%, transparent);
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
      box-shadow: 0 2px 12px rgba(91, 95, 199, 0.15);
      color: var(--important);
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

    /* Photos Gallery Modal */
    .photos-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-sm);
    }
    .photos-gallery-item {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
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
      bottom: 0.5rem;
      left: 0.5rem;
      font-size: 0.6875rem;
      font-weight: 600;
      color: #fff;
      background: var(--important);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    @media (max-width: 599px) {
      .photos-gallery { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
    }
  `],
})
export class ImportantEventsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('timelineContainer') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('timelineTrack') trackRef!: ElementRef<HTMLDivElement>;

  events: Event[] = [];
  loading = true;
  error: string | null = null;
  photosModalEvent: Event | null = null;
  selectedEvent: Event | null = null;
  showScrollHint = true;

  // Drag scrolling state
  isDragging = false;
  private startX = 0;
  private scrollLeft = 0;
  private velocity = 0;
  private lastX = 0;
  private lastTime = 0;
  private momentumId: number | null = null;

  // Timeline calculation
  private readonly eventSpacing = 280;
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

  get trackWidth(): number {
    if (this.events.length === 0) return 0;
    return this.padding * 2 + (this.events.length) * this.eventSpacing;
  }

  get yearMarkers(): number[] {
    if (this.events.length === 0) return [];
    const sorted = this.sortedEvents;
    const years = sorted.map(e => e.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    
    const range = maxYear - minYear;
    let step = 1;
    if (range > 100) step = 50;
    else if (range > 50) step = 25;
    else if (range > 20) step = 10;
    else if (range > 10) step = 5;
    
    const markers: number[] = [];
    const start = Math.floor(minYear / step) * step;
    for (let y = start; y <= maxYear + step; y += step) {
      markers.push(y);
    }
    return markers;
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    setTimeout(() => this.showScrollHint = false, 4000);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.centerTimeline(), 100);
  }

  ngOnDestroy(): void {
    if (this.momentumId) {
      cancelAnimationFrame(this.momentumId);
    }
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.getImportantEvents(50).subscribe({
      next: (list) => {
        this.events = list;
        this.loading = false;
        setTimeout(() => this.centerTimeline(), 100);
      },
      error: (err) => {
        this.error = err?.error?.error || 'Ereignisse konnten nicht geladen werden.';
        this.loading = false;
      },
    });
  }

  private centerTimeline(): void {
    if (!this.containerRef?.nativeElement) return;
    const container = this.containerRef.nativeElement;
    const centerPos = this.events.length > 0 
      ? this.padding + (this.events.length - 1) * this.eventSpacing / 2
      : 0;
    container.scrollLeft = Math.max(0, centerPos - container.clientWidth / 2);
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

    const now = Date.now();
    const dt = now - this.lastTime;
    if (dt > 0) {
      this.velocity = (e.pageX - this.lastX) / dt;
    }
    this.lastX = e.pageX;
    this.lastTime = now;
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

  // Event positioning
  getEventPosition(ev: Event): number {
    const sorted = this.sortedEvents;
    const index = sorted.findIndex(e => e.id === ev.id);
    return this.padding + index * this.eventSpacing;
  }

  getYearPosition(year: number): number {
    if (this.events.length === 0) return this.padding;
    const sorted = this.sortedEvents;
    const years = sorted.map(e => e.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    
    if (minYear === maxYear) return this.padding;
    
    const totalWidth = (this.events.length - 1) * this.eventSpacing;
    const ratio = (year - minYear) / (maxYear - minYear);
    return this.padding + ratio * totalWidth;
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
