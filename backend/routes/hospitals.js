const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get hospital dashboard data
router.get('/dashboard', auth, authorize('hospital'), async (req, res) => {
  try {
    const hospital = req.user;
    
    // Get hospital's blood requests
    const requests = await BloodRequest.find({ hospital: hospital._id })
      .populate('acceptedBy', 'name bloodGroup phone location')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get completed donations
    const donations = await Donation.find({ hospital: hospital._id, status: 'completed' })
      .populate('donor', 'name bloodGroup')
      .sort({ completedDate: -1 })
      .limit(10);

    // Calculate stats
    const stats = {
      totalRequests: await BloodRequest.countDocuments({ hospital: hospital._id }),
      activeRequests: await BloodRequest.countDocuments({ 
        hospital: hospital._id, 
        status: { $in: ['pending', 'accepted', 'in_progress'] }
      }),
      completedRequests: await BloodRequest.countDocuments({ 
        hospital: hospital._id, 
        status: 'completed' 
      }),
      totalDonations: await Donation.countDocuments({ 
        hospital: hospital._id, 
        status: 'completed' 
      }),
      pendingRequests: await BloodRequest.countDocuments({ 
        hospital: hospital._id, 
        status: 'pending' 
      })
    };

    res.json({
      hospital,
      stats,
      recentRequests: requests,
      recentDonations: donations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create blood request
router.post('/requests', auth, authorize('hospital'), [
  body('bloodGroup').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('urgency').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid urgency level'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location is required'),
  body('patientName').trim().isLength({ min: 2 }).withMessage('Patient name is required'),
  body('patientAge').isInt({ min: 0, max: 120 }).withMessage('Invalid patient age'),
  body('patientGender').isIn(['male', 'female', 'other']).withMessage('Invalid patient gender'),
  body('reason').trim().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters'),
  body('contactPerson').trim().isLength({ min: 2 }).withMessage('Contact person is required'),
  body('contactPhone').isMobilePhone().withMessage('Valid phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      bloodGroup,
      quantity,
      urgency,
      location,
      patientName,
      patientAge,
      patientGender,
      reason,
      contactPerson,
      contactPhone
    } = req.body;

    const hospital = req.user;

    // Create blood request
    const bloodRequest = new BloodRequest({
      hospital: hospital._id,
      hospitalName: hospital.name,
      bloodGroup,
      quantity,
      urgency,
      location,
      patientName,
      patientAge,
      patientGender,
      reason,
      contactPerson,
      contactPhone
    });

    // Calculate urgency score
    bloodRequest.calculateUrgencyScore();

    // Find matching donors
    await bloodRequest.findMatchingDonors();

    await bloodRequest.save();

    // Notify matching donors (mock implementation)
    await bloodRequest.notifyMatchingDonors();

    res.status(201).json({
      message: 'Blood request created successfully',
      bloodRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hospital's blood requests
router.get('/requests', auth, authorize('hospital'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = { hospital: req.user._id };
    if (status) {
      query.status = status;
    }

    const requests = await BloodRequest.find(query)
      .populate('acceptedBy', 'name bloodGroup phone location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BloodRequest.countDocuments(query);

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

// Get matching donors for a blood request
router.get('/requests/:requestId/donors', auth, authorize('hospital'), async (req, res) => {
  try {
    const requestId = req.params.requestId;
    
    const bloodRequest = await BloodRequest.findById(requestId)
      .populate('hospital', 'name location');

    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Check if this request belongs to the hospital
    if (bloodRequest.hospital._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find matching donors
    const matchingDonors = await bloodRequest.findMatchingDonors();

    res.json({
      bloodRequest,
      matchingDonors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update blood request status
router.put('/requests/:requestId/status', auth, authorize('hospital'), [
  body('status').isIn(['completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;
    const requestId = req.params.requestId;

    const bloodRequest = await BloodRequest.findById(requestId);

    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Check if this request belongs to the hospital
    if (bloodRequest.hospital.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (status === 'completed') {
      await bloodRequest.complete();
    } else if (status === 'cancelled') {
      await bloodRequest.cancel(notes);
    }

    res.json({
      message: `Blood request ${status} successfully`,
      bloodRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hospital's donations
router.get('/donations', auth, authorize('hospital'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = { hospital: req.user._id };
    if (status) {
      query.status = status;
    }

    const donations = await Donation.find(query)
      .populate('donor', 'name bloodGroup phone location')
      .populate('bloodRequest', 'urgency patientName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Donation.countDocuments(query);

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

// Complete a donation
router.put('/donations/:donationId/complete', auth, authorize('hospital'), [
  body('healthCheck').isObject().withMessage('Health check data is required'),
  body('staffMember').trim().isLength({ min: 2 }).withMessage('Staff member name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { healthCheck, staffMember } = req.body;
    const donationId = req.params.donationId;

    const donation = await Donation.findById(donationId)
      .populate('donor');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if this donation belongs to the hospital
    if (donation.hospital.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Complete the donation
    await donation.complete(healthCheck, staffMember);

    // Update donor's donation record
    await donation.donor.recordDonation();

    // Update blood request status
    await BloodRequest.findByIdAndUpdate(donation.bloodRequest, {
      status: 'completed',
      completedAt: new Date()
    });

    res.json({
      message: 'Donation completed successfully',
      donation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hospital statistics
router.get('/stats', auth, authorize('hospital'), async (req, res) => {
  try {
    const hospital = req.user;
    
    // Get blood group demand statistics
    const bloodGroupStats = await BloodRequest.aggregate([
      { $match: { hospital: hospital._id } },
      {
        $group: {
          _id: '$bloodGroup',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get monthly request trends
    const monthlyTrends = await BloodRequest.aggregate([
      { $match: { hospital: hospital._id } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          requests: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Get urgency distribution
    const urgencyStats = await BloodRequest.aggregate([
      { $match: { hospital: hospital._id } },
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      hospital: {
        name: hospital.name,
        location: hospital.location,
        phone: hospital.phone
      },
      bloodGroupStats,
      monthlyTrends,
      urgencyStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
