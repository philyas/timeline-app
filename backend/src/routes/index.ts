import { Router } from 'express';
import timelineRoutes from './timelineRoutes';
import eventRoutes from './eventRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/timelines', timelineRoutes);
router.use('/events', eventRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'timeline-api' });
});

export default router;
