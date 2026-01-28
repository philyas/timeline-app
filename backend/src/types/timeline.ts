export type TimelineType = 'nation' | 'continent' | 'custom';

export interface Timeline {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  type: TimelineType;
  color: string | null;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
  events?: Event[];
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
  createdAt?: Date;
  updatedAt?: Date;
  timeline?: { id: number; name: string; slug: string };
}

/** Knex liefert snake_case; hier auf camelCase mappen */
export function rowToTimeline(row: Record<string, unknown>): Timeline {
  return {
    id: row.id as number,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? null,
    type: row.type as TimelineType,
    color: (row.color as string) ?? null,
    sortOrder: (row.sort_order as number) ?? 0,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export function rowToEvent(row: Record<string, unknown>): Event {
  const event: Event = {
    id: row.id as number,
    timelineId: row.timeline_id as number,
    title: row.title as string,
    description: (row.description as string) ?? null,
    year: typeof row.year === 'string' ? parseFloat(row.year) : (row.year as number),
    month: (row.month as number) ?? null,
    day: (row.day as number) ?? null,
    isImportant: Boolean(row.is_important),
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
  if (row.timeline_name != null) {
    event.timeline = {
      id: row.timeline_id as number,
      name: row.timeline_name as string,
      slug: row.timeline_slug as string,
    };
  }
  return event;
}
