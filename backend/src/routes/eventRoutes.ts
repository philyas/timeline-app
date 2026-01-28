import { Router } from 'express';
import {
  getEventsByTimeline,
  getEventById,
  getImportantEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/EventController';

const router = Router();

router.get('/important', getImportantEvents);
router.get('/timeline/:timelineId', getEventsByTimeline);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
