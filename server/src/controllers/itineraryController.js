const { Itinerary } = require('../models');
const itineraryService = require('../services/itineraryService');

exports.generateItinerary = async (req, res) => {
  try {
    const { destination, interests, budget, duration, startDate, lat, lng } = req.body;

    // Generate itinerary using AI service
    const itineraryData = await itineraryService.generateItinerary({
      destination,
      interests,
      budget,
      duration,
      startDate,
      lat,
      lng
    });

    // Save to database
    const itinerary = new Itinerary({
      userId: req.user._id,
      ...itineraryData
    });

    await itinerary.save();

    res.status(201).json({
      message: 'Itinerary generated successfully',
      itinerary
    });
  } catch (error) {
    console.error('Generate itinerary error:', error);
    res.status(500).json({ message: 'Failed to generate itinerary', error: error.message });
  }
};

exports.getItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ itineraries });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch itineraries', error: error.message });
  }
};

exports.getItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json({ itinerary });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch itinerary', error: error.message });
  }
};

exports.deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete itinerary', error: error.message });
  }
};
