import { Response } from 'express';
import { TimelineService } from '../services/TimelineService';
import type { AuthRequest } from '../middleware/jwtAuth';

const timelineService = new TimelineService();

export async function getAllTimelines(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const timelines = await timelineService.findAll(userId);
    res.json(timelines);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Fehler beim Laden der Zeitstrahlen.',
    });
  }
}

export async function getTimelineById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Ungültige Timeline-ID.' });
      return;
    }
    const userId = req.userId!;
    const timeline = await timelineService.findById(id, userId);
    if (!timeline) {
      res.status(404).json({ error: 'Timeline nicht gefunden.' });
      return;
    }
    res.json(timeline);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Fehler beim Laden der Timeline.',
    });
  }
}

export async function getTimelineBySlug(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const userId = req.userId!;
    const timeline = await timelineService.findBySlug(slug, userId);
    if (!timeline) {
      res.status(404).json({ error: 'Timeline nicht gefunden.' });
      return;
    }
    res.json(timeline);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Fehler beim Laden der Timeline.',
    });
  }
}

export async function createTimeline(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const timeline = await timelineService.create(req.body, userId);
    res.status(201).json(timeline);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Timeline konnte nicht erstellt werden.';
    res.status(400).json({ error: message });
  }
}

export async function updateTimeline(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Ungültige Timeline-ID.' });
      return;
    }
    const userId = req.userId!;
    const timeline = await timelineService.update(id, req.body, userId);
    res.json(timeline);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Timeline konnte nicht aktualisiert werden.';
    const status = message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: message });
  }
}

export async function deleteTimeline(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Ungültige Timeline-ID.' });
      return;
    }
    const userId = req.userId!;
    await timelineService.delete(id, userId);
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Timeline konnte nicht gelöscht werden.';
    res.status(message.includes('not found') ? 404 : 500).json({ error: message });
  }
}
