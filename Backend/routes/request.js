
const { protect } = require('../middleware/auth');
const Request = require('../models/Request');
const User = require('../models/user');

const router = express.Router();

// Get all requests
router.get('/', async (req, res) => {
  try {
    const { bloodType, city, urgency, status } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (bloodType) filter.bloodType = bloodType;
    if (city) filter['hospital.city'] = { $regex: city, $options: 'i' };
    if (urgency) filter.urgency = urgency;
    if (status) filter.status = status;
    
    const requests = await Request.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create a new request
router.post('/', protect, async (req, res) => {
  try {
    // Add user to request body
    req.body.createdBy = req.user.id;
    
    const request = await Request.create(req.body);
    
    // Populate createdBy field
    await request.populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get a single request
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('donors.donor', 'firstName lastName bloodType location');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Respond to a request (as a potential donor)
router.post('/:id/respond', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    // Check if user is already a donor for this request
    const existingDonor = request.donors.find(
      donor => donor.donor.toString() === req.user.id
    );
    
    if (existingDonor) {
      return res.status(400).json({
        success: false,
        message: 'You have already responded to this request'
      });
    }
    
    // Add user as a potential donor
    request.donors.push({
      donor: req.user.id,
      status: 'pending'
    });
    
    await request.save();
    
    // Populate the response
    await request.populate('donors.donor', 'firstName lastName bloodType location');
    
    res.status(200).json({
      success: true,
      message: 'Response recorded successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;