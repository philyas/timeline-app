import { getKnex } from '../config/knex';
import { Timeline } from '../types/timeline';
import { rowToTimeline, rowToEvent } from '../types/timeline';

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
  async findAll(): Promise<Timeline[]> {
    const rows = await getKnex()('timelines')
      .orderBy(['sort_order', 'name']);
    return rows.map(rowToTimeline);
  }

  async findById(id: number): Promise<Timeline | null> {
    const row = await getKnex()('timelines').where({ id }).first();
    if (!row) return null;
    const timeline = rowToTimeline(row);
    const events = await getKnex()('events')
      .where({ timeline_id: id })
      .orderBy('year', 'asc');
    timeline.events = events.map((e: Record<string, unknown>) => rowToEvent(e));
    return timeline;
  }

  async findBySlug(slug: string): Promise<Timeline | null> {
    const row = await getKnex()('timelines').where({ slug }).first();
    if (!row) return null;
    return this.findById(row.id as number);
  }

  async create(dto: CreateTimelineDto): Promise<Timeline> {
    const slug = dto.slug ?? this.slugify(dto.name);
    const existing = await getKnex()('timelines').where({ slug }).first();
    if (existing) {
      throw new Error(`Timeline with slug "${slug}" already exists.`);
    }
    const [row] = await getKnex()('timelines')
      .insert({
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

  async update(id: number, dto: UpdateTimelineDto): Promise<Timeline> {
    const existing = await getKnex()('timelines').where({ id }).first();
    if (!existing) throw new Error('Timeline not found.');
    if (dto.slug != null) {
      const other = await getKnex()('timelines').where({ slug: dto.slug }).whereNot('id', id).first();
      if (other) throw new Error(`Slug "${dto.slug}" already in use.`);
    }
    const updatePayload: Record<string, unknown> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.slug !== undefined) updatePayload.slug = dto.slug;
    if (dto.description !== undefined) updatePayload.description = dto.description;
    if (dto.type !== undefined) updatePayload.type = dto.type;
    if (dto.color !== undefined) updatePayload.color = dto.color;
    if (dto.sortOrder !== undefined) updatePayload.sort_order = dto.sortOrder;
    const [row] = await getKnex()('timelines').where({ id }).update(updatePayload).returning('*');
    return rowToTimeline(row);
  }

  async delete(id: number): Promise<void> {
    const existing = await getKnex()('timelines').where({ id }).first();
    if (!existing) throw new Error('Timeline not found.');
    await getKnex()('timelines').where({ id }).del();
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
