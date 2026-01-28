import { getKnex } from '../config/knex';
import { Timeline, Event, EventImage } from '../types/timeline';
import { rowToTimeline, rowToEvent } from '../types/timeline';
import { EventImageService, getImageUrl } from './EventImageService';

const imageService = new EventImageService();

export interface CreateTimelineDto {
  name: string;
  slug?: string;
  description?: string;
  type?: 'nation' | 'continent' | 'custom';
  color?: string;
  sortOrder?: number;
}

export interface UpdateTimelineDto {
  name?: string;
  slug?: string;
  description?: string;
  type?: 'nation' | 'continent' | 'custom';
  color?: string;
  sortOrder?: number;
}

export class TimelineService {
  async findAll(userId: number): Promise<Timeline[]> {
    const rows = await getKnex()('timelines')
      .where({ user_id: userId })
      .orderBy(['sort_order', 'name']);
    return rows.map(rowToTimeline);
  }

  async findById(id: number, userId: number): Promise<Timeline | null> {
    const row = await getKnex()('timelines').where({ id, user_id: userId }).first();
    if (!row) return null;
    const timeline = rowToTimeline(row);
    const eventRows = await getKnex()('events')
      .where({ timeline_id: id })
      .orderBy('year', 'asc')
      .orderByRaw('COALESCE(month, 0) ASC')
      .orderByRaw('COALESCE(day, 0) ASC');
    const events = eventRows.map((e: Record<string, unknown>) => rowToEvent(e)) as Event[];
    const ids = events.map((e) => e.id);
    const map = await imageService.findByEventIds(ids);
    for (const e of events) {
      const list = map.get(e.id) ?? [];
      e.images = list.map((r) => ({
        id: r.id,
        eventId: r.eventId,
        filename: r.filename,
        isMain: r.isMain,
        sortOrder: r.sortOrder,
        url: getImageUrl(r.filename, r.eventId),
        createdAt: r.createdAt,
      } as EventImage));
    }
    timeline.events = events;
    return timeline;
  }

  async findBySlug(slug: string, userId: number): Promise<Timeline | null> {
    const row = await getKnex()('timelines').where({ slug, user_id: userId }).first();
    if (!row) return null;
    return this.findById(row.id as number, userId);
  }

  async create(dto: CreateTimelineDto, userId: number): Promise<Timeline> {
    const slug = dto.slug ?? this.slugify(dto.name);
    const existing = await getKnex()('timelines').where({ slug, user_id: userId }).first();
    if (existing) {
      throw new Error(`Timeline mit Slug „${slug}" existiert bereits.`);
    }
    const [row] = await getKnex()('timelines')
      .insert({
        user_id: userId,
        name: dto.name,
        slug,
        description: dto.description ?? null,
        type: dto.type ?? 'custom',
        color: dto.color ?? null,
        sort_order: dto.sortOrder ?? 0,
      })
      .returning('*');
    return rowToTimeline(row);
  }

  async update(id: number, dto: UpdateTimelineDto, userId: number): Promise<Timeline> {
    const existing = await getKnex()('timelines').where({ id, user_id: userId }).first();
    if (!existing) throw new Error('Timeline not found.');
    if (dto.slug != null) {
      const other = await getKnex()('timelines').where({ slug: dto.slug, user_id: userId }).whereNot('id', id).first();
      if (other) throw new Error(`Slug „${dto.slug}" wird bereits verwendet.`);
    }
    const updatePayload: Record<string, unknown> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.slug !== undefined) updatePayload.slug = dto.slug;
    if (dto.description !== undefined) updatePayload.description = dto.description;
    if (dto.type !== undefined) updatePayload.type = dto.type;
    if (dto.color !== undefined) updatePayload.color = dto.color;
    if (dto.sortOrder !== undefined) updatePayload.sort_order = dto.sortOrder;
    const [row] = await getKnex()('timelines').where({ id, user_id: userId }).update(updatePayload).returning('*');
    return rowToTimeline(row);
  }

  async delete(id: number, userId: number): Promise<void> {
    const existing = await getKnex()('timelines').where({ id, user_id: userId }).first();
    if (!existing) throw new Error('Timeline not found.');
    await getKnex()('timelines').where({ id, user_id: userId }).del();
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
