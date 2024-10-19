const express = require('express');
const { getSeats, reserveSeats, initializeSeats } = require('../controllers/seatController');
const router = express.Router();

// Initialize seats (run this only once)
router.post('/initialize', initializeSeats);

// Get all seats
router.get('/', getSeats);

// Reserve seats
router.post('/reserve-seats', reserveSeats);

module.exports = router;
