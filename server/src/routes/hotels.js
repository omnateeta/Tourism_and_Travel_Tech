const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const auth = require('../middleware/auth');

// Search for hotels
router.get('/', hotelController.getHotels);

// Get hotel details
router.get('/:id', hotelController.getHotelDetails);

// Book a hotel
router.post('/book', auth, hotelController.bookHotel);

// Get user's bookings
router.get('/bookings', auth, hotelController.getUserBookings);

module.exports = router;