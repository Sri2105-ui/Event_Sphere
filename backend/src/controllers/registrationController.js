import { Registration } from '../models/Registration.js';
import { Event } from '../models/Event.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { generateTicketQR } from '../services/qrService.js';
import { sendRegistrationEmail } from '../services/emailService.js';
import { emitToEvent, emitToUser } from '../config/socket.js';

// @desc Register for an event (Free or Paid)
// @route POST /api/registrations
export const registerForEvent = async (req, res, next) => {
  try {
    const { eventId, paymentMethod, transactionId } = req.body;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ success: false, message: 'This event is not open for registration.' });
    }

    // Check existing registration
    const existing = await Registration.findOne({
      event: event._id,
      user: userId,
      status: { $in: ['confirmed', 'checked_in'] }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event.',
        registration: existing
      });
    }

    // Check capacity
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is fully booked! You can join the waitlist instead.',
        isFull: true
      });
    }

    // Check registration deadline if provided
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed for this event.'
      });
    }

    const regNumber = `ESP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Handle payment
    let paymentStatus = 'free';
    let amountPaid = 0;
    if (event.price > 0) {
      paymentStatus = 'paid';
      amountPaid = event.price;
    }

    // Create Registration placeholder first to get unique ID
    const registration = new Registration({
      event: event._id,
      user: userId,
      registrationNumber: regNumber,
      status: 'confirmed',
      paymentStatus,
      amountPaid,
      currency: event.currency,
      paymentMethod: event.price > 0 ? paymentMethod || 'card' : 'free',
      transactionId: transactionId || `TXN-${Date.now()}`,
      ticketHash: 'PENDING'
    });

    // Generate QR Ticket Code
    const qrResult = await generateTicketQR({
      registrationId: registration._id,
      eventId: event._id,
      userId: userId,
      userName: req.user.name,
      eventTitle: event.title,
      registrationNumber: regNumber
    });

    registration.ticketHash = qrResult.hash;
    registration.ticketQrData = qrResult.qrDataUrl;
    await registration.save();

    // Increment event registration count
    event.registeredCount += 1;
    // Remove user from waitlist if they were waitlisted
    event.waitlist = event.waitlist.filter((w) => w.user.toString() !== userId.toString());
    await event.save();

    // Record Payment if paid event
    if (event.price > 0) {
      await Payment.create({
        user: userId,
        event: event._id,
        registration: registration._id,
        amount: event.price,
        currency: event.currency,
        paymentMethod: paymentMethod || 'card',
        transactionId: registration.transactionId,
        status: 'completed'
      });
    }

    // Create Notification
    await Notification.create({
      recipient: userId,
      title: 'Registration Confirmed!',
      message: `You are confirmed for ${event.title}. Access your digital QR ticket anytime in My Events.`,
      type: 'registration',
      link: `/participant/registrations`
    });

    // Send confirmation email in background
    sendRegistrationEmail(req.user, event, registration);

    // Real-time updates
    emitToEvent(event._id, 'event_registration_update', {
      eventId: event._id,
      registeredCount: event.registeredCount,
      capacity: event.capacity
    });

    emitToUser(userId, 'new_notification', {
      title: 'Registration Confirmed',
      message: `You have successfully registered for ${event.title}`
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your digital ticket is ready.',
      registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get logged-in user's registrations
// @route GET /api/registrations/my
export const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate({
        path: 'event',
        select: 'title slug startDate endDate venueType venueName address bannerImage price status category eventType',
        populate: { path: 'category', select: 'name color icon' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get registration ticket by ID or hash
// @route GET /api/registrations/:id
export const getRegistrationDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    let query = {};
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = id;
    } else {
      query.$or = [{ ticketHash: id }, { registrationNumber: id }];
    }

    const registration = await Registration.findOne(query)
      .populate('event')
      .populate('user', 'name email organization phone avatar');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Ticket registration not found.' });
    }

    // Security check: Must be owner, organizer of event, or admin
    if (
      registration.user._id.toString() !== req.user._id.toString() &&
      registration.event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket.' });
    }

    res.status(200).json({
      success: true,
      registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc Cancel registration & auto-notify waitlist
// @route PUT /api/registrations/:id/cancel
export const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('event');
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this registration' });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Registration is already cancelled' });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Decrement event registered count
    const event = await Event.findById(registration.event._id);
    if (event && event.registeredCount > 0) {
      event.registeredCount -= 1;

      // Check if there are waitlisted participants
      if (event.waitlist.length > 0) {
        const nextInLine = event.waitlist[0];
        // Notify the next user that a seat is available
        await Notification.create({
          recipient: nextInLine.user,
          title: 'A Spot Opened Up!',
          message: `A ticket became available for ${event.title}! Register now before it fills up.`,
          type: 'event_update',
          link: `/events/${event.slug}`
        });

        emitToUser(nextInLine.user, 'new_notification', {
          title: 'Spot Available!',
          message: `A ticket opened up for ${event.title}`
        });
      }

      await event.save();
    }

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Submit review & rating
// @route POST /api/registrations/:id/feedback
export const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a star rating between 1 and 5.' });
    }

    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    registration.feedback = {
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date()
    };
    await registration.save();

    // Recalculate event average rating
    const allRatings = await Registration.find({
      event: registration.event,
      'feedback.rating': { $exists: true, $ne: null }
    });

    const total = allRatings.reduce((acc, curr) => acc + curr.feedback.rating, 0);
    const avg = Number((total / (allRatings.length || 1)).toFixed(1));

    await Event.findByIdAndUpdate(registration.event, {
      averageRating: avg,
      totalReviews: allRatings.length
    });

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
      feedback: registration.feedback,
      averageRating: avg
    });
  } catch (error) {
    next(error);
  }
};
