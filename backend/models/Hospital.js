const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  // Reference to User account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  },

  // Hospital Basic Info
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    maxlength: [100, 'Hospital name cannot exceed 100 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },

  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9+()\-\s]{8,20}$/, 'Please enter a valid phone number']
  },

  // Hospital Location
  location: {
    type: String,
    required: [true, 'Location is required']
  },

  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },

  // Hospital Type & Registration
  hospitalType: {
    type: String,
    enum: ['Government', 'Private', 'NGO', 'Medical Institute'],
    default: 'Private'
  },

  registrationNumber: {
    type: String,
    sparse: true,
    unique: true
  },

  licenseNumber: {
    type: String,
    sparse: true
  },

  // Contact Information
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required']
  },

  contactPersonPhone: {
    type: String,
    required: [true, 'Contact person phone is required']
  },

  emergencyContact: {
    type: String,
    required: [true, 'Emergency contact is required']
  },

  emergencyContactPhone: {
    type: String,
    required: [true, 'Emergency contact phone is required']
  },

  // Blood Inventory
  bloodInventory: {
    'A+': {
      type: Number,
      default: 0,
      min: [0, 'Inventory cannot be negative']
    },
    'A-': {
      type: Number,
      default: 0,
      min: [0, 'Inventory cannot be negative']
    },
    'B+': {
      type: Number,
      default: 0,
      min: [0, 'Inventory cannot be negative']
    },
    'B-': {
      type: Number,
      default: 0,
      min: [0, 'Inventory cannot be negative']
    },
    'AB+': {
      type: Number,
      default: 0,
      min: [0, 'Inventory cannot be negative']
    },
    'AB-': {
      type: Number,
      default: 0,
      min: [0, 'Inventory cannot be negative']
    },
    'O+': {
      type: Number,
      default: 0,
      min: [0, 'Inventory cannot be negative']
    },
    'O-': {
      type: Number,
      default: 0,
      min: [0, 'Inventory cannot be negative']
    }
  },

  // Statistics
  stats: {
    totalRequestsCreated: {
      type: Number,
      default: 0
    },
    totalDonationsReceived: {
      type: Number,
      default: 0
    },
    totalDonationsCancelled: {
      type: Number,
      default: 0
    },
    averageFulfillmentTime: {
      type: Number,
      default: 0 // in hours
    },
    lastRequestDate: {
      type: Date,
      default: null
    }
  },

  // Department Information
  departments: [{
    name: String,
    headName: String,
    headPhone: String,
    headEmail: String
  }],

  // Verification & Status
  isVerified: {
    type: Boolean,
    default: false
  },

  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'suspended', 'rejected'],
    default: 'pending'
  },

  verificationDate: {
    type: Date,
    default: null
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Profile Info
  hospitalLogo: {
    type: String,
    default: ''
  },

  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  website: {
    type: String,
    default: ''
  },

  // Services Offered
  servicesOffered: [{
    type: String,
    enum: ['Blood Bank', 'Emergency', 'Surgery', 'ICU', 'Trauma Center', 'Organ Transplant']
  }],

  // Team Members
  teamMembers: [{
    name: String,
    role: String,
    email: String,
    phone: String
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware
hospitalSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Calculate total blood inventory
hospitalSchema.methods.getTotalInventory = function() {
  return Object.values(this.bloodInventory).reduce((sum, qty) => sum + qty, 0);
};

// Check blood availability
hospitalSchema.methods.hasBloodType = function(bloodGroup) {
  return this.bloodInventory[bloodGroup] && this.bloodInventory[bloodGroup] > 0;
};

// Reduce blood inventory
hospitalSchema.methods.reduceBloodInventory = async function(bloodGroup, quantity) {
  if (!this.hasBloodType(bloodGroup) || this.bloodInventory[bloodGroup] < quantity) {
    throw new Error(`Insufficient ${bloodGroup} blood inventory`);
  }
  this.bloodInventory[bloodGroup] -= quantity;
  this.stats.totalDonationsReceived += quantity;
  await this.save();
};

module.exports = mongoose.model('Hospital', hospitalSchema);
