const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 1800 });

// Interest to event category mapping
const interestToCategory = {
  'culture': ['arts', 'performing-arts', 'festivals', 'cultural'],
  'food': ['food', 'food-and-drink', 'culinary', 'dining'],
  'nature': ['outdoor', 'nature', 'parks', 'environment'],
  'adventure': ['sports', 'outdoor', 'adventure', 'recreation'],
  'shopping': ['expos', 'shopping', 'markets', 'retail'],
  'nightlife': ['concerts', 'music', 'nightlife', 'entertainment'],
  'history': ['expos', 'arts', 'historical', 'museum'],
  'art': ['arts', 'performing-arts', 'exhibitions', 'gallery']
};

// Real event categories and venues for different cities
const cityEventsDB = {
  'barcelona': [
    { title: 'Sagrada Familia Light Show', venue: 'Sagrada Familia', category: 'arts', interests: ['culture', 'art', 'history'] },
    { title: 'FC Barcelona Match', venue: 'Camp Nou', category: 'sports', interests: ['adventure', 'culture'] },
    { title: 'Flamenco Dance Performance', venue: 'Palau de la Música', category: 'performing-arts', interests: ['culture', 'art', 'nightlife'] },
    { title: 'La Mercè Festival', venue: 'Plaça de Catalunya', category: 'festivals', interests: ['culture', 'nightlife', 'food'] },
    { title: 'Barcelona Jazz Festival', venue: 'L\'Auditori', category: 'concerts', interests: ['nightlife', 'art', 'culture'] },
    { title: 'Gothic Quarter Food Tour', venue: 'Gothic Quarter', category: 'food', interests: ['food', 'culture', 'history'] },
    { title: 'Park Güell Nature Walk', venue: 'Park Güell', category: 'nature', interests: ['nature', 'art', 'culture'] },
    { title: 'La Boqueria Market Tour', venue: 'La Boqueria', category: 'shopping', interests: ['shopping', 'food', 'culture'] }
  ],
  'paris': [
    { title: 'Eiffel Tower Light Show', venue: 'Eiffel Tower', category: 'arts', interests: ['culture', 'art', 'nightlife'] },
    { title: 'Louvre Night Tour', venue: 'Louvre Museum', category: 'expos', interests: ['art', 'history', 'culture'] },
    { title: 'Seine River Cruise Dinner', venue: 'Seine River', category: 'food', interests: ['food', 'nightlife', 'culture'] },
    { title: 'Paris Fashion Week', venue: 'Grand Palais', category: 'expos', interests: ['shopping', 'art', 'culture'] },
    { title: 'Montmartre Art Walk', venue: 'Montmartre', category: 'arts', interests: ['art', 'culture', 'history'] },
    { title: 'French Cooking Class', venue: 'Le Cordon Bleu', category: 'food', interests: ['food', 'culture'] },
    { title: 'Versailles Gardens Tour', venue: 'Palace of Versailles', category: 'nature', interests: ['nature', 'history', 'culture'] },
    { title: 'Champs-Élysées Shopping', venue: 'Champs-Élysées', category: 'shopping', interests: ['shopping', 'culture'] }
  ],
  'rome': [
    { title: 'Vatican Museums Night Opening', venue: 'Vatican Museums', category: 'expos', interests: ['history', 'art', 'culture'] },
    { title: 'Opera at Teatro dell\'Opera', venue: 'Teatro dell\'Opera', category: 'performing-arts', interests: ['culture', 'art', 'nightlife'] },
    { title: 'Rome Food Festival', venue: 'Piazza Navona', category: 'food', interests: ['food', 'culture'] },
    { title: 'Colosseum Concert', venue: 'Colosseum', category: 'concerts', interests: ['nightlife', 'history', 'culture'] },
    { title: 'Estate Romana Festival', venue: 'Various Locations', category: 'festivals', interests: ['culture', 'nightlife', 'art'] },
    { title: 'Pasta Making Workshop', venue: 'Trastevere', category: 'food', interests: ['food', 'culture'] },
    { title: 'Villa Borghese Gardens', venue: 'Villa Borghese', category: 'nature', interests: ['nature', 'art', 'history'] },
    { title: 'Ancient Rome Walking Tour', venue: 'Roman Forum', category: 'history', interests: ['history', 'culture', 'adventure'] }
  ],
  'london': [
    { title: 'West End Musical', venue: 'Theatre Royal', category: 'performing-arts', interests: ['nightlife', 'art', 'culture'] },
    { title: 'Premier League Match', venue: 'Wembley Stadium', category: 'sports', interests: ['adventure', 'culture'] },
    { title: 'British Museum Exhibition', venue: 'British Museum', category: 'expos', interests: ['history', 'art', 'culture'] },
    { title: 'Notting Hill Carnival', venue: 'Notting Hill', category: 'festivals', interests: ['culture', 'nightlife', 'food'] },
    { title: 'Thames Festival', venue: 'South Bank', category: 'festivals', interests: ['culture', 'nightlife', 'food'] },
    { title: 'Borough Market Food Tour', venue: 'Borough Market', category: 'food', interests: ['food', 'shopping', 'culture'] },
    { title: 'Hyde Park Nature Walk', venue: 'Hyde Park', category: 'nature', interests: ['nature', 'adventure'] },
    { title: 'Oxford Street Shopping', venue: 'Oxford Street', category: 'shopping', interests: ['shopping', 'culture'] }
  ],
  'tokyo': [
    { title: 'Cherry Blossom Festival', venue: 'Ueno Park', category: 'festivals', interests: ['nature', 'culture', 'art'] },
    { title: 'Sumo Wrestling Tournament', venue: 'Ryōgoku Kokugikan', category: 'sports', interests: ['culture', 'adventure'] },
    { title: 'Tokyo Game Show', venue: 'Makuhari Messe', category: 'expos', interests: ['shopping', 'culture', 'nightlife'] },
    { title: 'Kabuki Theater Performance', venue: 'Kabuki-za', category: 'performing-arts', interests: ['culture', 'art', 'history'] },
    { title: 'Shibuya Music Festival', venue: 'Shibuya Crossing', category: 'concerts', interests: ['nightlife', 'culture', 'adventure'] },
    { title: 'Sushi Making Class', venue: 'Tsukiji', category: 'food', interests: ['food', 'culture'] },
    { title: 'Meiji Shrine Visit', venue: 'Meiji Shrine', category: 'nature', interests: ['nature', 'culture', 'history'] },
    { title: 'Akihabara Electronics Shopping', venue: 'Akihabara', category: 'shopping', interests: ['shopping', 'culture'] }
  ],
  'new york': [
    { title: 'Broadway Show', venue: 'Times Square', category: 'performing-arts', interests: ['nightlife', 'art', 'culture'] },
    { title: 'NBA Game', venue: 'Madison Square Garden', category: 'sports', interests: ['adventure', 'culture'] },
    { title: 'Met Gala Exhibition', venue: 'Metropolitan Museum', category: 'expos', interests: ['art', 'fashion', 'culture'] },
    { title: 'New York Film Festival', venue: 'Lincoln Center', category: 'festivals', interests: ['art', 'culture', 'nightlife'] },
    { title: 'Central Park Concert', venue: 'Central Park', category: 'concerts', interests: ['nightlife', 'nature', 'culture'] },
    { title: 'Chelsea Food Tour', venue: 'Chelsea Market', category: 'food', interests: ['food', 'shopping', 'culture'] },
    { title: 'High Line Park Walk', venue: 'High Line', category: 'nature', interests: ['nature', 'art', 'adventure'] },
    { title: 'Fifth Avenue Shopping', venue: 'Fifth Avenue', category: 'shopping', interests: ['shopping', 'culture'] }
  ],
  'dubai': [
    { title: 'Dubai Shopping Festival', venue: 'Dubai Mall', category: 'shopping', interests: ['shopping', 'culture', 'nightlife'] },
    { title: 'Desert Safari Adventure', venue: 'Dubai Desert', category: 'adventure', interests: ['adventure', 'nature', 'culture'] },
    { title: 'Burj Khalifa Light Show', venue: 'Burj Khalifa', category: 'arts', interests: ['art', 'culture', 'nightlife'] },
    { title: 'Dubai Food Festival', venue: 'Global Village', category: 'food', interests: ['food', 'culture'] },
    { title: 'Camel Racing Championship', venue: 'Al Marmoom', category: 'sports', interests: ['adventure', 'culture'] },
    { title: 'Traditional Dhow Cruise', venue: 'Dubai Creek', category: 'nightlife', interests: ['nightlife', 'culture', 'food'] },
    { title: 'Miracle Garden Visit', venue: 'Dubai Miracle Garden', category: 'nature', interests: ['nature', 'art'] },
    { title: 'Gold Souk Shopping Tour', venue: 'Deira Gold Souk', category: 'shopping', interests: ['shopping', 'history', 'culture'] }
  ],
  'sydney': [
    { title: 'Sydney Opera House Concert', venue: 'Sydney Opera House', category: 'performing-arts', interests: ['art', 'culture', 'nightlife'] },
    { title: 'Vivid Sydney Festival', venue: 'Circular Quay', category: 'festivals', interests: ['art', 'nightlife', 'culture'] },
    { title: 'Bondi Beach Surf Competition', venue: 'Bondi Beach', category: 'sports', interests: ['adventure', 'nature'] },
    { title: 'Royal Botanic Gardens Tour', venue: 'Royal Botanic Garden', category: 'nature', interests: ['nature', 'culture'] },
    { title: 'The Rocks Food Festival', venue: 'The Rocks', category: 'food', interests: ['food', 'culture', 'history'] },
    { title: 'Harbour Bridge Climb', venue: 'Sydney Harbour Bridge', category: 'adventure', interests: ['adventure', 'nature'] },
    { title: 'Queen Victoria Building Shopping', venue: 'QVB', category: 'shopping', interests: ['shopping', 'history', 'culture'] },
    { title: 'Australian Museum Exhibition', venue: 'Australian Museum', category: 'expos', interests: ['history', 'culture', 'art'] }
  ],
  'singapore': [
    { title: 'Singapore Food Festival', venue: 'Marina Bay', category: 'food', interests: ['food', 'culture'] },
    { title: 'Gardens by the Bay Light Show', venue: 'Gardens by the Bay', category: 'arts', interests: ['art', 'nature', 'nightlife'] },
    { title: 'Singapore Grand Prix', venue: 'Marina Bay Street Circuit', category: 'sports', interests: ['adventure', 'nightlife'] },
    { title: 'Orchard Road Shopping', venue: 'Orchard Road', category: 'shopping', interests: ['shopping', 'culture'] },
    { title: 'Night Safari Experience', venue: 'Singapore Zoo', category: 'nature', interests: ['nature', 'adventure'] },
    { title: 'Chinatown Heritage Walk', venue: 'Chinatown', category: 'history', interests: ['history', 'culture', 'food'] },
    { title: 'Marina Bay Sands SkyPark', venue: 'Marina Bay Sands', category: 'adventure', interests: ['adventure', 'nightlife'] },
    { title: 'Esplanade Concert', venue: 'Esplanade', category: 'performing-arts', interests: ['art', 'culture', 'nightlife'] }
  ],
  'bangkok': [
    { title: 'Loy Krathong Festival', venue: 'Chao Phraya River', category: 'festivals', interests: ['culture', 'nightlife', 'nature'] },
    { title: 'Muay Thai Boxing Match', venue: 'Lumpinee Stadium', category: 'sports', interests: ['adventure', 'culture'] },
    { title: 'Grand Palace Tour', venue: 'Grand Palace', category: 'history', interests: ['history', 'culture', 'art'] },
    { title: 'Floating Market Visit', venue: 'Damnoen Saduak', category: 'shopping', interests: ['shopping', 'food', 'culture'] },
    { title: 'Street Food Tour', venue: 'Yaowarat', category: 'food', interests: ['food', 'culture', 'nightlife'] },
    { title: 'Chatuchak Weekend Market', venue: 'Chatuchak', category: 'shopping', interests: ['shopping', 'food', 'culture'] },
    { title: 'Lumpini Park Cycling', venue: 'Lumpini Park', category: 'nature', interests: ['nature', 'adventure'] },
    { title: 'Rooftop Bar Hopping', venue: 'Sukhumvit', category: 'nightlife', interests: ['nightlife', 'food'] }
  ]
};

