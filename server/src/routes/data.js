const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.get('/weather/:lat/:lng', dataController.getWeather);
router.get('/places/search', dataController.searchPlaces);
router.get('/places/nearby', dataController.getNearbyAttractions);
router.get('/events/:lat/:lng', dataController.getEvents);

module.exports = router;
