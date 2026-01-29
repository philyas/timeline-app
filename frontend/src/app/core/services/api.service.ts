import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Timeline, Event, EventImage, CreateTimelineDto, CreateEventDto } from '../models/timeline.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Timelines
  getTimelines(): Observable<Timeline[]> {
    return this.http.get<Timeline[]>(`${environment.apiUrl}/timelines`);
  }

  getTimelineBySlug(slug: string): Observable<Timeline> {
    return this.http.get<Timeline>(`${environment.apiUrl}/timelines/slug/${slug}`);
  }

  getTimelineById(id: number): Observable<Timeline> {
    return this.http.get<Timeline>(`${environment.apiUrl}/timelines/${id}`);
  }

  createTimeline(dto: CreateTimelineDto): Observable<Timeline> {
    return this.http.post<Timeline>(`${environment.apiUrl}/timelines`, dto);
  }

  updateTimeline(id: number, dto: Partial<CreateTimelineDto>): Observable<Timeline> {
    return this.http.put<Timeline>(`${environment.apiUrl}/timelines/${id}`, dto);
  }

  deleteTimeline(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/timelines/${id}`);
  }

  // Events
  getEventsByTimeline(timelineId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${environment.apiUrl}/events/timeline/${timelineId}`);
  }

  getImportantEvents(limit = 20): Observable<Event[]> {
    return this.http.get<Event[]>(`${environment.apiUrl}/events/important`, { params: { limit: String(limit) } });
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${environment.apiUrl}/events/${id}`);
  }

  createEvent(dto: CreateEventDto): Observable<Event> {
    return this.http.post<Event>(`${environment.apiUrl}/events`, dto);
  }

  updateEvent(id: number, dto: Partial<CreateEventDto>): Observable<Event> {
    return this.http.put<Event>(`${environment.apiUrl}/events/${id}`, dto);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${id}`);
  }

  uploadEventImages(eventId: number, files: File[]): Observable<EventImage[]> {
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    return this.http.post<EventImage[]>(`${environment.apiUrl}/events/${eventId}/images`, fd);
  }

  deleteEventImage(eventId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${eventId}/images/${imageId}`);
  }

  setEventMainImage(eventId: number, imageId: number): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/events/${eventId}/images/${imageId}/main`, {});
  }

  /** Bild-URL absolut machen, damit Bilder in Prod (anderer Origin) laden. */
  getImageUrl(url: string): string {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = environment.apiUrl.replace(/\/api\/?$/, '');
    return base + (url.startsWith('/') ? url : '/' + url);
  }
}
