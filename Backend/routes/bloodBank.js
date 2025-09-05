const express = require('express');
const BloodBank = require('../models/bloodBank');

const router = express.Router();

// Get all blood banks
router.get('/', async (req, res) => {
  try {
    const { city, state, bloodType } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (state) filter['address.state'] = { $regex: state, $options: 'i' };
    
    let bloodBanks = await BloodBank.find(filter);
    
    // If bloodType is specified, filter banks that have that blood type in inventory
    if (bloodType) {
      bloodBanks = bloodBanks.filter(bank => bank.inventory[bloodType] > 0);
    }
    
    res.status(200).json({
      success: true,
      count: bloodBanks.length,
      data: bloodBanks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get a single blood bank
router.get('/:id', async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id);
    
    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: bloodBank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;