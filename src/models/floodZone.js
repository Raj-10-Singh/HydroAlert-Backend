const mongoose = require('mongoose');

const floodZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true  // e.g. "Kolkata North Zone"
  },
  zoneId: {
    type: String,
    required: true,
    unique: true   // e.g. "zone_kolkata_north"
  },
  riskLevel: {
    type: String,
    enum: ['safe', 'low', 'medium', 'high', 'critical'],
    default: 'safe'
  },
  waterLevel: {
    type: Number,  // in cm
    default: 0
  },
  rainfall: {
    type: Number,  // in mm
    default: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  polygon: {
    type: [[Number]],  // array of [lng, lat] pairs defining zone boundary
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

floodZoneSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('floodZone', floodZoneSchema);
