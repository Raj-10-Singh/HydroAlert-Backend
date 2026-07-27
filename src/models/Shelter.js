const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true
    }
  },
  capacity: {
    type: Number,
    default: 100
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  contactNumber: {
    type: String
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  facilities: {
    type: [String],  // e.g. ['food', 'medical', 'water']
    default: []
  }
}, { timestamps: true });

shelterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shelter', shelterSchema);