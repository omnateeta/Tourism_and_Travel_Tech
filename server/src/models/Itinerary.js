const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
  },
  duration: { type: Number, required: true },
  cost: { type: Number, required: true },
  sustainabilityScore: { type: Number, required: true, min: 0, max: 100 },
  crowdLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  isHiddenGem: { type: Boolean, default: false },
  images: [{ type: String }],
  openingHours: { type: String },
  rating: { type: Number, min: 0, max: 5 }
});

const dayPlanSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: Date, required: true },
  activities: [activitySchema],
  sustainabilityScore: { type: Number, required: true }
});

const itinerarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: {
    name: { type: String, required: true },
    country: { type: String, default: '' },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: [dayPlanSchema],
  totalSustainabilityScore: { type: Number, required: true },
  interests: [{ type: String }],
  budget: { type: String, enum: ['low', 'medium', 'high'], required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
