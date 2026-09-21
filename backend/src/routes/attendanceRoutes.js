import express from 'express';
import {
  scanTicket,
  getEventAttendees,
  manualCheckInToggle,
  broadcastAnnouncement
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = express.Router();

router.post('/scan', protect, authorize('organizer', 'admin'), scanTicket);
router.get('/events/:eventId/attendees', protect, authorize('organizer', 'admin'), getEventAttendees);
router.put('/registrations/:regId/toggle', protect, authorize('organizer', 'admin'), manualCheckInToggle);
router.post('/events/:eventId/announce', protect, authorize('organizer', 'admin'), broadcastAnnouncement);

export default router;
