import { Response } from 'express';
import { EventService } from '../services/EventService';
import { EventImageService, getImageUrl } from '../services/EventImageService';
import { EventImage } from '../types/timeline';
import type { AuthRequest } from '../middleware/jwtAuth';

const eventService = new EventService();
const eventImageService = new EventImageService();

export async function getEventsByTimeline(req: AuthRequest, res: Response): Promise<void> {
  try {
    const timelineId = parseInt(req.params.timelineId, 10);
    if (isNaN(timelineId)) {
      res.status(400).json({ error: 'Ungültige Timeline-ID.' });
      return;
    }
    const userId = req.userId!;
    const events = await eventService.findByTimelineId(timelineId, userId);
    res.json(events);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Fehler beim Laden der Ereignisse.',
    });
  }
}

export async function getEventById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Ungültige Ereignis-ID.' });
      return;
    }
    const userId = req.userId!;
    const event = await eventService.findById(id, userId);
    if (!event) {
      res.status(404).json({ error: 'Ereignis nicht gefunden.' });
      return;
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Fehler beim Laden des Ereignisses.',
    });
  }
}

export async function getImportantEvents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const userId = req.userId!;
    const events = await eventService.findImportant(limit, userId);
    res.json(events);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Fehler beim Laden der wichtigen Ereignisse.',
    });
  }
}

export async function createEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const event = await eventService.create(req.body, userId);
    res.status(201).json(event);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ereignis konnte nicht erstellt werden.';
    res.status(400).json({ error: message });
  }
}

export async function updateEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Ungültige Ereignis-ID.' });
      return;
    }
    const userId = req.userId!;
    const event = await eventService.update(id, req.body, userId);
    res.json(event);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ereignis konnte nicht aktualisiert werden.';
    const status = message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: message });
  }
}

export async function deleteEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Ungültige Ereignis-ID.' });
      return;
    }
    const userId = req.userId!;
    await eventService.delete(id, userId);
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ereignis konnte nicht gelöscht werden.';
    res.status(message.includes('not found') ? 404 : 500).json({ error: message });
  }
}

export async function uploadEventImages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ error: 'Ungültige Ereignis-ID.' });
      return;
    }
    const userId = req.userId!;
    const event = await eventService.findById(eventId, userId);
    if (!event) {
      res.status(404).json({ error: 'Ereignis nicht gefunden.' });
      return;
    }
    const files = (req as unknown as { files?: { filename: string }[] }).files ?? [];
    if (files.length === 0) {
      res.status(400).json({ error: 'Keine Bilder angehängt.' });
      return;
    }
    const existing = await eventImageService.findByEventId(eventId);
    const isFirst = existing.length === 0;
    const created: EventImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const isMain = isFirst && i === 0;
      const rec = await eventImageService.add(eventId, f.filename, isMain);
      created.push({
        id: rec.id,
        eventId: rec.eventId,
        filename: rec.filename,
        isMain: rec.isMain,
        sortOrder: rec.sortOrder,
        url: getImageUrl(rec.filename, rec.eventId),
        createdAt: rec.createdAt,
      });
    }
    res.status(201).json(created);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload fehlgeschlagen.';
    res.status(400).json({ error: message });
  }
}

export async function deleteEventImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const imageId = parseInt(req.params.imageId, 10);
    if (isNaN(imageId)) {
      res.status(400).json({ error: 'Invalid image ID.' });
      return;
    }
    await eventImageService.delete(imageId);
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bild konnte nicht gelöscht werden.';
    res.status(message.includes('not found') ? 404 : 400).json({ error: message });
  }
}

export async function setEventMainImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const imageId = parseInt(req.params.imageId, 10);
    if (isNaN(imageId)) {
      res.status(400).json({ error: 'Invalid image ID.' });
      return;
    }
    await eventImageService.setMain(imageId);
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Hauptbild konnte nicht gesetzt werden.';
    res.status(message.includes('not found') ? 404 : 400).json({ error: message });
  }
}
