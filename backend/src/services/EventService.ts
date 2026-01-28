import { getKnex } from '../config/knex';
import { Event, EventImage } from '../types/timeline';
import { rowToEvent } from '../types/timeline';
import { EventImageService, getImageUrl } from './EventImageService';

export interface CreateEventDto {
  timelineId: number;
  title: string;
  description?: string;
  year: number;
  month?: number;
  day?: number;
  isImportant?: boolean;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  year?: number;
  month?: number;
  day?: number;
  isImportant?: boolean;
}

const imageService = new EventImageService();

function toEventImage(r: { id: number; eventId: number; filename: string; isMain: boolean; sortOrder: number; createdAt?: Date }): EventImage {
  return {
    id: r.id,
    eventId: r.eventId,
    filename: r.filename,
    isMain: r.isMain,
    sortOrder: r.sortOrder,
    url: getImageUrl(r.filename, r.eventId),
    createdAt: r.createdAt,
  };
}

async function attachImages(events: Event[]): Promise<void> {
  const ids = events.map((e) => e.id);
  const map = await imageService.findByEventIds(ids);
  for (const e of events) {
    const list = map.get(e.id) ?? [];
    e.images = list.map(toEventImage);
  }
}

export class EventService {
  async findByTimelineId(timelineId: number): Promise<Event[]> {
    const knex = getKnex();
    const rows = await knex('events')
      .leftJoin('timelines', 'events.timeline_id', 'timelines.id')
      .where('events.timeline_id', timelineId)
      .orderBy('events.year', 'asc')
      .orderByRaw('COALESCE(events.month, 0) ASC')
      .orderByRaw('COALESCE(events.day, 0) ASC')
      .select(
        'events.*',
        'timelines.name as timeline_name',
        'timelines.slug as timeline_slug'
      );
    const events = rows.map(rowToEvent);
    await attachImages(events);
    return events;
  }

  async findById(id: number): Promise<Event | null> {
    const row = await getKnex()('events')
      .leftJoin('timelines', 'events.timeline_id', 'timelines.id')
      .where('events.id', id)
      .select(
        'events.*',
        'timelines.name as timeline_name',
        'timelines.slug as timeline_slug'
      )
      .first();
    if (!row) return null;
    const event = rowToEvent(row);
    await attachImages([event]);
    return event;
  }

  async findImportant(limit: number = 20): Promise<Event[]> {
    const knex = getKnex();
    const rows = await knex('events')
      .leftJoin('timelines', 'events.timeline_id', 'timelines.id')
      .where('events.is_important', true)
      .orderBy('events.year', 'asc')
      .orderByRaw('COALESCE(events.month, 0) ASC')
      .orderByRaw('COALESCE(events.day, 0) ASC')
      .limit(limit)
      .select(
        'events.*',
        'timelines.name as timeline_name',
        'timelines.slug as timeline_slug'
      );
    const events = rows.map(rowToEvent);
    await attachImages(events);
    return events;
  }

  async create(dto: CreateEventDto): Promise<Event> {
    const timeline = await getKnex()('timelines').where({ id: dto.timelineId }).first();
    if (!timeline) throw new Error('Timeline not found.');
    const [row] = await getKnex()('events')
      .insert({
        timeline_id: dto.timelineId,
        title: dto.title,
        description: dto.description ?? null,
        year: dto.year,
        month: dto.month ?? null,
        day: dto.day ?? null,
        is_important: dto.isImportant ?? false,
      })
      .returning('*');
    const event = rowToEvent(row);
    await attachImages([event]);
    return event;
  }

  async update(id: number, dto: UpdateEventDto): Promise<Event> {
    const existing = await getKnex()('events').where({ id }).first();
    if (!existing) throw new Error('Event not found.');
    const updatePayload: Record<string, unknown> = {};
    if (dto.title !== undefined) updatePayload.title = dto.title;
    if (dto.description !== undefined) updatePayload.description = dto.description;
    if (dto.year !== undefined) updatePayload.year = dto.year;
    if (dto.month !== undefined) updatePayload.month = dto.month;
    if (dto.day !== undefined) updatePayload.day = dto.day;
    if (dto.isImportant !== undefined) updatePayload.is_important = dto.isImportant;
    const [row] = await getKnex()('events').where({ id }).update(updatePayload).returning('*');
    const event = rowToEvent(row);
    await attachImages([event]);
    return event;
  }

  async delete(id: number): Promise<void> {
    const existing = await getKnex()('events').where({ id }).first();
    if (!existing) throw new Error('Event not found.');
    await imageService.deleteAllForEvent(id);
    await getKnex()('events').where({ id }).del();
  }
}
