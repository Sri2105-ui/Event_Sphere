import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { sendEmail } from '../services/emailService.js';
import { emitToUser } from '../config/socket.js';

// @desc Get platform-wide overview metrics
// @route GET /api/admin/stats
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrganizers,
      totalParticipants,
      totalEvents,
      pendingEvents,
      publishedEvents,
      totalRegistrations,
      totalCheckedIn,
      payments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'organizer' }),
      User.countDocuments({ role: 'participant' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'pending_approval' }),
      Event.countDocuments({ status: 'published' }),
      Registration.countDocuments({ status: 'confirmed' }),
      Registration.countDocuments({ status: 'confirmed', attendanceStatus: 'checked_in' }),
      Payment.find({ status: 'completed' })
    ]);

    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Recent registrations
    const recentRegistrations = await Registration.find({ status: 'confirmed' })
      .populate('user', 'name email avatar')
      .populate('event', 'title startDate venueName price')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent pending events
    const recentPendingEvents = await Event.find({ status: 'pending_approval' })
      .populate('organizer', 'name email organization')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOrganizers,
        totalParticipants,
        totalEvents,
        pendingEvents,
        publishedEvents,
        totalRegistrations,
        totalCheckedIn,
        attendanceRate: Math.round((totalCheckedIn / (totalRegistrations || 1)) * 100),
        totalRevenue
      },
      recentRegistrations,
      recentPendingEvents
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get pending approval events
// @route GET /api/admin/events/pending
export const getPendingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'pending_approval' })
      .populate('organizer', 'name email organization avatar phone')
      .populate('category', 'name icon color')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc Review event (Approve or Reject)
// @route PUT /api/admin/events/:id/review
export const reviewEvent = async (req, res, next) => {
  try {
    const { action, reason } = req.body; // 'approve' or 'reject'
    const event = await Event.findById(req.params.id).populate('organizer');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (action === 'approve') {
      event.status = 'published';
      event.rejectionReason = '';
    } else if (action === 'reject') {
      event.status = 'rejected';
      event.rejectionReason = reason || 'Does not meet campus policy guidelines.';
    } else {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject' });
    }

    await event.save();

    // Create notification for organizer
    await Notification.create({
      recipient: event.organizer._id,
      title: action === 'approve' ? 'Event Approved & Published!' : 'Event Revision Requested',
      message:
        action === 'approve'
          ? `Your event "${event.title}" has been approved by admin and is now live.`
          : `Your event "${event.title}" was not approved. Reason: ${event.rejectionReason}`,
      type: 'approval',
      link: `/organizer/events`
    });

    emitToUser(event.organizer._id, 'new_notification', {
      title: action === 'approve' ? 'Event Approved' : 'Event Status Update',
      message: `Your event ${event.title} is now ${event.status}`
    });

    // Send email
    sendEmail({
      to: event.organizer.email,
      subject: `EventSphere Status: ${event.title} (${event.status.toUpperCase()})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Event Moderation Update</h2>
          <p>Hello ${event.organizer.name},</p>
          <p>Your event <strong>${event.title}</strong> has been marked as <strong>${event.status}</strong>.</p>
          ${event.rejectionReason ? `<p style="color: #ef4444;"><strong>Notes:</strong> ${event.rejectionReason}</p>` : '<p style="color: #10b981;">Your event is now publicly searchable and accepting registrations.</p>'}
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: `Event has been ${action === 'approve' ? 'approved and published' : 'rejected'} successfully.`,
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all users with filters
// @route GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      totalUsers,
      totalPages: Math.ceil(totalUsers / Number(limit)),
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update user role or status (ban, promote, approve organizer)
// @route PUT /api/admin/users/:id
export const updateUserStatus = async (req, res, next) => {
  try {
    const { role, isApprovedOrganizer, isActive } = req.body;

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (isApprovedOrganizer !== undefined) user.isApprovedOrganizer = isApprovedOrganizer;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User status updated successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all payments/transactions
// @route GET /api/admin/payments
export const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email organization')
      .populate('event', 'title venueName startDate')
      .sort({ createdAt: -1 });

    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    res.status(200).json({
      success: true,
      count: payments.length,
      totalRevenue,
      payments
    });
  } catch (error) {
    next(error);
  }
};
