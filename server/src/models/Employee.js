const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Travel Planning', 'Destinations', 'Support', 'Accommodations', 'Transportation', 'Management']
  },
  specialties: [{
    type: String
  }],
  languages: [{
    type: String
  }],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  availability: {
    type: String,
    default: 'Mon-Fri 9AM-5PM'
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  certifications: [{
    name: String,
    issuedBy: String,
    date: Date
  }],
  responseTime: {
    type: String,
    default: 'Under 10 min'
  },
  profileImage: {
    type: String
  },
  bio: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for search optimization
employeeSchema.index({ name: 'text', role: 'text', department: 'text', specialties: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);