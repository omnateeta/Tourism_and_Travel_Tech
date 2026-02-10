const placesService = require('./placesService');
const weatherService = require('./weatherService');

class ItineraryService {
  async generateItinerary(preferences) {
    const { destination, interests, budget, duration, startDate, lat, lng } = preferences;
    
    // Fetch real attractions from OpenStreetMap
    const attractions = await placesService.getNearbyAttractions(lat, lng, 10000);
    
    // Get weather forecast
    const weather = await weatherService.getWeather(lat, lng);
    
    // Score and filter attractions based on preferences
    const scoredAttractions = this.scoreAttractions(attractions, interests, budget);
    
    // Generate day-by-day itinerary
    const days = this.buildDailySchedule(
      scoredAttractions, 
      duration, 
      new Date(startDate),
      weather
    );
    
    // Calculate overall sustainability score
    const totalSustainabilityScore = Math.round(
      days.reduce((sum, day) => sum + day.sustainabilityScore, 0) / days.length
    );
    
    // Extract country from destination if available
    const destinationParts = destination.split(',');
    const country = destinationParts.length > 1 ? destinationParts[destinationParts.length - 1].trim() : '';
    
    return {
      destination: {
        name: destinationParts[0],
        country,
        lat,
        lng
      },
      startDate: new Date(startDate),
      endDate: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + duration)),
      days,
      totalSustainabilityScore,
      interests,
      budget
    };
  }

  scoreAttractions(attractions, interests, budget) {
    return attractions.map(attraction => {
      let score = 0;
      
      // Interest matching
      if (interests.includes(attraction.type)) {
        score += 30;
      }
      
      // Rating bonus
      score += (attraction.rating || 3) * 5;
      
      // Hidden gem bonus (lower popularity = higher score for unique experiences)
      if (attraction.popularity === 'low') {
        score += 15;
      }
      
      // Budget consideration
      const estimatedCost = this.estimateCost(attraction);
      if (budget === 'low' && estimatedCost < 20) score += 10;
      if (budget === 'medium' && estimatedCost >= 10 && estimatedCost <= 50) score += 10;
      if (budget === 'high' && estimatedCost > 30) score += 10;
      
      // Calculate sustainability score
      const sustainabilityScore = this.calculateSustainability(attraction);
      
      // Calculate crowd level
      const crowdLevel = this.estimateCrowdLevel(attraction);
      
      return {
        ...attraction,
        score,
        estimatedCost,
        sustainabilityScore,
        crowdLevel,
        isHiddenGem: attraction.popularity === 'low' && attraction.rating >= 4
      };
    }).sort((a, b) => b.score - a.score);
  }

  estimateCost(attraction) {
    const baseCosts = {
      culture: 15,
      food: 25,
      nature: 5,
      history: 10,
      shopping: 30,
      adventure: 40
    };
    return baseCosts[attraction.type] || 20;
  }

  calculateSustainability(attraction) {
    let score = 50; // Base score
    
    // Public transport accessibility (assume good for city center)
    score += 15;
    
    // Local business support (non-chain establishments)
    if (attraction.popularity === 'low' || attraction.popularity === 'medium') {
      score += 15;
    }
    
    // Low crowd penalty (overtourism reduction)
    if (attraction.popularity === 'high') {
      score -= 10;
    } else {
      score += 10;
    }
    
    // Nature attractions get bonus
    if (attraction.type === 'nature') {
      score += 10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  estimateCrowdLevel(attraction) {
    if (attraction.popularity === 'high') return 'high';
    if (attraction.popularity === 'medium') return 'medium';
    return 'low';
  }

  buildDailySchedule(scoredAttractions, duration, startDate, weather) {
    const days = [];
    const usedAttractions = new Set();
    
    for (let day = 1; day <= duration; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day - 1);
      
      // Get weather for this day
      const dayWeather = weather.daily[day - 1] || weather.daily[0];
      
      // Select activities for the day (3-4 activities)
      const dayActivities = [];
      const targetActivities = 3 + Math.floor(Math.random() * 2); // 3-4 activities
      
      // Time slots
      const timeSlots = ['09:00', '11:30', '14:00', '16:30', '19:00'];
      let slotIndex = 0;
      
      for (const attraction of scoredAttractions) {
        if (dayActivities.length >= targetActivities) break;
        if (usedAttractions.has(attraction.id)) continue;
        
        // Skip outdoor activities if rain is expected
        if (attraction.type === 'nature' && dayWeather.precipitation > 70) {
          continue;
        }
        
        usedAttractions.add(attraction.id);
        
        dayActivities.push({
          name: attraction.name,
          type: attraction.type,
          description: this.generateDescription(attraction),
          location: {
            lat: attraction.lat,
            lng: attraction.lng,
            address: 'Local Address'
          },
          duration: 90 + Math.floor(Math.random() * 60), // 90-150 minutes
          cost: attraction.estimatedCost,
          sustainabilityScore: attraction.sustainabilityScore,
          crowdLevel: attraction.crowdLevel,
          isHiddenGem: attraction.isHiddenGem,
          images: [`https://source.unsplash.com/800x600/?${attraction.type},travel`],
          timeSlot: timeSlots[slotIndex] || 'Flexible',
          weather: dayWeather
        });
        
        slotIndex++;
      }
      
      // Calculate day sustainability score
      const daySustainabilityScore = dayActivities.length > 0
        ? Math.round(dayActivities.reduce((sum, a) => sum + a.sustainabilityScore, 0) / dayActivities.length)
        : 50;
      
      days.push({
        day,
        date: currentDate,
        activities: dayActivities,
        sustainabilityScore: daySustainabilityScore,
        weather: dayWeather
      });
    }
    
    return days;
  }

  generateDescription(attraction) {
    const descriptions = {
      culture: `Explore the rich cultural heritage at ${attraction.name}. A must-visit for art and history enthusiasts.`,
      food: `Savor local flavors at ${attraction.name}. Experience authentic cuisine in a welcoming atmosphere.`,
      nature: `Discover natural beauty at ${attraction.name}. Perfect for outdoor enthusiasts and nature lovers.`,
      history: `Step back in time at ${attraction.name}. Immerse yourself in the fascinating history of this landmark.`,
      shopping: `Find unique treasures at ${attraction.name}. From local crafts to modern fashion.`,
      adventure: `Experience thrills at ${attraction.name}. An exciting destination for adventure seekers.`
    };
    
    return descriptions[attraction.type] || `Visit ${attraction.name}, a wonderful destination offering memorable experiences.`;
  }
}

module.exports = new ItineraryService();
