const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hospital is required']
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
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  patientAge: {
    type: Number,
    required: [true, 'Patient age is required'],
    min: [0, 'Patient age must be positive']
  },
  patientGender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Patient gender is required']
  },
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required']
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required']
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason for blood request is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Request expires in 24 hours by default
      const expires = new Date();
      expires.setHours(expires.getHours() + 24);
      return expires;
    }
  },
  notes: {
    type: String,
    default: ''
  },
  urgencyScore: {
    type: Number,
    default: 0
  },
  matchedDonors: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number,
      default: 0
    },
    notified: {
      type: Boolean,
      default: false
    },
    responded: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate urgency score based on blood group rarity, quantity, and time
bloodRequestSchema.methods.calculateUrgencyScore = function() {
  let score = 0;
  
  // Blood group rarity scores
  const rarityScores = {
    'O-': 10, 'AB+': 9, 'AB-': 8, 'B-': 7, 'A-': 6,
    'O+': 5, 'B+': 4, 'A+': 3
  };
  
  score += rarityScores[this.bloodGroup] || 0;
  
  // Quantity score (higher quantity = higher urgency)
  score += Math.min(this.quantity * 2, 20);
  
  // Urgency level score
  const urgencyScores = {
    'critical': 30,
    'high': 20,
    'medium': 10,
    'low': 5
  };
  
  score += urgencyScores[this.urgency] || 0;
  
  // Time-based urgency (requests closer to expiration get higher score)
  const hoursUntilExpiry = (this.expiresAt - new Date()) / (1000 * 60 * 60);
  if (hoursUntilExpiry < 6) {
    score += 25;
  } else if (hoursUntilExpiry < 12) {
    score += 15;
  } else if (hoursUntilExpiry < 24) {
    score += 10;
  }
  
  this.urgencyScore = score;
  return score;
};

// Check if request is expired
bloodRequestSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Accept request by donor
bloodRequestSchema.methods.acceptBy = function(donorId) {
  this.status = 'accepted';
  this.acceptedBy = donorId;
  this.acceptedAt = new Date();
  return this.save();
};

// Complete request
bloodRequestSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Cancel request
bloodRequestSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.notes = reason || '';
  return this.save();
};

// Find matching donors for this blood request
bloodRequestSchema.methods.findMatchingDonors = async function() {
  const User = mongoose.model('User');
  
  // Find eligible donors with compatible blood groups
  const compatibleBloodGroups = getCompatibleBloodGroups(this.bloodGroup);
  
  const matchingDonors = await User.find({
    role: 'donor',
    bloodGroup: { $in: compatibleBloodGroups },
    isAvailable: true,
    location: { $regex: this.location, $options: 'i' }
  }).select('name bloodGroup location phone totalDonations lastDonationDate');

  // Calculate matching score for each donor
  const scoredDonors = matchingDonors.map(donor => {
    let score = 0;
    
    // Blood group compatibility score
    if (donor.bloodGroup === this.bloodGroup) score += 50;
    else score += 30;
    
    // Location proximity score (mock implementation)
    if (donor.location === this.location) score += 30;
    else if (donor.location && donor.location.includes(this.location.split(',')[0])) score += 15;
    
    // Donation experience score
    score += Math.min(donor.totalDonations * 2, 20);
    
    // Urgency multiplier
    if (this.urgency === 'critical') score *= 1.5;
    else if (this.urgency === 'high') score *= 1.2;
    
    return {
      donor: donor._id,
      score: Math.min(score, 100)
    };
  });

  // Sort by score and update matchedDonors
  scoredDonors.sort((a, b) => b.score - a.score);
  this.matchedDonors = scoredDonors.slice(0, 10); // Top 10 matches
  
  return this.matchedDonors;
};

// Notify matching donors (mock implementation)
bloodRequestSchema.methods.notifyMatchingDonors = async function() {
  const User = mongoose.model('User');
  
  for (const match of this.matchedDonors) {
    await User.findByIdAndUpdate(match.donor, {
      $push: {
        notifications: {
          type: 'blood_request',
          message: `New blood request for ${this.bloodGroup} blood at ${this.location}`,
          requestId: this._id,
          createdAt: new Date()
        }
      }
    });
  }
  
  return true;
};

bloodRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-expire requests
  if (this.status === 'pending' && this.isExpired()) {
    this.status = 'expired';
  }
  
  if (typeof next === 'function') {
    next();
  }
});

// Helper function to get compatible blood groups
function getCompatibleBloodGroups(bloodGroup) {
  const compatibility = {
    'O+': ['O+'],
    'O-': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-']
  };
  
  return compatibility[bloodGroup] || [bloodGroup];
}

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
