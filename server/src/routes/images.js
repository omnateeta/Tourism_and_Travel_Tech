const express = require('express');
const router = express.Router();
const unsplashService = require('../services/unsplashService');

// Get destination images
router.get('/destination/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    const { count = 8 } = req.query;
    
    if (!destination) {
      return res.status(400).json({ message: 'Destination is required' });
    }

    const images = await unsplashService.searchPhotos(
      decodeURIComponent(destination),
      parseInt(count)
    );

    res.json({
      destination: decodeURIComponent(destination),
      images,
      count: images.length
    });
  } catch (error) {
    console.error('Error fetching destination images:', error);
    res.status(500).json({ 
      message: 'Failed to fetch images', 
      error: error.message 
    });
  }
});

// Search images with custom query
router.get('/search', async (req, res) => {
  try {
    const { query, count = 8 } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const images = await unsplashService.searchPhotos(
      decodeURIComponent(query),
      parseInt(count)
    );

    res.json({
      query: decodeURIComponent(query),
      images,
      count: images.length
    });
  } catch (error) {
    console.error('Error searching images:', error);
    res.status(500).json({ 
      message: 'Failed to search images', 
      error: error.message 
    });
  }
});

module.exports = router;
