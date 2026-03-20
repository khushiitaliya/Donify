const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Hospital = require('../models/Hospital');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register user
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['donor', 'hospital']).withMessage('Role must be either donor or hospital'),
  body('phone').optional().trim().matches(/^[0-9+()\-\s]{8,20}$/).withMessage('Please provide a valid phone number'),
  body('location').optional().trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group')
], async (req, res) => {
  try {
    console.log('Register endpoint called. Request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone, location, bloodGroup } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate required fields based on role
    if (role === 'donor' && (!location || !bloodGroup)) {
      return res.status(400).json({ message: 'Location and blood group are required for donors' });
    }

    if (role === 'hospital' && !phone) {
      return res.status(400).json({ message: 'Phone number is required for hospitals' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role,
      phone: role === 'hospital' ? phone : undefined,
      location: role === 'donor' ? location : undefined,
      bloodGroup: role === 'donor' ? bloodGroup : undefined
    });

    await user.save();

    // Create Hospital record if role is hospital
    if (role === 'hospital') {
      const hospital = new Hospital({
        userId: user._id,
        name,
        email,
        phone,
        location,
        contactPerson: name, // Default to hospital name
        contactPersonPhone: phone,
        emergencyContact: name,
        emergencyContactPhone: phone,
        description: '',
        hospitalType: 'Private'
      });
      await hospital.save();
      console.log('Hospital record created:', hospital._id);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        location: user.location,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        location: user.location,
        phone: user.phone,
        isVerified: user.isVerified,
        isAvailable: user.isAvailable,
        totalDonations: user.totalDonations,
        points: user.points,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().trim().matches(/^[0-9+()\-\s]{8,20}$/).withMessage('Please provide a valid phone number'),
  body('location').optional().trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, location } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Sync legacy browser localStorage data into MongoDB.
router.post('/sync-local-data', async (req, res) => {
  try {
    const users = Array.isArray(req.body.users) ? req.body.users : [];
    const requests = Array.isArray(req.body.requests) ? req.body.requests : [];

    const stats = {
      usersInserted: 0,
      usersSkipped: 0,
      requestsInserted: 0,
      requestsSkipped: 0
    };

    const roleMap = {
      donor: 'donor',
      Donor: 'donor',
      hospital: 'hospital',
      Hospital: 'hospital',
      admin: 'admin',
      Admin: 'admin'
    };

    for (const u of users) {
      const email = (u.email || '').toLowerCase().trim();
      const role = roleMap[u.role] || null;

      if (!email || !role) {
        stats.usersSkipped += 1;
        continue;
      }

      const exists = await User.findOne({ email });
      if (exists) {
        stats.usersSkipped += 1;
        continue;
      }

      const newUser = new User({
        name: (u.name || u.hospitalName || 'Unknown').trim(),
        email,
        password: String(u.password || 'password123'),
        role,
        phone: role === 'hospital' ? (u.phone || u.contact || '9999999999') : undefined,
        location: role === 'donor' ? (u.location || 'Unknown') : undefined,
        bloodGroup: role === 'donor' ? (u.bloodGroup || 'O+') : undefined
      });

      await newUser.save();
      stats.usersInserted += 1;
    }

    for (const r of requests) {
      const duplicate = await BloodRequest.findOne({
        patientName: r.patientName || 'Unknown Patient',
        bloodGroup: r.bloodGroup,
        quantity: Number(r.quantity || 1),
        createdAt: r.createdAt ? new Date(r.createdAt) : undefined
      });

      if (duplicate) {
        stats.requestsSkipped += 1;
        continue;
      }

      const hospitalEmail = (r.hospitalEmail || '').toLowerCase().trim();
      let hospitalUser = null;

      if (hospitalEmail) {
        hospitalUser = await User.findOne({ email: hospitalEmail, role: 'hospital' });
      }

      if (!hospitalUser && r.hospitalId) {
        hospitalUser = await User.findOne({ _id: r.hospitalId }).catch(() => null);
      }

      if (!hospitalUser) {
        hospitalUser = await User.findOne({ role: 'hospital' });
      }

      if (!hospitalUser) {
        stats.requestsSkipped += 1;
        continue;
      }

      const statusMap = {
        Sent: 'pending',
        Accepted: 'accepted',
        'In Progress': 'in_progress',
        Completed: 'completed',
        Cancelled: 'cancelled',
        Expired: 'expired',
        pending: 'pending',
        accepted: 'accepted',
        in_progress: 'in_progress',
        completed: 'completed',
        cancelled: 'cancelled',
        expired: 'expired'
      };

      const bloodRequest = new BloodRequest({
        hospital: hospitalUser._id,
        hospitalName: r.hospitalName || hospitalUser.name,
        bloodGroup: r.bloodGroup || 'O+',
        quantity: Number(r.quantity || 1),
        urgency: r.urgency || 'medium',
        location: r.location || hospitalUser.location || 'Unknown',
        patientName: r.patientName || 'Unknown Patient',
        patientAge: Number(r.patientAge || 30),
        patientGender: r.patientGender || 'other',
        reason: r.reason || 'Urgent blood requirement',
        contactPerson: r.contactPerson || hospitalUser.name,
        contactPhone: r.contactPhone || hospitalUser.phone || '9999999999',
        status: statusMap[r.status] || 'pending',
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        expiresAt: r.expiresAt ? new Date(r.expiresAt) : undefined
      });

      bloodRequest.calculateUrgencyScore();
      await bloodRequest.save();
      stats.requestsInserted += 1;
    }

    res.json({ message: 'Local data sync completed', stats });
  } catch (error) {
    console.error('sync-local-data error:', error);
    res.status(500).json({ message: 'Failed to sync local data', error: error.message });
  }
});

module.exports = router;
