import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
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
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    title: {
      type: String,
      default: 'Certificate of Achievement'
    },
    recipientName: {
      type: String,
      required: true
    },
    eventName: {
      type: String,
      required: true
    },
    eventDate: {
      type: Date,
      required: true
    },
    issuerName: {
      type: String,
      default: 'EventSphere Academic Council'
    },
    issuerRole: {
      type: String,
      default: 'Head Coordinator'
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['issued', 'revoked'],
      default: 'issued'
    },
    templateStyle: {
      type: String,
      enum: ['gold', 'modern', 'minimal'],
      default: 'gold'
    }
  },
  { timestamps: true }
);

certificateSchema.index({ event: 1, user: 1 }, { unique: true });

export const Certificate = mongoose.model('Certificate', certificateSchema);