class EventsService {
  async getEvents(lat, lng, destination = '', interests = []) {
    const cacheKey = `events_${lat}_${lng}_${interests.sort().join('_')}`;
    const cached = cache.get(cacheKey);
    
    if (cached) return cached;

    try {
      // Try Ticketmaster API (free tier available)
      const ticketmasterKey = process.env.TICKETMASTER_API_KEY;
      
      if (ticketmasterKey && ticketmasterKey !== 'your-ticketmaster-api-key') {
        const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
          params: {
            apikey: ticketmasterKey,
            latlong: `${lat},${lng}`,
            radius: 50,
            unit: 'km',
            sort: 'date,asc',
            size: 20
          }
        });

        if (response.data._embedded && response.data._embedded.events) {
          let events = response.data._embedded.events.map(event => ({
            id: event.id,
            title: event.name,
            description: event.info || event.pleaseNote || 'Exciting event in the city',
            startDate: event.dates.start.dateTime || event.dates.start.localDate,
            endDate: event.dates.end?.dateTime || event.dates.start.dateTime || event.dates.start.localDate,
            venue: event._embedded?.venues?.[0]?.name || 'City Venue',
            category: event.classifications?.[0]?.segment?.name || 'Entertainment',
            image: event.images?.[0]?.url || null,
            url: event.url || null
          }));

          // Filter by interests if provided
          if (interests && interests.length > 0) {
            events = this.filterEventsByInterests(events, interests);
          }

          cache.set(cacheKey, events);
          return events.slice(0, 6);
        }
      }
      
