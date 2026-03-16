const express = require('express');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get admin dashboard data
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
  try {
    // Get overall statistics
    const stats = {
      totalDonors: await User.countDocuments({ role: 'donor' }),
      totalHospitals: await User.countDocuments({ role: 'hospital' }),
      activeRequests: await BloodRequest.countDocuments({ 
        status: { $in: ['pending', 'accepted', 'in_progress'] }
      }),
      completedRequests: await BloodRequest.countDocuments({ status: 'completed' }),
      totalDonations: await Donation.countDocuments({ status: 'completed' }),
      availableDonors: await User.countDocuments({ 
        role: 'donor', 
        isAvailable: true 
      })
    };

    // Get recent activity
    const recentRequests = await BloodRequest.find()
      .populate('hospital', 'name')
      .populate('acceptedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentDonations = await Donation.find({ status: 'completed' })
      .populate('donor', 'name bloodGroup')
      .populate('hospital', 'name')
      .sort({ completedDate: -1 })
      .limit(5);

    // Get blood group distribution
    const bloodGroupDistribution = await User.aggregate([
      { $match: { role: 'donor' } },
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get request trends
    const requestTrends = await BloodRequest.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      stats,
      recentRequests,
      recentDonations,
      bloodGroupDistribution,
      requestTrends
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const search = req.query.search;

    const query = {};
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
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

// Get all blood requests
router.get('/requests', auth, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const urgency = req.query.urgency;

    const query = {};
    if (status) {
      query.status = status;
    }

    if (urgency) {
      query.urgency = urgency;
    }

    const requests = await BloodRequest.find(query)
      .populate('hospital', 'name location phone')
      .populate('acceptedBy', 'name bloodGroup phone')
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

// Get all donations
router.get('/donations', auth, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = {};
    if (status) {
      query.status = status;
    }

    const donations = await Donation.find(query)
      .populate('donor', 'name bloodGroup phone')
      .populate('hospital', 'name location')
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

// Get analytics data
router.get('/analytics', auth, authorize('admin'), async (req, res) => {
  try {
    // Blood group demand trends
    const bloodGroupDemand = await BloodRequest.aggregate([
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

    // Donation frequency trends
    const donationFrequency = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$completedDate' },
            month: { $month: '$completedDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Response time analysis
    const responseTimes = await BloodRequest.aggregate([
      { $match: { status: 'completed', acceptedAt: { $exists: true } } },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ['$acceptedAt', '$createdAt'] },
              1000 * 60 // Convert to minutes
            ]
          },
          bloodGroup: 1,
          urgency: 1
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' }
        }
      }
    ]);

    // Hospital performance
    const hospitalPerformance = await BloodRequest.aggregate([
      {
        $group: {
          _id: '$hospital',
          totalRequests: { $sum: 1 },
          completedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'hospitalInfo'
        }
      },
      {
        $project: {
          hospitalName: { $arrayElemAt: ['$hospitalInfo.name', 0] },
          totalRequests: 1,
          completedRequests: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedRequests', '$totalRequests'] },
              100
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    // Donor engagement
    const donorEngagement = await User.aggregate([
      { $match: { role: 'donor' } },
      {
        $group: {
          _id: null,
          totalDonors: { $sum: 1 },
          activeDonors: {
            $sum: { $cond: ['$isAvailable', 1, 0] }
          },
          avgDonations: { $avg: '$totalDonations' },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    res.json({
      bloodGroupDemand,
      donationFrequency,
      responseTimes: responseTimes[0] || {},
      hospitalPerformance,
      donorEngagement: donorEngagement[0] || {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status (admin only)
const { body, validationResult } = require('express-validator');
router.put('/users/:userId/status', auth, authorize('admin'), [
  body('isVerified').isBoolean().withMessage('isVerified must be a boolean'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isVerified, isAvailable } = req.body;
    const userId = req.params.userId;

    const updateData = { isVerified };
    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', auth, authorize('admin'), async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deletion of admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    // Delete related data
    await Donation.deleteMany({ donor: userId });
    await Donation.deleteMany({ hospital: userId });
    await BloodRequest.deleteMany({ hospital: userId });
    await BloodRequest.updateMany(
      { acceptedBy: userId },
      { $unset: { acceptedBy: 1, acceptedAt: 1 } }
    );

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get audit logs
router.get('/audit', auth, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const action = req.query.action;

    // Mock audit logs - in a real application, these would be stored in a separate collection
    const auditLogs = [
      {
        id: 1,
        action: 'USER_REGISTERED',
        user: 'John Doe',
        role: 'donor',
        timestamp: new Date(),
        details: 'New donor registration'
      },
      {
        id: 2,
        action: 'BLOOD_REQUEST_CREATED',
        user: 'City Hospital',
        role: 'hospital',
        timestamp: new Date(Date.now() - 3600000),
        details: 'Emergency blood request for A+'
      }
    ];

    res.json({
      auditLogs: auditLogs.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total: auditLogs.length,
        pages: Math.ceil(auditLogs.length / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
