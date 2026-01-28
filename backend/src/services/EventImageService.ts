import fs from 'fs';
import { getKnex } from '../config/knex';
import { getEventImagePath } from '../config/upload';

export interface EventImageRecord {
  id: number;
  eventId: number;
  filename: string;
  isMain: boolean;
  sortOrder: number;
  createdAt?: Date;
}

function rowToImage(row: Record<string, unknown>): EventImageRecord {
  return {
    id: row.id as number,
    eventId: row.event_id as number,
    filename: row.filename as string,
    isMain: Boolean(row.is_main),
    sortOrder: (row.sort_order as number) ?? 0,
    createdAt: row.created_at as Date,
  };
}

export class EventImageService {
  async findByEventId(eventId: number): Promise<EventImageRecord[]> {
    const rows = await getKnex()('event_images')
      .where({ event_id: eventId })
      .orderBy('is_main', 'desc')
      .orderBy('sort_order', 'asc')
      .orderBy('id', 'asc');
    return rows.map(rowToImage);
  }

  async findByEventIds(eventIds: number[]): Promise<Map<number, EventImageRecord[]>> {
    if (eventIds.length === 0) return new Map();
    const rows = await getKnex()('event_images')
      .whereIn('event_id', eventIds)
      .orderBy('is_main', 'desc')
      .orderBy('sort_order', 'asc')
      .orderBy('id', 'asc');
    const map = new Map<number, EventImageRecord[]>();
    for (const r of rows) {
      const eid = r.event_id as number;
      if (!map.has(eid)) map.set(eid, []);
      map.get(eid)!.push(rowToImage(r));
    }
    return map;
  }

  async add(eventId: number, filename: string, isMain: boolean = false): Promise<EventImageRecord> {
    const knex = getKnex();
    const count = await knex('event_images').where({ event_id: eventId }).count('* as c').first();
    const sortOrder = Number((count as { c: string })?.c ?? 0);

    const [row] = await knex('event_images')
      .insert({
        event_id: eventId,
        filename,
        is_main: isMain,
        sort_order: sortOrder,
      })
      .returning('*');

    if (isMain) {
      await knex('event_images').where({ event_id: eventId }).whereNot('id', row.id).update({ is_main: false });
    }
    return rowToImage(row);
  }

  async setMain(imageId: number): Promise<void> {
    const row = await getKnex()('event_images').where({ id: imageId }).first();
    if (!row) throw new Error('Image not found.');
    const eventId = row.event_id as number;
    await getKnex()('event_images').where({ event_id: eventId }).update({ is_main: false });
    await getKnex()('event_images').where({ id: imageId }).update({ is_main: true });
  }

  async delete(imageId: number): Promise<void> {
    const row = await getKnex()('event_images').where({ id: imageId }).first();
    if (!row) throw new Error('Image not found.');
    const eventId = row.event_id as number;
    const filename = row.filename as string;
    await getKnex()('event_images').where({ id: imageId }).del();
    const filePath = getEventImagePath(eventId, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async deleteAllForEvent(eventId: number): Promise<void> {
    const list = await this.findByEventId(eventId);
    for (const img of list) {
      const filePath = getEventImagePath(eventId, img.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await getKnex()('event_images').where({ event_id: eventId }).del();
  }
}

export function getImageUrl(filename: string, eventId: number): string {
  return `/uploads/events/${eventId}/${filename}`;
}
