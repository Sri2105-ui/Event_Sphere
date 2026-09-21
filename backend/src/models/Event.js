import mongoose from 'mongoose';

const agendaItemSchema = new mongoose.Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  speaker: { type: String, default: '' },
  description: { type: String, default: '' }
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: 300
    },
    description: {
      type: String,
      required: [true, 'Full event description is required']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required']
    },
    eventType: {
      type: String,
      enum: ['hackathon', 'workshop', 'seminar', 'cultural', 'competition', 'conference'],
      default: 'workshop'
    },
    venueType: {
      type: String,
      enum: ['in-person', 'online', 'hybrid'],
      default: 'in-person'
    },
    venueName: {
      type: String,
      default: 'Campus Main Auditorium'
    },
    address: {
      type: String,
      default: 'Engineering Block, University Campus'
    },
    meetingLink: {
      type: String,
      default: ''
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    registrationDeadline: {
      type: Date
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    registeredCount: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'published', 'rejected', 'completed', 'cancelled'],
      default: 'published'
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    featured: {
      type: Boolean,
      default: false
    },
    waitlistEnabled: {
      type: Boolean,
      default: true
    },
    waitlist: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    agenda: [agendaItemSchema],
    requirements: [
      {
        type: String
      }
    ],
    certificateTemplate: {
      title: {
        type: String,
        default: 'Certificate of Achievement & Participation'
      },
      issuerName: {
        type: String,
        default: 'Dean of Student Affairs'
      },
      issuerRole: {
        type: String,
        default: 'Chief Coordinator'
      },
      signatureUrl: {
        type: String,
        default: ''
      },
      templateStyle: {
        type: String,
        enum: ['gold', 'modern', 'minimal'],
        default: 'gold'
      }
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function () {
  return this.registeredCount >= this.capacity;
});

export const Event = mongoose.model('Event', eventSchema);
