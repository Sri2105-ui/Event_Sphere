import { Registration } from '../models/Registration.js';
import { Event } from '../models/Event.js';
import { Notification } from '../models/Notification.js';
import { sendEmail } from '../services/emailService.js';
import { emitToEvent } from '../config/socket.js';

// @desc Scan QR Code or manual code check-in
// @route POST /api/attendance/scan
export const scanTicket = async (req, res, next) => {
  try {
    const { code, eventId } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a ticket code or scan payload.' });
    }

    let parsedHash = code.trim();

    // Check if code is JSON payload from QR scanner
    try {
      if (code.startsWith('{') && code.endsWith('}')) {
        const json = JSON.parse(code);
        parsedHash = json.tHash || json.regNo || code;
      }
    } catch {
      // Use raw code
    }

    // Search for registration
    const query = {
      $or: [
        { ticketHash: parsedHash },
        { registrationNumber: parsedHash }
      ]
    };

    if (eventId) {
      query.event = eventId;
    }

    const registration = await Registration.findOne(query)
      .populate('event', 'title organizer startDate endDate venueName')
      .populate('user', 'name email avatar organization phone');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Ticket! No matching registration found on the system.'
      });
    }

    // Check authorization: organizer of event or admin
    if (
      registration.event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to check in attendees for this event.'
      });
    }

    // Check if already checked in
    if (registration.attendanceStatus === 'checked_in') {
      return res.status(200).json({
        success: true,
        alreadyCheckedIn: true,
        message: `Already checked in at ${new Date(registration.checkedInAt).toLocaleTimeString()}`,
        attendee: {
          name: registration.user.name,
          email: registration.user.email,
          organization: registration.user.organization,
          registrationNumber: registration.registrationNumber,
          checkedInAt: registration.checkedInAt
        }
      });
    }

    // Mark checked in
    registration.attendanceStatus = 'checked_in';
    registration.checkedInAt = new Date();
    registration.checkedInBy = req.user._id;
    await registration.save();

    // Get updated check-in stats
    const totalAttendees = await Registration.countDocuments({
      event: registration.event._id,
      status: 'confirmed'
    });
    const checkedInCount = await Registration.countDocuments({
      event: registration.event._id,
      status: 'confirmed',
      attendanceStatus: 'checked_in'
    });

    // Real-time socket broadcast
    emitToEvent(registration.event._id, 'attendee_checked_in', {
      registrationId: registration._id,
      attendeeName: registration.user.name,
      checkedInAt: registration.checkedInAt,
      checkedInCount,
      totalAttendees
    });

    res.status(200).json({
      success: true,
      message: `Welcome, ${registration.user.name}! Check-in verified.`,
      alreadyCheckedIn: false,
      attendee: {
        id: registration._id,
        name: registration.user.name,
        email: registration.user.email,
        organization: registration.user.organization,
        registrationNumber: registration.registrationNumber,
        ticketHash: registration.ticketHash,
        checkedInAt: registration.checkedInAt,
        attendanceStatus: 'checked_in'
      },
      stats: {
        checkedInCount,
        totalAttendees,
        percentage: Math.round((checkedInCount / (totalAttendees || 1)) * 100)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get attendee roster for an event
// @route GET /api/attendance/events/:eventId/attendees
export const getEventAttendees = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { status, search } = req.query;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Check permission
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    let filter = { event: eventId, status: { $ne: 'cancelled' } };
    if (status && status !== 'all') {
      filter.attendanceStatus = status;
    }

    let attendees = await Registration.find(filter)
      .populate('user', 'name email avatar organization phone')
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      attendees = attendees.filter((att) => {
        const u = att.user;
        return (
          (u && u.name && u.name.toLowerCase().includes(q)) ||
          (u && u.email && u.email.toLowerCase().includes(q)) ||
          att.registrationNumber.toLowerCase().includes(q) ||
          att.ticketHash.toLowerCase().includes(q)
        );
      });
    }

    const totalCount = await Registration.countDocuments({ event: eventId, status: 'confirmed' });
    const checkedInCount = await Registration.countDocuments({
      event: eventId,
      status: 'confirmed',
      attendanceStatus: 'checked_in'
    });

    res.status(200).json({
      success: true,
      count: attendees.length,
      stats: {
        totalCount,
        checkedInCount,
        absentCount: totalCount - checkedInCount,
        checkInRate: Math.round((checkedInCount / (totalCount || 1)) * 100)
      },
      attendees
    });
  } catch (error) {
    next(error);
  }
};

// @desc Toggle manual check-in status
// @route PUT /api/attendance/registrations/:regId/toggle
export const manualCheckInToggle = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.regId)
      .populate('event', 'organizer title')
      .populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (
      registration.event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (registration.attendanceStatus === 'checked_in') {
      registration.attendanceStatus = 'registered';
      registration.checkedInAt = null;
      registration.checkedInBy = null;
    } else {
      registration.attendanceStatus = 'checked_in';
      registration.checkedInAt = new Date();
      registration.checkedInBy = req.user._id;
    }

    await registration.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${registration.attendanceStatus}`,
      attendanceStatus: registration.attendanceStatus,
      checkedInAt: registration.checkedInAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc Broadcast announcement to all confirmed attendees
// @route POST /api/attendance/events/:eventId/announce
export const broadcastAnnouncement = async (req, res, next) => {
  try {
    const { title, message } = req.body;
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const registrations = await Registration.find({
      event: eventId,
      status: 'confirmed'
    }).populate('user', 'email name');

    // Create notifications for all attendees
    const notifs = registrations.map((r) => ({
      recipient: r.user._id,
      title: `[${event.title}] ${title}`,
      message,
      type: 'announcement',
      link: `/events/${event.slug}`
    }));

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    // Send emails in background
    registrations.forEach((r) => {
      sendEmail({
        to: r.user.email,
        subject: `Announcement: ${event.title} - ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #4f46e5;">${event.title}</h2>
            <h3>${title}</h3>
            <p style="font-size: 15px; color: #334155; line-height: 1.5;">${message}</p>
            <hr/>
            <p style="font-size: 12px; color: #94a3b8;">Sent by event organizer.</p>
          </div>
        `
      });
    });

    res.status(200).json({
      success: true,
      message: `Announcement sent to ${registrations.length} registered attendees.`
    });
  } catch (error) {
    next(error);
  }
};
