const axios = require('axios');

// Hotel model that connects to real hotel APIs
// Using Amadeus API as an example (you can substitute with Booking.com, Expedia, etc.)
class Hotel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.location = data.location;
    this.rating = data.rating;
    this.price = data.price;
    this.imageUrl = data.imageUrl;
    this.amenities = data.amenities || [];
    this.distanceFromCenter = data.distanceFromCenter;
    this.description = data.description;
    this.availability = data.availability !== undefined ? data.availability : true;
  }

  static async findById(id) {
    // In a real implementation, this would query the database
    // For now, we'll return mock data
    return new Hotel({
      id,
      name: 'Grand Plaza Hotel',
      location: 'Downtown Area',
      rating: 4.8,
      price: 189,
      imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
      amenities: ['wifi', 'parking', 'pool', 'spa'],
      distanceFromCenter: '0.2 km',
      description: 'Luxury hotel with stunning city views and premium amenities.',
      availability: true
    });
  }

  static async search(params) {
    try {
      // Get coordinates for the destination
      const coordinates = await Hotel.getCoordinatesForDestination(params.destination);
      
      if (!coordinates) {
        // Fallback to mock data if we can't get coordinates
        return Hotel.getMockHotels(params);
      }
      
      // Call external API to get real hotel data
      const hotels = await Hotel.fetchHotelsFromAPI(params, coordinates);
      
      return hotels;
    } catch (error) {
      console.error('Error fetching hotels:', error);
      // Fallback to mock data if API call fails
      return Hotel.getMockHotels(params);
    }
  }

  static async getCoordinatesForDestination(destination) {
    try {
      // Use Google Maps Geocoding API or similar to get coordinates
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: destination,
          key: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'
        }
      });
      
      if (response.data.results && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding destination:', error);
      return null;
    }
  }

  static async fetchHotelsFromAPI(params, coordinates) {
    try {
      // Connect to a real hotel API - using dummy API for demonstration
      // In production, you would use real API keys and endpoints
      
      // First, try to get city ID from destination name
      const cityId = await Hotel.getCityId(params.destination);
      
      if (!cityId) {
        // If we can't get city ID, fall back to coordinate-based search
        return await Hotel.searchByCoordinates(params, coordinates);
      }
      
      // Use Booking.com-like API (dummy implementation)
      const hotelData = await Hotel.callRealHotelAPI(cityId, params);
      
      if (hotelData && hotelData.length > 0) {
        return hotelData;
      }
      
      // If real API fails, fall back to coordinate search
      return await Hotel.searchByCoordinates(params, coordinates);
      
    } catch (error) {
      console.error('Error fetching hotels from API:', error);
      // Return location-specific results as fallback
      return await Hotel.generateLocationSpecificHotels(params, coordinates);
    }
  }
  
  static async getCityId(destination) {
    try {
      // This would connect to a geocoding API to get city ID
      // For demo, we'll use a simple mapping
      const cityMap = {
        'paris': '10584',
        'london': '10713',
        'new york': '10612',
        'tokyo': '10801',
        'bali': '10810',
        'rome': '10583',
        'barcelona': '10605',
        'sydney': '10763',
        'singapore': '10754',
        'dubai': '10803'
      };
      
      const lowerDest = destination.toLowerCase();
      
      for (const [city, id] of Object.entries(cityMap)) {
        if (lowerDest.includes(city) || city.includes(lowerDest)) {
          return id;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting city ID:', error);
      return null;
    }
  }
  
  static async callRealHotelAPI(cityId, params) {
    try {
      // This is where you would call a real hotel booking API
      // For example, Booking.com API, Expedia API, etc.
      // Using dummy API call for demonstration
      
      // Check if we have API keys configured
      const bookingApiKey = process.env.BOOKING_API_KEY;
      
      if (!bookingApiKey || bookingApiKey === 'your_booking_api_key_here') {
        // No real API key configured, return location-specific data
        return null;
      }
      
      // Real API call would look like this:
      /*
      const response = await axios.get('https://booking-com.p.rapidapi.com/v1/hotels/search', {
        params: {
          city_id: cityId,
          checkin_date: params.checkIn,
          checkout_date: params.checkOut,
          adults_number: params.guests || 1,
          room_number: 1,
          order_by: 'popularity',
          page_number: 1
        },
        headers: {
          'X-RapidAPI-Key': process.env.BOOKING_API_KEY,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        }
      });
      
      return response.data.result.map(hotel => ({
        id: hotel.hotel_id,
        name: hotel.hotel_name,
        location: params.destination,
        rating: parseFloat(hotel.review_score) || 0,
        price: parseInt(hotel.price_breakdown.allotment_price),
        imageUrl: hotel.main_photo_url,
        amenities: hotel.hotel_facilities ? hotel.hotel_facilities.map(f => f.name.toLowerCase().replace(/\s+/g, '_')) : [],
        distanceFromCenter: `${parseFloat(hotel.distance_from_center).toFixed(1)} km from center`,
        description: hotel.hotel_description || 'Comfortable accommodation in prime location',
        availability: true
      }));
      */
      
      // Since we don't have a real API key, return null to trigger fallback
      return null;
      
    } catch (error) {
      console.error('Error calling real hotel API:', error);
      return null;
    }
  }
  
  static async searchByCoordinates(params, coordinates) {
    try {
      // Alternative search method using coordinates
      // This would connect to geolocation-based hotel APIs
      
      const geoApiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!geoApiKey || geoApiKey === 'your_google_maps_api_key_here') {
        // Fall back to location-specific data
        return await Hotel.generateLocationSpecificHotels(params, coordinates);
      }
      
      // Real Google Places API call would look like this:
      /*
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          query: `hotels in ${params.destination}`,
          location: `${coordinates.latitude},${coordinates.longitude}`,
          radius: 50000, // 50km radius
          type: 'lodging',
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });
      
      return response.data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        location: place.vicinity || params.destination,
        rating: place.rating || 0,
        price: this.estimatePriceFromRating(place.rating),
        imageUrl: place.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}` : null,
        amenities: [], // Would need additional API call to get details
        distanceFromCenter: `${(place.geometry.location.lat - coordinates.latitude).toFixed(2)} km`,
        description: `Located in ${place.vicinity || params.destination}`,
        availability: true
      }));
      */
      
      // Return location-specific data as fallback
      return await Hotel.generateLocationSpecificHotels(params, coordinates);
      
    } catch (error) {
      console.error('Error searching by coordinates:', error);
      return await Hotel.generateLocationSpecificHotels(params, coordinates);
    }
  }
  
  static estimatePriceFromRating(rating) {
    // Estimate price based on rating
    if (rating >= 4.5) return Math.floor(Math.random() * 100) + 200; // $200-$300
    if (rating >= 4.0) return Math.floor(Math.random() * 80) + 120;  // $120-$200
    if (rating >= 3.5) return Math.floor(Math.random() * 60) + 80;   // $80-$140
    return Math.floor(Math.random() * 50) + 50;                    // $50-$100
  }

  static async generateLocationSpecificHotels(params, coordinates) {
    // Generate hotel data that's specific to the destination
    const destination = params.destination.toLowerCase();
    
    // Define destination-specific hotel templates
    const hotelTemplates = {
      'paris': [
        {
          id: 'paris-grand-plaza',
          name: 'Paris Grand Plaza',
          location: 'Eiffel Tower District',
          rating: 4.7,
          price: 229,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
          amenities: ['wifi', 'parking', 'spa', 'restaurant'],
          distanceFromCenter: '0.8 km from Eiffel Tower',
          description: 'Luxury hotel with stunning views of the Eiffel Tower',
          availability: true
        },
        {
          id: 'paris-seine-view',
          name: 'Seine Riverside Hotel',
          location: 'Near Notre-Dame',
          rating: 4.5,
          price: 189,
          imageUrl: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=400&h=250&fit=crop',
          amenities: ['wifi', 'breakfast', 'bar'],
          distanceFromCenter: '1.2 km from Notre-Dame',
          description: 'Beautiful hotel along the Seine River with classic Parisian charm',
          availability: true
        }
      ],
      'tokyo': [
        {
          id: 'tokyo-skytree',
          name: 'Tokyo Skytree Tower',
          location: 'Sumida District',
          rating: 4.8,
          price: 199,
          imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c38395e3e?w=400&h=250&fit=crop',
          amenities: ['wifi', 'onsen', 'restaurant', 'gym'],
          distanceFromCenter: '1.5 km from Tokyo Skytree',
          description: 'Modern hotel with traditional Japanese touches',
          availability: true
        },
        {
          id: 'tokyo-shibuya',
          name: 'Shibuya Crosswalk Inn',
          location: 'Shibuya District',
          rating: 4.6,
          price: 159,
          imageUrl: 'https://images.unsplash.com/photo-1584655456497-773cbd1e0f7c?w=400&h=250&fit=crop',
          amenities: ['wifi', 'breakfast', 'convenience_store'],
          distanceFromCenter: '0.3 km from Shibuya Crossing',
          description: 'Compact, efficient hotel in the heart of Tokyo',
          availability: true
        }
      ],
      'new york': [
        {
          id: 'nyc-central-park',
          name: 'Central Park Grand',
          location: 'Manhattan',
          rating: 4.9,
          price: 329,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
          amenities: ['wifi', 'gym', 'spa', 'restaurant'],
          distanceFromCenter: '0.2 km from Central Park',
          description: 'Luxury hotel with iconic Manhattan skyline views',
          availability: true
        },
        {
          id: 'nyc-broadway',
          name: 'Broadway Theater District',
          location: 'Times Square',
          rating: 4.4,
          price: 249,
          imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
          amenities: ['wifi', 'concierge', 'bar'],
          distanceFromCenter: '0.1 km from Times Square',
          description: 'Convenient location in the heart of NYC entertainment district',
          availability: true
        }
      ],
      'bali': [
        {
          id: 'bali-beach-resort',
          name: 'Bali Beachfront Resort',
          location: 'Seminyak',
          rating: 4.8,
          price: 179,
          imageUrl: 'https://images.unsplash.com/photo-1540259998304-16f2b9e1e672?w=400&h=250&fit=crop',
          amenities: ['wifi', 'pool', 'spa', 'beach_access'],
          distanceFromCenter: 'On the beach',
          description: 'Tropical paradise with direct beach access',
          availability: true
        },
        {
          id: 'bali-forest-retreat',
          name: 'Ubud Forest Retreat',
          location: 'Ubud',
          rating: 4.7,
          price: 149,
          imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop',
          amenities: ['wifi', 'yoga_studio', 'spa', 'garden'],
          distanceFromCenter: 'Surrounded by rice fields',
          description: 'Peaceful retreat surrounded by lush tropical forest',
          availability: true
        }
      ],
      'london': [
        {
          id: 'london-buckingham',
          name: 'Buckingham Palace View',
          location: 'Westminster',
          rating: 4.6,
          price: 269,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
          amenities: ['wifi', 'parking', 'concierge', 'afternoon_tea'],
          distanceFromCenter: '1.0 km from Buckingham Palace',
          description: 'Classic British hotel with royal views',
          availability: true
        },
        {
          id: 'london-thames',
          name: 'Thames Riverside Hotel',
          location: 'South Bank',
          rating: 4.5,
          price: 219,
          imageUrl: 'https://images.unsplash.com/photo-1584655456497-773cbd1e0f7c?w=400&h=250&fit=crop',
          amenities: ['wifi', 'restaurant', 'river_view'],
          distanceFromCenter: '0.5 km from Big Ben',
          description: 'Stunning views of the Thames and London Eye',
          availability: true
        }
      ]
    };
    
    // Check if we have destination-specific hotels
    let hotels = [];
    
    // Look for partial matches in the templates
    for (const [key, template] of Object.entries(hotelTemplates)) {
      if (destination.includes(key) || key.includes(destination) || 
          destination.includes(key.split(' ')[0])) {
        hotels = template;
        break;
      }
    }
    
    // If no specific template found, use generic hotels
    if (hotels.length === 0) {
      hotels = [
        {
          id: 'generic-luxury-' + Math.random().toString(36).substr(2, 9),
          name: `${params.destination} Luxury Hotel`,
          location: params.destination,
          rating: 4.5,
          price: 199,
          imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
          amenities: ['wifi', 'parking', 'restaurant'],
          distanceFromCenter: 'City center',
          description: `Experience luxury in the heart of ${params.destination}`,
          availability: true
        },
        {
          id: 'generic-boutique-' + Math.random().toString(36).substr(2, 9),
          name: `${params.destination} Boutique Hotel`,
          location: params.destination,
          rating: 4.3,
          price: 149,
          imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=250&fit=crop',
          amenities: ['wifi', 'breakfast', 'garden'],
          distanceFromCenter: 'Historic district',
          description: `Charming boutique hotel in ${params.destination}`,
          availability: true
        }
      ];
    }
    
    // Apply filters based on parameters
    return hotels.map(hotel => ({
      ...hotel,
      price: params.checkIn && params.checkOut ? 
        Hotel.calculatePriceBasedOnDates(hotel.price, params.checkIn, params.checkOut) : 
        hotel.price
    }));
  }

  static calculatePriceBasedOnDates(basePrice, checkIn, checkOut) {
    // Calculate price based on seasonality, demand, etc.
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Apply seasonal pricing
    const month = checkInDate.getMonth();
    let seasonalMultiplier = 1.0;
    
    // Peak season multiplier (example: summer months)
    if ([5, 6, 7, 8].includes(month)) { // June-August
      seasonalMultiplier = 1.3;
    } else if ([11, 0, 1].includes(month)) { // Dec-Feb
      seasonalMultiplier = 0.9; // Off-season discount
    }
    
    // Weekend multiplier
    const isWeekend = checkInDate.getDay() === 6 || checkInDate.getDay() === 0;
    if (isWeekend) {
      seasonalMultiplier *= 1.1;
    }
    
    return Math.round(basePrice * seasonalMultiplier * nights);
  }

  static getMockHotels(params) {
    // Fallback mock data
    return [
      {
        id: '1',
        name: 'Grand Plaza Hotel',
        location: params.destination || 'Downtown Area',
        rating: 4.8,
        price: 189,
        imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
        amenities: ['wifi', 'parking', 'pool', 'spa'],
        distanceFromCenter: '0.2 km',
        description: 'Luxury hotel with stunning city views and premium amenities.',
        availability: true
      },
      {
        id: '2',
        name: 'Boutique Garden Inn',
        location: params.destination || 'Garden District',
        rating: 4.6,
        price: 129,
        imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=250&fit=crop',
        amenities: ['wifi', 'breakfast', 'garden'],
        distanceFromCenter: '1.5 km',
        description: 'Charming boutique hotel with beautiful gardens and peaceful atmosphere.',
        availability: true
      },
      {
        id: '3',
        name: 'Ocean View Resort',
        location: params.destination || 'Beachfront',
        rating: 4.9,
        price: 249,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
        amenities: ['wifi', 'pool', 'beach', 'restaurant'],
        distanceFromCenter: '3.2 km',
        description: 'Beachfront resort with panoramic ocean views and luxury services.',
        availability: true
      }
    ];
  }
}

module.exports = Hotel;