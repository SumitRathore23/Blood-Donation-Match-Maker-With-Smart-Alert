const mongoose = require('mongoose');

const bloodBankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Blood bank name is required'],
    unique: true
  },
  registrationId: {
    type: String,
    required: [true, 'Registration ID is required'],
    unique: true
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      validate: {
        validator: function(v) {
          return /^[1-9][0-9]{5}$/.test(v);
        },
        message: 'Pincode must be 6 digits'
      }
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function(v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: 'Phone number must be 10 digits'
      }
    },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return /^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/.test(v);
        },
        message: 'Please provide a valid email'
      }
    },
    website: {
      type: String
    }
  },
  inventory: {
    'A+': { type: Number, default: 0 },
    'A-': { type: Number, default: 0 },
    'B+': { type: Number, default: 0 },
    'B-': { type: Number, default: 0 },
    'AB+': { type: Number, default: 0 },
    'AB-': { type: Number, default: 0 },
    'O+': { type: Number, default: 0 },
    'O-': { type: Number, default: 0 }
  },
  operatingHours: {
    Monday: { open: String, close: String },
    Tuesday: { open: String, close: String },
    Wednesday: { open: String, close: String },
    Thursday: { open: String, close: String },
    Friday: { open: String, close: String },
    Saturday: { open: String, close: String },
    Sunday: { open: String, close: String }
  },
  services: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for location-based queries
bloodBankSchema.index({ 'address.city': 1, 'address.state': 1 });

module.exports = mongoose.model('BloodBank', bloodBankSchema);