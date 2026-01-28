import { getKnex } from '../config/knex';
import { Event } from '../types/timeline';
import { rowToEvent } from '../types/timeline';

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
    return rows.map(rowToEvent);
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
    return rowToEvent(row);
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
    return rows.map(rowToEvent);
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
    return rowToEvent(row);
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
    return rowToEvent(row);
  }

  async delete(id: number): Promise<void> {
    const existing = await getKnex()('events').where({ id }).first();
    if (!existing) throw new Error('Event not found.');
    await getKnex()('events').where({ id }).del();
  }
}
