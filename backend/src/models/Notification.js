import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['registration', 'event_update', 'approval', 'announcement', 'ticket', 'system'],
      default: 'system'
    },
    link: {
      type: String,
      default: ''
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
