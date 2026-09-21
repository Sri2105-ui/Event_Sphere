import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['confirmed', 'waitlisted', 'cancelled'],
      default: 'confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['free', 'paid', 'pending', 'refunded'],
      default: 'free'
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentMethod: {
      type: String,
      default: 'free'
    },
    transactionId: {
      type: String,
      default: ''
    },
    ticketHash: {
      type: String,
      required: true,
      unique: true
    },
    ticketQrData: {
      type: String, // Payload containing verification string or base64 QR code image
      default: ''
    },
    attendanceStatus: {
      type: String,
      enum: ['registered', 'checked_in', 'absent'],
      default: 'registered'
    },
    checkedInAt: {
      type: Date
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      default: ''
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        trim: true
      },
      createdAt: {
        type: Date
      }
    }
  },
  { timestamps: true }
);

registrationSchema.index({ event: 1, user: 1 }, { unique: true });

export const Registration = mongoose.model('Registration', registrationSchema);
