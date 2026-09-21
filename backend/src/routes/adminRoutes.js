import express from 'express';
import {
  getAdminStats,
  getPendingEvents,
  reviewEvent,
  getAllUsers,
  updateUserStatus,
  getAllPayments
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = express.Router();

// Admin-only middleware guard
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/events/pending', getPendingEvents);
router.put('/events/:id/review', reviewEvent);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserStatus);
router.get('/payments', getAllPayments);

export default router;
