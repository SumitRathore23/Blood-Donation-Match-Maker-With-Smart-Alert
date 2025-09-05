const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  bloodType: {
    type: String,
    required: [true, 'Blood type is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  unitsRequired: {
    type: Number,
    required: [true, 'Units required is needed'],
    min: 1,
    max: 10
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'critical'],
    default: 'normal'
  },
  hospital: {
    name: {
      type: String,
      required: [true, 'Hospital name is required']
    },
    address: {
      type: String,
      required: [true, 'Hospital address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    }
  },
  contact: {
    name: {
      type: String,
      required: [true, 'Contact name is required']
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
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
    }
  },
  requiredDate: {
    type: Date,
    required: [true, 'Required date is needed']
  },
  status: {
    type: String,
    enum: ['open', 'fulfilled', 'expired'],
    default: 'open'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Request must be created by a user']
  },
  donors: [{
    donor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'donated'],
      default: 'pending'
    },
    contactedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
requestSchema.index({ bloodType: 1, 'hospital.city': 1, status: 1 });

module.exports = mongoose.model('Request', requestSchema);




