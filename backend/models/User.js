const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['donor', 'hospital', 'admin'],
    required: [true, 'Role is required']
  },
  phone: {
    type: String,
    required: function() { return this.role === 'hospital'; }
  },
  location: {
    type: String,
    required: function() { return this.role === 'donor'; }
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function() { return this.role === 'donor'; }
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Life Saver']
  }],
  profileImage: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before save so login via bcrypt compare works.
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last donation date and increment total donations
userSchema.methods.recordDonation = function() {
  this.lastDonationDate = new Date();
  this.totalDonations += 1;
  this.points += 10;
  
  // Award badges based on total donations
  if (this.totalDonations >= 1 && !this.badges.includes('Bronze')) {
    this.badges.push('Bronze');
  }
  if (this.totalDonations >= 5 && !this.badges.includes('Silver')) {
    this.badges.push('Silver');
  }
  if (this.totalDonations >= 10 && !this.badges.includes('Gold')) {
    this.badges.push('Gold');
  }
  if (this.totalDonations >= 25 && !this.badges.includes('Life Saver')) {
    this.badges.push('Life Saver');
  }
  
  return this.save();
};

// Check if donor is eligible to donate (90 days between donations)
userSchema.methods.isEligibleToDonate = function() {
  if (this.role !== 'donor') return false;
  if (!this.lastDonationDate) return true;
  
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  return this.lastDonationDate < ninetyDaysAgo;
};

module.exports = mongoose.model('User', userSchema);
