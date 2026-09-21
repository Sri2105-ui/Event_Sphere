import express from 'express';
import {
  getOrganizerAnalytics,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = express.Router();

router.get('/organizer', protect, authorize('organizer', 'admin'), getOrganizerAnalytics);
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/:id/read', protect, markNotificationAsRead);
router.put('/notifications/read-all', protect, markAllNotificationsAsRead);

export default router;
