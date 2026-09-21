import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { Payment } from '../models/Payment.js';

// @desc Get organizer analytics and chart metrics
// @route GET /api/analytics/organizer
export const getOrganizerAnalytics = async (req, res, next) => {
  try {
    const organizerId = req.user._id;

    // Find all events created by organizer
    const myEvents = await Event.find({ organizer: organizerId });
    const eventIds = myEvents.map((e) => e._id);

    // Registrations for organizer's events
    const registrations = await Registration.find({
      event: { $in: eventIds },
      status: 'confirmed'
    }).populate('event', 'title price startDate');

    const totalRegistrations = registrations.length;
    const checkedInCount = registrations.filter((r) => r.attendanceStatus === 'checked_in').length;
    const totalRevenue = registrations.reduce((acc, r) => acc + (r.amountPaid || 0), 0);

    // Event performance breakdown
    const eventPerformance = myEvents.map((event) => {
      const eventRegs = registrations.filter((r) => r.event._id.toString() === event._id.toString());
      const checkedIn = eventRegs.filter((r) => r.attendanceStatus === 'checked_in').length;
      return {
        id: event._id,
        title: event.title,
        capacity: event.capacity,
        registered: eventRegs.length,
        checkedIn,
        revenue: eventRegs.reduce((acc, r) => acc + (r.amountPaid || 0), 0),
        attendanceRate: Math.round((checkedIn / (eventRegs.length || 1)) * 100)
      };
    });

    // Monthly registrations chart data (last 6 months)
    const monthlyMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize current and previous 5 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthlyMap[key] = { month: key, registrations: 0, revenue: 0 };
    }

    registrations.forEach((r) => {
      const d = new Date(r.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      if (monthlyMap[key]) {
        monthlyMap[key].registrations += 1;
        monthlyMap[key].revenue += r.amountPaid || 0;
      }
    });

    res.status(200).json({
      success: true,
      metrics: {
        totalEvents: myEvents.length,
        totalRegistrations,
        checkedInCount,
        absentCount: totalRegistrations - checkedInCount,
        overallAttendanceRate: Math.round((checkedInCount / (totalRegistrations || 1)) * 100),
        totalRevenue
      },
      charts: {
        monthlyTrend: Object.values(monthlyMap),
        eventPerformance,
        attendanceBreakdown: [
          { name: 'Checked In', value: checkedInCount, color: '#10B981' },
          { name: 'Absent / Pending', value: totalRegistrations - checkedInCount, color: '#F59E0B' }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get notifications for logged-in user
// @route GET /api/analytics/notifications
export const getUserNotifications = async (req, res, next) => {
  try {
    const { Notification } = await import('../models/Notification.js');
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark notification as read
// @route PUT /api/analytics/notifications/:id/read
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { Notification } = await import('../models/Notification.js');
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc Mark all notifications as read
// @route PUT /api/analytics/notifications/read-all
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const { Notification } = await import('../models/Notification.js');
    await Notification.updateMany({ recipient: req.user._id }, { read: true });

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
