const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get donor dashboard data
router.get('/dashboard', auth, authorize('donor'), async (req, res) => {
  try {
    const donor = req.user;
    
    // Get donation history
    const donations = await Donation.find({ donor: donor._id })
      .populate('hospital', 'name location')
      .populate('bloodRequest', 'urgency status')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get available blood requests
    const availableRequests = await BloodRequest.find({
      status: 'pending',
      bloodGroup: donor.bloodGroup,
      expiresAt: { $gt: new Date() }
    })
    .populate('hospital', 'name location')
    .sort({ urgencyScore: -1 })
    .limit(20);

    // Calculate stats
    const stats = {
      totalDonations: donor.totalDonations,
      lastDonationDate: donor.lastDonationDate,
      isEligibleToDonate: donor.isEligibleToDonate(),
      points: donor.points,
      badges: donor.badges,
      isAvailable: donor.isAvailable,
      activeRequests: availableRequests.length,
      nearbyHospitals: availableRequests.length
    };

    res.json({
      donor,
      stats,
      recentDonations: donations,
      availableRequests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donor availability
router.put('/availability', auth, authorize('donor'), [
  body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isAvailable } = req.body;
    
    const donor = await User.findByIdAndUpdate(
      req.user.id,
      { isAvailable },
      { new: true }
    ).select('-password');

    res.json(donor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donation history
router.get('/donations', auth, authorize('donor'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const donations = await Donation.find({ donor: req.user.id })
      .populate('hospital', 'name location phone')
      .populate('bloodRequest', 'urgency patientName status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Donation.countDocuments({ donor: req.user.id });

    res.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept blood request
router.post('/requests/:requestId/accept', auth, authorize('donor'), async (req, res) => {
  try {
    const donor = req.user;
    const requestId = req.params.requestId;

    // Check if donor is eligible
    if (!donor.isEligibleToDonate()) {
      return res.status(400).json({ 
        message: 'You are not eligible to donate yet. Please wait 90 days between donations.' 
      });
    }

    // Check if donor is available
    if (!donor.isAvailable) {
      return res.status(400).json({ 
        message: 'You are currently marked as unavailable. Please update your availability status.' 
      });
    }

    // Find and accept the request
    const bloodRequest = await BloodRequest.findById(requestId);
    
    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    if (bloodRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request is no longer available' });
    }

    if (bloodRequest.bloodGroup !== donor.bloodGroup) {
      return res.status(400).json({ message: 'Blood group mismatch' });
    }

    // Accept the request
    await bloodRequest.acceptBy(donor._id);

    // Update donor availability
    donor.isAvailable = false;
    await donor.save();

    // Create donation record
    const donation = new Donation({
      donor: donor._id,
      hospital: bloodRequest.hospital,
      bloodRequest: bloodRequest._id,
      bloodGroup: donor.bloodGroup,
      quantity: bloodRequest.quantity,
      location: bloodRequest.location,
      status: 'scheduled',
      scheduledDate: new Date()
    });

    await donation.save();

    res.json({
      message: 'Blood request accepted successfully',
      bloodRequest,
      donation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available blood requests
router.get('/requests', auth, authorize('donor'), async (req, res) => {
  try {
    const donor = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get compatible blood requests
    const compatibleBloodGroups = getCompatibleBloodGroups(donor.bloodGroup);
    
    const requests = await BloodRequest.find({
      status: 'pending',
      bloodGroup: { $in: compatibleBloodGroups },
      expiresAt: { $gt: new Date() }
    })
    .populate('hospital', 'name location phone')
    .sort({ urgencyScore: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await BloodRequest.countDocuments({
      status: 'pending',
      bloodGroup: { $in: compatibleBloodGroups },
      expiresAt: { $gt: new Date() }
    });

    res.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donor statistics
router.get('/stats', auth, authorize('donor'), async (req, res) => {
  try {
    const donor = req.user;
    
    // Get donation statistics
    const donationStats = await Donation.aggregate([
      { $match: { donor: donor._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: '$quantity' },
          averageQuantity: { $avg: '$quantity' },
          lastDonation: { $max: '$completedDate' }
        }
      }
    ]);

    // Get monthly donation trends
    const monthlyTrends = await Donation.aggregate([
      { $match: { donor: donor._id, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$completedDate' },
            month: { $month: '$completedDate' }
          },
          count: { $sum: 1 },
          quantity: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      donor: {
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        totalDonations: donor.totalDonations,
        points: donor.points,
        badges: donor.badges,
        isEligibleToDonate: donor.isEligibleToDonate(),
        nextEligibleDate: donor.lastDonationDate ? 
          new Date(donor.lastDonationDate.getTime() + 90 * 24 * 60 * 60 * 1000) : 
          new Date()
      },
      donationStats: donationStats[0] || { totalDonations: 0, averageQuantity: 0 },
      monthlyTrends
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

module.exports = router;
