const placesService = require('./placesService');
const weatherService = require('./weatherService');
const googlePlacesService = require('./googlePlacesService');

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
    
    // Fetch real phone numbers and details from Google Places for all activities
    await this.enrichActivitiesWithPlaceDetails(days, lat, lng);
    
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

  async enrichActivitiesWithPlaceDetails(days, lat, lng) {
    // Collect all activities
    const allActivities = [];
    days.forEach(day => {
      day.activities.forEach(activity => {
        allActivities.push(activity);
      });
    });

    // Fetch place details for all activities in parallel (with rate limiting)
    const placeDetailsPromises = allActivities.map(async (activity) => {
      try {
        // Use the activity's specific coordinates if available, otherwise use destination coordinates
        const searchLat = activity.location?.lat || activity.lat || lat;
        const searchLng = activity.location?.lng || activity.lng || lng;
        
        // Include location/address in search query for better results
        let searchQuery = activity.name;
        if (activity.location?.address && typeof activity.location.address === 'string') {
          searchQuery = `${activity.name}, ${activity.location.address}`;
        }
        
        const details = await googlePlacesService.searchPlaceDetails(searchQuery, searchLat, searchLng);
        
        // Enrich activity with real data
        activity.phoneNumber = details.phoneNumber || details.formattedPhone || null;
        activity.formattedPhone = details.formattedPhone || null;
        activity.address = details.address || activity.location?.address || activity.location;
        activity.website = details.website || null;
        activity.rating = details.rating || activity.rating;
        activity.openingHours = details.openingHours || null;
        activity.placeId = details.placeId || null;
        activity.photos = details.photos || [];
        
        // Update location if available from Google Places
        if (details.location) {
          activity.location = {
            ...activity.location,
            lat: details.location.lat,
            lng: details.location.lng,
            address: details.address || activity.location?.address
          };
        }
        
        // Mark if this is real data or fallback
        activity.hasRealData = !details.isFallback;
        
        return { activity, details };
      } catch (error) {
        console.error(`Error enriching ${activity.name}:`, error.message);
        // Use fallback data
        const fallback = googlePlacesService.getFallbackPlaceDetails(activity.name);
        activity.phoneNumber = fallback.phoneNumber;
        activity.formattedPhone = fallback.formattedPhone;
        activity.hasRealData = false;
        return { activity, details: fallback };
      }
    });

    // Process with delay to respect rate limits
    for (let i = 0; i < placeDetailsPromises.length; i++) {
      await placeDetailsPromises[i];
      // Small delay to avoid rate limiting
      if (i < placeDetailsPromises.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }
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
    // Base costs in Indian Rupees (₹)
    const baseCosts = {
      culture: 500,      // Museums, galleries - ₹500
      food: 800,         // Restaurants - ₹800
      nature: 200,       // Parks, nature spots - ₹200
      history: 400,      // Historic sites - ₹400
      shopping: 1000,    // Shopping - ₹1000
      adventure: 1500    // Adventure activities - ₹1500
    };
    return baseCosts[attraction.type] || 600;
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
