import { Router } from 'express';
import {
  getAllTimelines,
  getTimelineById,
  getTimelineBySlug,
  createTimeline,
  updateTimeline,
  deleteTimeline,
} from '../controllers/TimelineController';

const router = Router();

router.get('/', getAllTimelines);
router.get('/slug/:slug', getTimelineBySlug);
router.get('/:id', getTimelineById);
router.post('/', createTimeline);
router.put('/:id', updateTimeline);
router.delete('/:id', deleteTimeline);

export default router;
