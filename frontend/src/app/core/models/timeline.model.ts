export type TimelineType = 'nation' | 'continent' | 'custom';

export interface Timeline {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  type: TimelineType;
  color: string | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  events?: Event[];
}

export interface EventImage {
  id: number;
  eventId: number;
  filename: string;
  isMain: boolean;
  sortOrder: number;
  url: string;
  createdAt?: string;
}

export interface Event {
  id: number;
  timelineId: number;
  title: string;
  description: string | null;
  year: number;
  month: number | null;
  day: number | null;
  isImportant: boolean;
  images?: EventImage[];
  createdAt?: string;
  updatedAt?: string;
  timeline?: Timeline;
}

export interface CreateTimelineDto {
  name: string;
  slug?: string;
  description?: string;
  type?: TimelineType;
  color?: string;
  sortOrder?: number;
}

export interface CreateEventDto {
  timelineId: number;
  title: string;
  description?: string;
  year: number;
  month?: number;
  day?: number;
  isImportant?: boolean;
}
