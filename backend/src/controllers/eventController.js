import { Event } from '../models/Event.js';
import { Category } from '../models/Category.js';
import { Registration } from '../models/Registration.js';
import { Notification } from '../models/Notification.js';
import { emitToAll, emitToUser } from '../config/socket.js';

// Helper to generate unique slug
const createUniqueSlug = async (title) => {
  let baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  if (!baseSlug) baseSlug = 'event';

  let slug = baseSlug;
  let counter = 1;
  while (await Event.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

// @desc Get events with search, filter, and pagination
// @route GET /api/events
export const getEvents = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      eventType,
      venueType,
      priceType,
      dateRange,
      status,
      featured,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // By default, public only sees published events
    if (status && req.user && (req.user.role === 'admin' || req.user.role === 'organizer')) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    // Keyword search
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { shortDescription: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } },
        { venueName: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catObj = await Category.findOne({ slug: category });
        if (catObj) query.category = catObj._id;
      }
    }

    // Event type
    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }

    // Venue type
    if (venueType && venueType !== 'all') {
      query.venueType = venueType;
    }

    // Price filter
    if (priceType === 'free') {
      query.price = 0;
    } else if (priceType === 'paid') {
      query.price = { $gt: 0 };
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Date filters
    const now = new Date();
    if (dateRange === 'upcoming') {
      query.startDate = { $gte: now };
    } else if (dateRange === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      query.startDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (dateRange === 'past') {
      query.endDate = { $lt: new Date() };
    }

    // Sorting
    let sortOptions = { startDate: 1 }; // default upcoming first
    if (sort === 'date-desc') sortOptions = { startDate: -1 };
    else if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'popular') sortOptions = { registeredCount: -1 };
    else if (sort === 'rating') sortOptions = { averageRating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const totalEvents = await Event.countDocuments(query);

    const events = await Event.find(query)
      .populate('category', 'name slug icon color')
      .populate('organizer', 'name email avatar organization')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: events.length,
      totalEvents,
      totalPages: Math.ceil(totalEvents / Number(limit)) || 1,
      currentPage: Number(page),
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single event details
// @route GET /api/events/:slugOrId
export const getEventDetails = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;

    let event;
    if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(slugOrId)
        .populate('category', 'name slug icon color')
        .populate('organizer', 'name email avatar organization bio');
    } else {
      event = await Event.findOne({ slug: slugOrId })
        .populate('category', 'name slug icon color')
        .populate('organizer', 'name email avatar organization bio');
    }

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Fetch confirmed reviews for this event
    const reviews = await Registration.find({
      event: event._id,
      'feedback.rating': { $exists: true, $ne: null }
    })
      .select('feedback user createdAt')
      .populate('user', 'name avatar organization')
      .sort({ 'feedback.createdAt': -1 })
      .limit(10);

    // If logged in, check if user is registered or waitlisted
    let userRegistration = null;
    let isWaitlisted = false;
    if (req.user) {
      userRegistration = await Registration.findOne({
        event: event._id,
        user: req.user._id,
        status: { $in: ['confirmed', 'checked_in'] }
      });

      isWaitlisted = event.waitlist.some(
        (w) => w.user.toString() === req.user._id.toString()
      );
    }

    res.status(200).json({
      success: true,
      event,
      reviews,
      userRegistration,
      isWaitlisted
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create new event (Organizer or Admin)
// @route POST /api/events
export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      shortDescription,
      description,
      category,
      eventType,
      venueType,
      venueName,
      address,
      meetingLink,
      startDate,
      endDate,
      registrationDeadline,
      capacity,
      price,
      currency,
      bannerImage,
      tags,
      agenda,
      requirements,
      certificateTemplate,
      waitlistEnabled
    } = req.body;

    const slug = await createUniqueSlug(title);

    // Status: Admins can publish directly.
    // Organizers: if pre-approved or default, 'published', or 'pending_approval'
    let status = 'published';
    if (req.user.role === 'organizer') {
      // You can set to pending_approval if strict moderation is enabled
      status = req.body.status || 'published';
    }

    const event = await Event.create({
      title,
      slug,
      shortDescription,
      description,
      category,
      organizer: req.user._id,
      eventType: eventType || 'workshop',
      venueType: venueType || 'in-person',
      venueName: venueName || 'Campus Main Auditorium',
      address: address || 'Campus Main Hall',
      meetingLink: meetingLink || '',
      startDate,
      endDate,
      registrationDeadline: registrationDeadline || endDate,
      capacity: Number(capacity) || 100,
      price: Number(price) || 0,
      currency: currency || 'USD',
      bannerImage:
        req.uploadedImageUrl ||
        bannerImage ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
      agenda: Array.isArray(agenda) ? agenda : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      certificateTemplate: certificateTemplate || {},
      waitlistEnabled: waitlistEnabled !== undefined ? waitlistEnabled : true,
      status
    });

    // Notify admins if pending approval
    if (status === 'pending_approval') {
      emitToAll('admin_new_pending_event', {
        eventId: event._id,
        title: event.title,
        organizerName: req.user.name
      });
    }

    res.status(201).json({
      success: true,
      message: status === 'pending_approval' ? 'Event submitted for admin approval!' : 'Event published successfully!',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update event
// @route PUT /api/events/:id
export const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this event.'
      });
    }

    if (req.uploadedImageUrl) {
      req.body.bannerImage = req.uploadedImageUrl;
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug icon color');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete event
// @route DELETE /api/events/:id
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event.'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get events created by logged in organizer
// @route GET /api/events/organizer/my-events
export const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .populate('category', 'name slug icon color')
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

// @desc Join event waitlist
// @route POST /api/events/:id/waitlist
export const joinWaitlist = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if already registered
    const existing = await Registration.findOne({
      event: event._id,
      user: req.user._id,
      status: 'confirmed'
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event.'
      });
    }

    // Check if already on waitlist
    const alreadyWaitlisted = event.waitlist.some(
      (w) => w.user.toString() === req.user._id.toString()
    );
    if (alreadyWaitlisted) {
      return res.status(400).json({
        success: false,
        message: 'You are already on the waitlist for this event.'
      });
    }

    event.waitlist.push({ user: req.user._id, joinedAt: new Date() });
    await event.save();

    res.status(200).json({
      success: true,
      message: 'You have joined the waitlist! You will be notified if a seat opens up.',
      waitlistPosition: event.waitlist.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc Leave event waitlist
// @route DELETE /api/events/:id/waitlist
export const leaveWaitlist = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.waitlist = event.waitlist.filter(
      (w) => w.user.toString() !== req.user._id.toString()
    );
    await event.save();

    res.status(200).json({
      success: true,
      message: 'You have left the waitlist.'
    });
  } catch (error) {
    next(error);
  }
};
