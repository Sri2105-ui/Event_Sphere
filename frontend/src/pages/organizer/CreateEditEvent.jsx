import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Image,
  Award,
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  Upload
} from 'lucide-react';

export const CreateEditEvent = ({ editEvent, setTab }) => {
  const { addToast } = useToast();
  const isEditing = !!editEvent;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState(editEvent?.title || '');
  const [shortDescription, setShortDescription] = useState(editEvent?.shortDescription || '');
  const [description, setDescription] = useState(editEvent?.description || '');
  const [category, setCategory] = useState(editEvent?.category?._id || editEvent?.category || '');
  const [eventType, setEventType] = useState(editEvent?.eventType || 'workshop');
  const [venueType, setVenueType] = useState(editEvent?.venueType || 'in-person');
  const [venueName, setVenueName] = useState(editEvent?.venueName || 'Campus Main Hall');
  const [address, setAddress] = useState(editEvent?.address || 'Engineering Block');
  const [meetingLink, setMeetingLink] = useState(editEvent?.meetingLink || '');

  // Dates
  const [startDate, setStartDate] = useState(
    editEvent?.startDate ? new Date(editEvent.startDate).toISOString().slice(0, 16) : ''
  );
  const [endDate, setEndDate] = useState(
    editEvent?.endDate ? new Date(editEvent.endDate).toISOString().slice(0, 16) : ''
  );

  // Pricing & Limits
  const [capacity, setCapacity] = useState(editEvent?.capacity || 100);
  const [price, setPrice] = useState(editEvent?.price || 0);
  const [bannerImage, setBannerImage] = useState(
    editEvent?.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
  );
  const [bannerFile, setBannerFile] = useState(null);

  // Agenda list
  const [agenda, setAgenda] = useState(
    editEvent?.agenda || [
      { time: '10:00 AM', title: 'Opening Keynote', speaker: 'Faculty Lead', description: 'Welcome session' }
    ]
  );

  // Certificate template config
  const [certTitle, setCertTitle] = useState(
    editEvent?.certificateTemplate?.title || 'Certificate of Achievement & Participation'
  );
  const [issuerName, setIssuerName] = useState(
    editEvent?.certificateTemplate?.issuerName || 'Dean of Student Activities'
  );
  const [issuerRole, setIssuerRole] = useState(
    editEvent?.certificateTemplate?.issuerRole || 'Chief Coordinator'
  );

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
          if (!category && res.data.categories.length > 0) {
            setCategory(res.data.categories[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const addAgendaItem = () => {
    setAgenda([
      ...agenda,
      { time: '12:00 PM', title: 'New Session', speaker: '', description: '' }
    ]);
  };

  const updateAgendaItem = (index, field, value) => {
    const updated = [...agenda];
    updated[index][field] = value;
    setAgenda(updated);
  };

  const removeAgendaItem = (index) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !shortDescription || !startDate || !endDate) {
      addToast('Please fill all required fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        shortDescription,
        description,
        category,
        eventType,
        venueType,
        venueName,
        address,
        meetingLink,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        capacity: Number(capacity),
        price: Number(price),
        bannerImage,
        agenda,
        certificateTemplate: {
          title: certTitle,
          issuerName,
          issuerRole,
          templateStyle: 'gold'
        }
      };

      if (isEditing) {
        const res = await api.put(`/events/${editEvent._id}`, payload);
        if (res.data.success) {
          addToast('Event updated successfully!', 'success');
          setTab('organizer-dashboard');
        }
      } else {
        const res = await api.post('/events', payload);
        if (res.data.success) {
          addToast(res.data.message || 'Event created successfully!', 'success');
          setTab('organizer-dashboard');
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const bannerPresets = [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80', // Hackathon
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80', // Tech Workshop
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80', // Cultural Gala
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', // Coding arena
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80'  // Seminar
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => setTab('organizer-dashboard')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="font-display font-extrabold text-3xl text-white">
            {isEditing ? 'Edit Event Details' : 'Create New Event'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure event format, schedule, ticketing, and verifiable certificate presets.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Info */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2">
            1. Event Identity & Type
          </h3>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold uppercase tracking-wider block">
              Event Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Campus Spring Hackathon 2026"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 capitalize"
              >
                {['hackathon', 'workshop', 'seminar', 'cultural', 'competition', 'conference'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold uppercase tracking-wider block">
              Short Pitch / Summary * (Max 300 chars)
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A one or two-sentence hook displayed on event cards"
              required
              maxLength={300}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold uppercase tracking-wider block">
              Full Description & Highlights
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description, prize tracks, guest speakers, what to bring, etc."
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500 font-sans"
            />
          </div>
        </div>

        {/* Section 2: Date, Time & Venue */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2">
            2. Date, Time & Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">Format</label>
              <select
                value={venueType}
                onChange={(e) => setVenueType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 uppercase"
              >
                <option value="in-person">In-Person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">Venue Name</label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g. Science Auditorium Hall B"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Campus North Quad, Floor 2"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">
                Online Link (for online/hybrid attendees)
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Capacity & Pricing */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2">
            3. Ticketing & Capacity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">
                Total Capacity (Seats) *
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                min={1}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">
                Ticket Price in USD (0 = Free) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={0}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          {/* Banner selection */}
          <div className="space-y-2 pt-2">
            <label className="text-slate-300 font-semibold uppercase tracking-wider block">
              Event Banner Image URL
            </label>
            <input
              type="text"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono text-xs"
            />
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] text-slate-500">Curated Presets:</span>
              {bannerPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setBannerImage(preset)}
                  className="w-10 h-6 rounded border border-slate-700 overflow-hidden hover:scale-110 transition-transform"
                >
                  <img src={preset} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Agenda Timeline Builder */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              4. Event Schedule & Agenda Timeline
            </h3>
            <button
              type="button"
              onClick={addAgendaItem}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Session
            </button>
          </div>

          <div className="space-y-3">
            {agenda.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3"
              >
                <div className="w-28 flex-shrink-0">
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => updateAgendaItem(idx, 'time', e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateAgendaItem(idx, 'title', e.target.value)}
                      placeholder="Session Title"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold"
                    />
                    <input
                      type="text"
                      value={item.speaker}
                      onChange={(e) => updateAgendaItem(idx, 'speaker', e.target.value)}
                      placeholder="Speaker / Host"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAgendaItem(idx)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Certificate Customizer */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            5. Verifiable Certificate Template
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">Certificate Title</label>
              <input
                type="text"
                value={certTitle}
                onChange={(e) => setCertTitle(e.target.value)}
                placeholder="Certificate of Achievement"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">Signatory Name</label>
              <input
                type="text"
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                placeholder="Dr. Evelyn Reed"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider block">Signatory Title</label>
              <input
                type="text"
                value={issuerRole}
                onChange={(e) => setIssuerRole(e.target.value)}
                placeholder="Dean of Student Affairs"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setTab('organizer-dashboard')}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : isEditing ? 'Update Event' : 'Publish / Submit Event'}
          </button>
        </div>
      </form>
    </div>
  );
};
