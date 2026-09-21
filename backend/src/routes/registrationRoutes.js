import express from 'express';
import {
  registerForEvent,
  getMyRegistrations,
  getRegistrationDetails,
  cancelRegistration,
  submitFeedback
} from '../controllers/registrationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.get('/:id', protect, getRegistrationDetails);
router.put('/:id/cancel', protect, cancelRegistration);
router.post('/:id/feedback', protect, submitFeedback);

export default router;
