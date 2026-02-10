const weatherService = require('../services/weatherService');
const placesService = require('../services/placesService');
const eventsService = require('../services/eventsService');

exports.getWeather = async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const weather = await weatherService.getWeather(parseFloat(lat), parseFloat(lng));
    res.json(weather);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch weather', error: error.message });
  }
};

exports.searchPlaces = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Query parameter required' });
    }
    const places = await placesService.searchPlaces(q);
    res.json({ places });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search places', error: error.message });
  }
};

exports.getNearbyAttractions = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const attractions = await placesService.getNearbyAttractions(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius) || 5000
    );
    res.json({ attractions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attractions', error: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { destination, interests } = req.query;
    const interestsArray = interests ? interests.split(',') : [];
    const events = await eventsService.getEvents(parseFloat(lat), parseFloat(lng), destination, interestsArray);
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};
