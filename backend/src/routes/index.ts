import { Router } from 'express';
import timelineRoutes from './timelineRoutes';
import eventRoutes from './eventRoutes';

const router = Router();

router.use('/timelines', timelineRoutes);
router.use('/events', eventRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'timeline-api' });
});

export default router;
