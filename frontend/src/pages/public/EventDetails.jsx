import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { QRTicketModal } from '../../components/QRTicketModal';
import { Tilt3D } from '../../components/Tilt3D';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Ticket,
  Award,
  CreditCard,
  Star,
  Sparkles,
  Share2,
  ExternalLink,
  ChevronLeft,
  X,
  Send,
  MessageSquare
} from 'lucide-react';

export const EventDetails = ({ eventSlugOrId, onBack, setTab }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userRegistration, setUserRegistration] = useState(null);
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, agenda, venue, reviews

  // Modal States
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [submittingReg, setSubmittingReg] = useState(false);

  // Review Form
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Mock Payment state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${eventSlugOrId}`);
      if (res.data.success) {
        setEvent(res.data.event);
        setReviews(res.data.reviews || []);
        setUserRegistration(res.data.userRegistration || null);
        setIsWaitlisted(res.data.isWaitlisted || false);
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading event details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventSlugOrId]);

  // Trigger registration or open checkout
  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      addToast('Please sign in to register for this event.', 'info');
      setTab('login');
      return;
    }

    if (event.price > 0) {
      setShowCheckoutModal(true);
    } else {
      executeRegistration('free', `TXN-FREE-${Date.now()}`);
    }
  };

  const executeRegistration = async (method, txnId) => {
    setSubmittingReg(true);
    try {
      const res = await api.post('/registrations', {
        eventId: event._id,
        paymentMethod: method,
        transactionId: txnId
      });

      if (res.data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        addToast('🎉 Registration confirmed! Your digital ticket is ready.', 'success');
        setUserRegistration(res.data.registration);
        setShowCheckoutModal(false);
        setShowTicketModal(true);
        fetchEvent(); // refresh counts
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      addToast(msg, 'error');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!isAuthenticated) {
      setTab('login');
      return;
    }
    try {
      const res = await api.post(`/events/${event._id}/waitlist`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setIsWaitlisted(true);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to join waitlist', 'error');
    }
  };

  const handleLeaveWaitlist = async () => {
    try {
      const res = await api.delete(`/events/${event._id}/waitlist`);
      if (res.data.success) {
        addToast(res.data.message, 'info');
        setIsWaitlisted(false);
      }
    } catch (err) {
      addToast('Failed to leave waitlist', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userRegistration) return;

    setSubmittingReview(true);
    try {
      const res = await api.post(`/registrations/${userRegistration._id}/feedback`, {
        rating,
        comment: reviewComment
      });

      if (res.data.success) {
        addToast('Review submitted successfully!', 'success');
        setReviewComment('');
        fetchEvent();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          Return to Explore
        </button>
      </div>
    );
  }

  const isFree = event.price === 0;
  const isFull = event.registeredCount >= event.capacity;
  const fillPercentage = Math.min(
    Math.round(((event.registeredCount || 0) / (event.capacity || 100)) * 100),
    100
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            addToast('Event link copied to clipboard!', 'info');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-medium transition-colors shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>

      {/* Main Grid: Details (Left) + Booking Sticky Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Hero Banner & Tabs Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 shadow-xl dark:shadow-2xl h-[320px] sm:h-[400px]">
            <img
              src={event.bannerImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Badges on Banner */}
            <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
              {event.category && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-lg"
                  style={{ backgroundColor: `${event.category.color || '#6366F1'}dd` }}
                >
                  {event.category.name}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700 uppercase">
                {event.eventType}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700 uppercase">
                {event.venueType}
              </span>
            </div>

            {/* Banner Bottom Details */}
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="font-display font-black text-2xl sm:text-4xl text-white leading-tight drop-shadow-md">
                {event.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 font-medium line-clamp-2 drop-shadow">
                {event.shortDescription}
              </p>
            </div>
          </div>

          {/* Organizer Info Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={event.organizer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                alt={event.organizer?.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                  Organized By
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{event.organizer?.name}</span>
                <span className="text-xs text-brand-600 dark:text-brand-400 block font-medium">
                  {event.organizer?.organization || 'Campus Society'}
                </span>
              </div>
            </div>

            {event.averageRating > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{event.averageRating}</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">({event.totalReviews} reviews)</span>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'agenda', label: `Schedule & Agenda (${event.agenda?.length || 0})` },
              { id: 'venue', label: 'Location & Access' },
              { id: 'reviews', label: `Reviews (${reviews.length})` }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`pb-3 px-3 text-xs font-bold tracking-wide uppercase transition-all ${
                  activeTab === t.id
                    ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              <div className="prose dark:prose-invert max-w-none whitespace-pre-line">
                {event.description}
              </div>

              {/* Requirements & Prerequisites */}
              {event.requirements && event.requirements.length > 0 && (
                <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Requirements & What to Bring
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {event.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tags:</span>
                  {event.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Agenda */}
          {activeTab === 'agenda' && (
            <div className="space-y-4">
              {event.agenda && event.agenda.length > 0 ? (
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
                  {event.agenda.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline Pin */}
                      <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-950 group-hover:scale-125 transition-transform shadow-md" />
                      <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                          {item.time}
                        </span>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{item.title}</h4>
                        {item.speaker && (
                          <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-0.5">Speaker: {item.speaker}</p>
                        )}
                        {item.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
                  Detailed timetable will be announced closer to the event date.
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Venue */}
          {activeTab === 'venue' && (
            <div className="p-6 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 text-xs shadow-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-500 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{event.venueName}</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{event.address}</p>
                  <p className="text-slate-500 mt-1 uppercase font-semibold tracking-wider">
                    Format: {event.venueType}
                  </p>
                </div>
              </div>

              {event.meetingLink && userRegistration && (
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">
                      Attendee Meeting Link
                    </span>
                    <p className="text-slate-900 dark:text-white font-mono text-xs truncate max-w-sm mt-0.5">
                      {event.meetingLink}
                    </p>
                  </div>
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md"
                  >
                    Join Live <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* If user is registered or attended, show Review Box */}
              {userRegistration && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm"
                >
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                    Share Your Event Feedback
                  </h4>

                  {/* Star Rating Select */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-500 dark:text-amber-400 ml-1">{rating} / 5</span>
                  </div>

                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your feedback, what you learned, or comments for the organizers..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    required
                  />

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/20"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Review
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length > 0 ? (
                  reviews.map((rev, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80'}
                            alt={rev.user?.name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <span className="font-bold text-slate-900 dark:text-white">{rev.user?.name}</span>
                          <span className="text-slate-500 dark:text-slate-400">• {rev.user?.organization || 'Student'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{rev.feedback?.rating} / 5</span>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                        "{rev.feedback?.comment}"
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                    No reviews yet. Attend and be the first to leave a verified rating!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Booking & Registration Sticky Card with 3D Tilt */}
        <div className="lg:col-span-1 sticky top-24">
          <Tilt3D maxTilt={6} glare={true} className="rounded-3xl">
            <div className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/90 shadow-xl dark:shadow-2xl space-y-6">
              {/* Price & Status Header */}
              <div className="flex items-baseline justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Registration Fee
                  </span>
                  <span className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                    {isFree ? 'FREE' : `$${event.price}`}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isFull
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isFull ? 'Sold Out' : 'Open Registration'}
                </span>
              </div>

              {/* Date & Time Highlights */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-brand-500 dark:text-brand-400 flex-shrink-0" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-brand-500 dark:text-brand-400 flex-shrink-0" />
                  <span>
                    {new Date(event.startDate).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}{' '}
                    -{' '}
                    {new Date(event.endDate).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-brand-500 dark:text-brand-400 flex-shrink-0" />
                  <span className="truncate">{event.venueName}</span>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5" /> Registered
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {event.registeredCount || 0} / {event.capacity}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      fillPercentage >= 95
                        ? 'bg-rose-500'
                        : fillPercentage >= 80
                        ? 'bg-amber-500'
                        : 'bg-brand-500'
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>

              {/* Registration Action Buttons */}
              {userRegistration ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <span>You are confirmed for this event!</span>
                  </div>
                  <button
                    onClick={() => setShowTicketModal(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" /> View My Digital Pass
                  </button>
                </div>
              ) : isFull ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs">
                    This event has reached full capacity. Join the waitlist to be notified when a spot opens.
                  </div>
                  {isWaitlisted ? (
                    <button
                      onClick={handleLeaveWaitlist}
                      className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs transition-all"
                    >
                      Leave Waitlist
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinWaitlist}
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" /> Join Waitlist
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleRegisterClick}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider uppercase shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {isFree ? (
                      <>
                        <Ticket className="w-4 h-4" /> Claim Free Pass
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" /> Book Ticket (${event.price})
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Certificate Guarantee Box */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
                <Award className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                <span>Includes Official Verifiable Completion Certificate upon check-in</span>
              </div>
            </div>
          </Tilt3D>
        </div>
      </div>

      {/* Checkout Payment Simulation Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Checkout Ticket</h3>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Event:</span>
                <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[200px]">{event.title}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Total Due:</span>
                <span className="text-brand-600 dark:text-brand-300 font-bold font-mono text-sm">${event.price} USD</span>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="space-y-3 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Select Payment Method
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  💳 Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ⚡ Instant UPI / QR
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Card Number (Mock Demo)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">UPI Virtual ID</label>
                  <input
                    type="text"
                    defaultValue="student@campusupi"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}
            </div>

            <button
              onClick={() =>
                executeRegistration(paymentMethod, `TXN-${paymentMethod.toUpperCase()}-${Date.now()}`)
              }
              disabled={submittingReg}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-500/25 transition-all"
            >
              {submittingReg ? 'Processing Transaction...' : `Pay $${event.price} & Generate Ticket`}
            </button>
          </div>
        </div>
      )}

      {/* QR Ticket Pass Modal */}
      {showTicketModal && userRegistration && (
        <QRTicketModal
          registration={userRegistration}
          onClose={() => setShowTicketModal(false)}
        />
      )}
    </div>
  );
};
