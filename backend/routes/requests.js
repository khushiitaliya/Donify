const express = require('express');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all blood requests (public/filtered)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const bloodGroup = req.query.bloodGroup;
    const location = req.query.location;
    const urgency = req.query.urgency;

    const query = {
      status: 'pending',
      expiresAt: { $gt: new Date() }
    };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (urgency) {
      query.urgency = urgency;
    }

    const requests = await BloodRequest.find(query)
      .populate('hospital', 'name location phone')
      .sort({ urgencyScore: -1, createdAt: -1 })
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

// Get single blood request details
router.get('/:requestId', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.requestId)
      .populate('hospital', 'name location phone email')
      .populate('acceptedBy', 'name bloodGroup phone location');

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blood request statistics (public)
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = {
      total: await BloodRequest.countDocuments({ status: 'pending' }),
      critical: await BloodRequest.countDocuments({ status: 'pending', urgency: 'critical' }),
      high: await BloodRequest.countDocuments({ status: 'pending', urgency: 'high' }),
      medium: await BloodRequest.countDocuments({ status: 'pending', urgency: 'medium' }),
      low: await BloodRequest.countDocuments({ status: 'pending', urgency: 'low' })
    };

    // Blood group distribution
    const bloodGroupStats = await BloodRequest.aggregate([
      { $match: { status: 'pending' } },
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 }
        }
      }
    ]);

    // Location distribution
    const locationStats = await BloodRequest.aggregate([
      { $match: { status: 'pending' } },
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      stats,
      bloodGroupStats,
      locationStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search blood requests
router.post('/search', async (req, res) => {
  try {
    const {
      bloodGroup,
      location,
      urgency,
      maxDistance,
      page = 1,
      limit = 10
    } = req.body;

    const query = {
      status: 'pending',
      expiresAt: { $gt: new Date() }
    };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (urgency) {
      query.urgency = urgency;
    }

    const skip = (page - 1) * limit;

    const requests = await BloodRequest.find(query)
      .populate('hospital', 'name location phone')
      .sort({ urgencyScore: -1, createdAt: -1 })
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

// Get nearby blood requests (for donors)
router.get('/nearby/:donorId', auth, authorize('donor'), async (req, res) => {
  try {
    const donor = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get compatible blood groups
    const compatibleBloodGroups = getCompatibleBloodGroups(donor.bloodGroup);
    
    const requests = await BloodRequest.find({
      status: 'pending',
      bloodGroup: { $in: compatibleBloodGroups },
      location: { $regex: donor.location, $options: 'i' },
      expiresAt: { $gt: new Date() }
    })
    .populate('hospital', 'name location phone')
    .sort({ urgencyScore: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await BloodRequest.countDocuments({
      status: 'pending',
      bloodGroup: { $in: compatibleBloodGroups },
      location: { $regex: donor.location, $options: 'i' },
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
