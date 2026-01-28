import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Timeline, Event, EventImage, CreateTimelineDto, CreateEventDto } from '../models/timeline.model';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Timelines
  getTimelines(): Observable<Timeline[]> {
    return this.http.get<Timeline[]>(`${API}/timelines`);
  }

  getTimelineBySlug(slug: string): Observable<Timeline> {
    return this.http.get<Timeline>(`${API}/timelines/slug/${slug}`);
  }

  getTimelineById(id: number): Observable<Timeline> {
    return this.http.get<Timeline>(`${API}/timelines/${id}`);
  }

  createTimeline(dto: CreateTimelineDto): Observable<Timeline> {
    return this.http.post<Timeline>(`${API}/timelines`, dto);
  }

  updateTimeline(id: number, dto: Partial<CreateTimelineDto>): Observable<Timeline> {
    return this.http.put<Timeline>(`${API}/timelines/${id}`, dto);
  }

  deleteTimeline(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/timelines/${id}`);
  }

  // Events
  getEventsByTimeline(timelineId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${API}/events/timeline/${timelineId}`);
  }

  getImportantEvents(limit = 20): Observable<Event[]> {
    return this.http.get<Event[]>(`${API}/events/important`, { params: { limit: String(limit) } });
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${API}/events/${id}`);
  }

  createEvent(dto: CreateEventDto): Observable<Event> {
    return this.http.post<Event>(`${API}/events`, dto);
  }

  updateEvent(id: number, dto: Partial<CreateEventDto>): Observable<Event> {
    return this.http.put<Event>(`${API}/events/${id}`, dto);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/events/${id}`);
  }

  uploadEventImages(eventId: number, files: File[]): Observable<EventImage[]> {
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    return this.http.post<EventImage[]>(`${API}/events/${eventId}/images`, fd);
  }

  deleteEventImage(eventId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${API}/events/${eventId}/images/${imageId}`);
  }

  setEventMainImage(eventId: number, imageId: number): Observable<void> {
    return this.http.patch<void>(`${API}/events/${eventId}/images/${imageId}/main`, {});
  }
}
