const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor is required']
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hospital is required']
  },
  bloodRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
    required: [true, 'Blood request is required']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  donationDate: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  scheduledDate: {
    type: Date,
    required: function() { return this.status === 'scheduled'; }
  },
  completedDate: {
    type: Date,
    default: null
  },
  healthCheck: {
    bloodPressure: String,
    hemoglobin: String,
    weight: Number,
    temperature: Number,
    notes: String
  },
  staffMember: {
    type: String,
    required: [true, 'Staff member is required']
  },
  staffId: String,
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: String,
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    submittedAt: Date
  },
  blockchainHash: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Complete donation
donationSchema.methods.complete = function(healthCheckData, staffMember) {
  this.status = 'completed';
  this.completedDate = new Date();
  this.healthCheck = healthCheckData;
  this.staffMember = staffMember;
  this.certificateIssued = true;
  
  // Generate blockchain hash (mock implementation)
  this.blockchainHash = this.generateBlockchainHash();
  
  return this.save();
};

// Generate mock blockchain hash
donationSchema.methods.generateBlockchainHash = function() {
  const data = `${this.donor}-${this.hospital}-${this.donationDate}-${this.bloodGroup}`;
  return '0x' + require('crypto').createHash('sha256').update(data).digest('hex').substring(0, 64);
};

// Cancel donation
donationSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.notes = reason || '';
  return this.save();
};

donationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Donation', donationSchema);
