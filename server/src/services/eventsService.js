const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 1800 });

class EventsService {
  async getEvents(lat, lng, radius = 10000) {
    const cacheKey = `events_${lat}_${lng}`;
    const cached = cache.get(cacheKey);
    
    if (cached) return cached;

    try {
      // Using PredictHQ API if key available, otherwise fallback to mock
      const apiKey = process.env.PREDICTHQ_API_KEY;
      
      if (apiKey && apiKey !== 'your-predicthq-api-key') {
        const response = await axios.get('https://api.predicthq.com/v1/events/', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          params: {
            'location.origin': `${lat},${lng}`,
            'location.radius': `${radius}m`,
            limit: 20,
            sort: 'rank'
          }
        });

        const events = response.data.results.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description || '',
          startDate: event.start,
          endDate: event.end,
          venue: event.entities?.[0]?.name || 'Unknown venue',
          category: event.category,
          rank: event.rank
        }));

        cache.set(cacheKey, events);
        return events;
      }
      
      // Fallback: Generate realistic mock events based on location
      return this.generateMockEvents(lat, lng);
    } catch (error) {
      console.error('Events API error:', error.message);
      return this.generateMockEvents(lat, lng);
    }
  }

  generateMockEvents(lat, lng) {
    const categories = ['concerts', 'festivals', 'sports', 'expos', 'performing-arts'];
    const venues = ['City Center', 'Grand Plaza', 'Convention Hall', 'Riverside Park', 'Historic Theater'];
    
    const events = [];
    const now = new Date();
    
    for (let i = 0; i < 5; i++) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 14));
      
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 2 + Math.floor(Math.random() * 4));
      
      events.push({
        id: `mock-event-${i}`,
        title: `${['Music', 'Art', 'Food', 'Cultural', 'Sports'][i]} Festival ${i + 1}`,
        description: 'A wonderful local event showcasing the best of the city.',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        venue: venues[i],
        category: categories[i],
        rank: 50 + Math.floor(Math.random() * 50)
      });
    }
    
    cache.set(`events_${lat}_${lng}`, events);
    return events;
  }
}

module.exports = new EventsService();
