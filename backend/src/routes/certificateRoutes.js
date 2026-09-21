import express from 'express';
import {
  batchGenerateCertificates,
  getMyCertificates,
  verifyCertificate,
  getEventCertificates
} from '../controllers/certificateController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = express.Router();

// Public verification
router.get('/verify/:code', verifyCertificate);

// Participant routes
router.get('/my', protect, getMyCertificates);

// Organizer routes
router.post('/events/:eventId/generate', protect, authorize('organizer', 'admin'), batchGenerateCertificates);
router.get('/events/:eventId', protect, authorize('organizer', 'admin'), getEventCertificates);

export default router;
