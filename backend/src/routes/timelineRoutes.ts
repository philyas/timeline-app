import { Router } from 'express';
import {
  getAllTimelines,
  getTimelineById,
  getTimelineBySlug,
  createTimeline,
  updateTimeline,
  deleteTimeline,
} from '../controllers/TimelineController';
import { jwtAuth } from '../middleware/jwtAuth';

const router = Router();

router.use(jwtAuth);

router.get('/', getAllTimelines);
router.get('/slug/:slug', getTimelineBySlug);
router.get('/:id', getTimelineById);
router.post('/', createTimeline);
router.put('/:id', updateTimeline);
router.delete('/:id', deleteTimeline);

export default router;
