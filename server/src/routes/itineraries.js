const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const auth = require('../middleware/auth');

router.post('/generate', auth, itineraryController.generateItinerary);
router.get('/', auth, itineraryController.getItineraries);
router.get('/:id', auth, itineraryController.getItinerary);
router.delete('/:id', auth, itineraryController.deleteItinerary);

module.exports = router;