      // Fallback: Generate location-aware events
      const events = this.generateLocationAwareEvents(lat, lng, destination, interests);
      cache.set(cacheKey, events);
      return events;
    } catch (error) {
      console.error('Events API error:', error.message);
      const events = this.generateLocationAwareEvents(lat, lng, destination, interests);
      cache.set(cacheKey, events);
      return events;
    }
  }

  filterEventsByInterests(events, interests) {
    return events.filter(event => {
      const eventCategory = event.category?.toLowerCase() || '';
      return interests.some(interest => {
        const categories = interestToCategory[interest.toLowerCase()] || [interest.toLowerCase()];
        return categories.some(cat => eventCategory.includes(cat));
      });
    });
  }

  generateLocationAwareEvents(lat, lng, destination, interests = []) {
    const destinationLower = destination.toLowerCase();
    const now = new Date();
    let events = [];
    
    // Try to find matching city events
    let cityEvents = null;
    for (const [city, eventsList] of Object.entries(cityEventsDB)) {
      if (destinationLower.includes(city)) {
        cityEvents = eventsList;
        break;
      }
    }
    
    // Use city-specific events or generic ones
    let eventTemplates = cityEvents || [
      { title: 'Local Music Festival', venue: 'City Concert Hall', category: 'concerts', interests: ['nightlife', 'art'] },
      { title: 'Art Exhibition Opening', venue: 'City Art Gallery', category: 'expos', interests: ['art', 'culture'] },
      { title: 'Food & Wine Festival', venue: 'Central Plaza', category: 'food', interests: ['food', 'culture'] },
      { title: 'Cultural Dance Performance', venue: 'Grand Theater', category: 'performing-arts', interests: ['culture', 'art', 'nightlife'] },
      { title: 'Weekend Street Market', venue: 'Old Town Square', category: 'shopping', interests: ['shopping', 'food', 'culture'] },
      { title: 'Marathon Race', venue: 'City Center', category: 'sports', interests: ['adventure', 'nature'] },
      { title: 'Jazz Night', venue: 'Riverside Club', category: 'concerts', interests: ['nightlife', 'art'] },
      { title: 'Historical Walking Tour', venue: 'City Museum', category: 'expos', interests: ['history', 'culture'] },
      { title: 'Nature Photography Walk', venue: 'City Park', category: 'nature', interests: ['nature', 'art'] },
      { title: 'Adventure Sports Day', venue: 'Adventure Park', category: 'sports', interests: ['adventure', 'nature'] }
    ];
    
    // Filter by interests if provided
    if (interests && interests.length > 0) {
      eventTemplates = eventTemplates.filter(template => {
        return interests.some(interest => 
          template.interests.includes(interest.toLowerCase())
        );
      });
    }
    
    // If no events match interests, show all events
    if (eventTemplates.length === 0) {
      eventTemplates = cityEvents || [
        { title: 'City Cultural Festival', venue: 'City Center', category: 'festivals', interests: ['culture'] },
        { title: 'Local Art Exhibition', venue: 'Art Gallery', category: 'arts', interests: ['art'] },
        { title: 'Food Tasting Event', venue: 'Central Market', category: 'food', interests: ['food'] }
      ];
    }
    
    for (let i = 0; i < Math.min(6, eventTemplates.length); i++) {
      const template = eventTemplates[i];
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + i * 2 + Math.floor(Math.random() * 3));
      
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 3 + Math.floor(Math.random() * 5));
      
      events.push({
        id: `event-${lat}-${lng}-${i}`,
        title: template.title,
        description: `Experience ${template.title} at ${template.venue}. A must-visit event during your trip!`,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        venue: template.venue,
        category: template.category,
        interests: template.interests,
        rank: 70 + Math.floor(Math.random() * 30)
      });
    }
    
    return events;
  }
}

module.exports = new EventsService();
