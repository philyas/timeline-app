import { Request, Response } from 'express';
import { TimelineService } from '../services/TimelineService';

const timelineService = new TimelineService();

export async function getAllTimelines(_req: Request, res: Response): Promise<void> {
  try {
    const timelines = await timelineService.findAll();
    res.json(timelines);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch timelines.',
    });
  }
}

export async function getTimelineById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid timeline ID.' });
      return;
    }
    const timeline = await timelineService.findById(id);
    if (!timeline) {
      res.status(404).json({ error: 'Timeline not found.' });
      return;
    }
    res.json(timeline);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch timeline.',
    });
  }
}

export async function getTimelineBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const timeline = await timelineService.findBySlug(slug);
    if (!timeline) {
      res.status(404).json({ error: 'Timeline not found.' });
      return;
    }
    res.json(timeline);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch timeline.',
    });
  }
}

export async function createTimeline(req: Request, res: Response): Promise<void> {
  try {
    const timeline = await timelineService.create(req.body);
    res.status(201).json(timeline);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create timeline.';
    res.status(400).json({ error: message });
  }
}

export async function updateTimeline(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid timeline ID.' });
      return;
    }
    const timeline = await timelineService.update(id, req.body);
    res.json(timeline);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update timeline.';
    const status = message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: message });
  }
}

export async function deleteTimeline(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid timeline ID.' });
      return;
    }
    await timelineService.delete(id);
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete timeline.';
    res.status(message.includes('not found') ? 404 : 500).json({ error: message });
  }
}
