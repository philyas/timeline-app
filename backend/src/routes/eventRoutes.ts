import { Router } from 'express';
import {
  getEventsByTimeline,
  getEventById,
  getImportantEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImages,
  deleteEventImage,
  setEventMainImage,
} from '../controllers/EventController';
import { uploadEventImage } from '../config/upload';
import { jwtAuth } from '../middleware/jwtAuth';

const router = Router();

router.use(jwtAuth);

// Wichtige Ereignisse – muss vor /:id stehen, damit "important" nicht als ID geparst wird
router.get('/important', getImportantEvents);
router.get('/timeline/:timelineId', getEventsByTimeline);
router.post('/:id/images', uploadEventImage.array('images', 10), uploadEventImages);
router.delete('/:id/images/:imageId', deleteEventImage);
router.patch('/:id/images/:imageId/main', setEventMainImage);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
