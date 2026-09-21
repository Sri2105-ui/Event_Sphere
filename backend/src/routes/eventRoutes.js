import express from 'express';
import {
  getEvents,
  getEventDetails,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  joinWaitlist,
  leaveWaitlist
} from '../controllers/eventController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';
import { upload, processImage } from '../middleware/upload.js';

const router = express.Router();

router.get('/', optionalAuth, getEvents);
router.get('/organizer/my-events', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/:slugOrId', optionalAuth, getEventDetails);

router.post(
  '/',
  protect,
  authorize('organizer', 'admin'),
  upload.single('banner'),
  processImage,
  createEvent
);

router.put(
  '/:id',
  protect,
  authorize('organizer', 'admin'),
  upload.single('banner'),
  processImage,
  updateEvent
);

router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

router.post('/:id/waitlist', protect, joinWaitlist);
router.delete('/:id/waitlist', protect, leaveWaitlist);

export default router;
