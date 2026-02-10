const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itineraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary',
    required: false
  },
  activityId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['day-before', 'morning-of', 'hour-before', 'custom'],
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying of pending notifications
notificationSchema.index({ status: 1, scheduledTime: 1 });
notificationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
