import { Certificate } from '../models/Certificate.js';
import { Registration } from '../models/Registration.js';
import { Event } from '../models/Event.js';
import { Notification } from '../models/Notification.js';
import { sendCertificateEmail } from '../services/emailService.js';
import { emitToUser } from '../config/socket.js';
import crypto from 'crypto';

// Helper to generate verification code
const generateVerificationCode = () => {
  return 'ESP-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// @desc Batch generate certificates for checked-in attendees
// @route POST /api/certificates/events/:eventId/generate
export const batchGenerateCertificates = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Find all checked-in registrations
    const checkedInRegistrations = await Registration.find({
      event: eventId,
      status: 'confirmed',
      attendanceStatus: 'checked_in'
    }).populate('user', 'name email');

    if (checkedInRegistrations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No checked-in attendees found for this event. Mark attendees as checked-in first!'
      });
    }

    const createdCertificates = [];
    const template = event.certificateTemplate || {};

    for (const reg of checkedInRegistrations) {
      // Check if certificate already exists
      let cert = await Certificate.findOne({ event: eventId, user: reg.user._id });

      if (!cert) {
        const vCode = generateVerificationCode();
        const certNumber = `CERT-${new Date().getFullYear()}-${vCode}`;

        cert = await Certificate.create({
          event: event._id,
          user: reg.user._id,
          registration: reg._id,
          certificateNumber: certNumber,
          verificationCode: vCode,
          title: template.title || 'Certificate of Achievement',
          recipientName: reg.user.name,
          eventName: event.title,
          eventDate: event.startDate,
          issuerName: template.issuerName || 'Event Board',
          issuerRole: template.issuerRole || 'Director',
          templateStyle: template.templateStyle || 'gold'
        });

        // Notify user
        await Notification.create({
          recipient: reg.user._id,
          title: '🎓 Certificate Available!',
          message: `Your certificate for ${event.title} is now ready to download.`,
          type: 'ticket',
          link: '/participant/certificates'
        });

        emitToUser(reg.user._id, 'new_notification', {
          title: 'Certificate Ready',
          message: `Your certificate for ${event.title} has been issued!`
        });

        // Send email in background
        sendCertificateEmail(reg.user, event, cert);
      }

      createdCertificates.push(cert);
    }

    res.status(200).json({
      success: true,
      message: `Successfully issued ${createdCertificates.length} certificates!`,
      count: createdCertificates.length,
      certificates: createdCertificates
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current user certificates
// @route GET /api/certificates/my
export const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate('event', 'title slug bannerImage startDate endDate venueName category')
      .sort({ issuedAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    next(error);
  }
};

// @desc Verify certificate by code (Public)
// @route GET /api/certificates/verify/:code
export const verifyCertificate = async (req, res, next) => {
  try {
    const { code } = req.params;

    const cert = await Certificate.findOne({
      $or: [
        { verificationCode: code.toUpperCase().trim() },
        { certificateNumber: code.trim() }
      ]
    })
      .populate('event', 'title slug startDate endDate eventType venueName')
      .populate('user', 'name organization avatar');

    if (!cert) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'No verifiable certificate found with this verification code.'
      });
    }

    res.status(200).json({
      success: true,
      valid: cert.status === 'issued',
      certificate: cert
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get issued certificates for an event (Organizer/Admin)
// @route GET /api/certificates/events/:eventId
export const getEventCertificates = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const certificates = await Certificate.find({ event: eventId })
      .populate('user', 'name email organization avatar')
      .sort({ issuedAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    next(error);
  }
};
