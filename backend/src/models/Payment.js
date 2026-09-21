import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration'
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    paymentMethod: {
      type: String,
      default: 'card'
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    gateway: {
      type: String,
      default: 'mock_gateway'
    }
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
