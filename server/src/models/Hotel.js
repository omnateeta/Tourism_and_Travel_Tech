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
    try {
      // First, try to get from a real API if we have the necessary keys
      const bookingApiKey = process.env.BOOKING_API_KEY;
      
      if (bookingApiKey && bookingApiKey !== 'your_booking_api_key_here' && bookingApiKey !== 'e7186a842dmshc9792b26465d140p1d8e0bjsn80ed2e46a9a2') {
        // Try to get hotel details from Booking.com API
        try {
          const response = await axios.get(`https://booking-com.p.rapidapi.com/v1/hotels/get-details`, {
            params: {
              hotel_id: id,
            },
            headers: {
              'X-RapidAPI-Key': process.env.BOOKING_API_KEY,
              'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
            }
          });
          
          if (response.data) {
            return new Hotel({
              id: response.data.hotel_id || id,
              name: response.data.hotel_name || 'Unknown Hotel',
              location: response.data.address || 'Unknown Location',
              rating: parseFloat(response.data.review_score) || 0,
              price: parseInt(response.data.price_breakdown?.allotment_price) || 100,
              imageUrl: response.data.main_photo_url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
              amenities: response.data.hotel_facilities ? response.data.hotel_facilities.substring(0, 100).toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(' ').slice(0, 10) : ['wifi', 'parking'],
              distanceFromCenter: `${parseFloat(response.data.distance_from_center || '1.0').toFixed(1)} km from center`,
              description: response.data.hotel_description || 'Comfortable accommodation in prime location',
              availability: true
            });
          }
        } catch (apiError) {
          console.error('Booking.com API error for details:', apiError.message);
          // Continue to other methods if API fails
        }
      }
      
      // If real API fails, return mock data
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
    } catch (error) {
      console.error('Error in findById:', error);
      // Return basic mock data if everything fails
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
  }

  static async search(params) {
    try {
      // Validate required parameters
      if (!params.destination) {
        console.error('No destination provided for hotel search');
        return [];
      }
      
      // Get coordinates for the destination
      let coordinates = await Hotel.getCoordinatesForDestination(params.destination);
      
      // Validate coordinates are not NaN
      if (coordinates && (isNaN(coordinates.latitude) || isNaN(coordinates.longitude))) {
        console.warn('Invalid coordinates received, using destination name only');
        coordinates = null;
      }
      
      // Even if coordinates fail, try to use location-specific templates
      if (!coordinates) {
        // Try to generate location-specific hotels based on destination name
        return await Hotel.generateLocationSpecificHotels(params, coordinates);
      }
      
      // Call external API to get real hotel data
      const hotels = await Hotel.fetchHotelsFromAPI(params, coordinates);
      
      // If API fails or returns no results, use location-specific templates
      if (!hotels || hotels.length === 0) {
        return await Hotel.generateLocationSpecificHotels(params, coordinates);
      }
      
      return hotels;
    } catch (error) {
      console.error('Error fetching hotels:', error);
      // Fallback to location-specific templates if API call fails
      return await Hotel.generateLocationSpecificHotels(params, null);
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
      // Check if we have BOOKING API key configured
      const bookingApiKey = process.env.BOOKING_API_KEY;
      
      if (bookingApiKey && bookingApiKey !== 'your_booking_api_key_here' && bookingApiKey !== 'e7186a842dmshc9792b26465d140p1d8e0bjsn80ed2e46a9a2') { // Check for default key
        // Real Booking.com API call
        try {
          const response = await axios.get('https://booking-com.p.rapidapi.com/v1/hotels/search', {
            params: {
              city_id: cityId,
              checkin_date: params.checkIn || new Date().toISOString().split('T')[0],
              checkout_date: params.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
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
          
          if (response.data && response.data.result) {
            return response.data.result.slice(0, 10).map(hotel => ({
              id: hotel.hotel_id,
              name: hotel.hotel_name,
              location: hotel.address || params.destination,
              rating: parseFloat(hotel.review_score) || 0,
              price: parseInt(hotel.price_breakdown?.allotment_price) || 100,
              imageUrl: hotel.thumb_url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
              amenities: hotel.hotel_facilities ? hotel.hotel_facilities.substring(0, 100).toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(' ').slice(0, 5) : ['wifi', 'parking'],
              distanceFromCenter: `${parseFloat(hotel.distance_from_center || '1.0').toFixed(1)} km from center`,
              description: hotel.hotel_description || 'Comfortable accommodation in prime location',
              availability: true
            }));
          }
        } catch (apiError) {
          console.error('Booking.com API error:', apiError.message);
          // Continue to other APIs if Booking.com fails
        }
      }
      
      // If booking API not available, try Google Places API
      const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (googleApiKey && googleApiKey !== 'your_google_maps_api_key_here' && googleApiKey !== 'AIzaSyBuE3TbPbxKrE4xCgtHn_z7ba391BqBsNo') { // Check for default key
        try {
          // Search for hotels using Google Places API
          const placesResponse = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
            params: {
              query: `hotels in ${params.destination}`,
              key: process.env.GOOGLE_MAPS_API_KEY,
              type: 'lodging',
              radius: 50000 // 50km radius
            }
          });
          
          if (placesResponse.data && placesResponse.data.results) {
            return placesResponse.data.results.slice(0, 10).map((place, index) => ({
              id: place.place_id,
              name: place.name,
              location: place.vicinity || params.destination,
              rating: place.rating || 0,
              price: this.estimatePriceFromRating(place.rating || 3),
              imageUrl: place.photos ? 
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}` :
                'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
              amenities: ['wifi', 'parking', 'restaurant'], // Google Places doesn't provide detailed amenities in text search
              distanceFromCenter: place.geometry ? 'Nearby' : 'City center',
              description: `Hotel in ${params.destination} with a rating of ${place.rating || 'N/A'}`,
              availability: true
            }));
          }
        } catch (googleError) {
          console.error('Google Places API error:', googleError.message);
          // Continue to other methods if Google Places fails
        }
      }
      
      // Try alternative API - Amadeus API
      const amadeusClientId = process.env.AMADEUS_CLIENT_ID;
      const amadeusClientSecret = process.env.AMADEUS_CLIENT_SECRET;
      if (amadeusClientId && amadeusClientSecret && 
          amadeusClientId !== 'your_amadeus_client_id' && 
          amadeusClientSecret !== 'your_amadeus_client_secret') {
        try {
          // First, get an access token
          const tokenResponse = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', {
            grant_type: 'client_credentials',
            client_id: process.env.AMADEUS_CLIENT_ID,
            client_secret: process.env.AMADEUS_CLIENT_SECRET
          }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
          
          const accessToken = tokenResponse.data.access_token;
          
          // Get location information
          const locationResponse = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations', {
            params: {
              subType: 'CITY,HOTEL',
              keyword: params.destination
            },
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (locationResponse.data && locationResponse.data.data && locationResponse.data.data.length > 0) {
            const cityCode = locationResponse.data.data[0].iataCode || locationResponse.data.data[0].cityCode;
            
            // Search for hotels by city code
            const hotelResponse = await axios.get('https://test.api.amadeus.com/v2/shopping/hotel-offers', {
              params: {
                cityCode: cityCode,
                checkInDate: params.checkIn || new Date().toISOString().split('T')[0],
                checkOutDate: params.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                adults: params.guests || 1
              },
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            });
            
            if (hotelResponse.data && hotelResponse.data.data) {
              return hotelResponse.data.data.slice(0, 10).map(hotel => ({
                id: hotel.hotel.hotelId,
                name: hotel.hotel.name,
                location: hotel.hotel.address.cityName || params.destination,
                rating: hotel.hotel.rating || 0,
                price: hotel.offers[0]?.price?.total ? parseInt(hotel.offers[0].price.total) : 100,
                imageUrl: hotel.hotel.media ? hotel.hotel.media[0]?.url : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
                amenities: hotel.hotel.amenities || ['wifi', 'parking'],
                distanceFromCenter: 'City center',
                description: hotel.hotel.description || 'Comfortable accommodation in prime location',
                availability: true
              }));
            }
          }
        } catch (amadeusError) {
          console.error('Amadeus API error:', amadeusError.message);
        }
      }
      
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
    
    // Define destination-specific hotel templates with more variety
    const hotelTemplates = {
      'paris': [
        {
          id: 'paris-grand-plaza',
          name: 'Le Grand Paris Plaza',
          location: 'Eiffel Tower District',
          rating: 4.7,
          price: 229,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
          amenities: ['wifi', 'parking', 'spa', 'restaurant', 'concierge'],
          distanceFromCenter: '0.8 km from Eiffel Tower',
          description: 'Luxury hotel with stunning views of the Eiffel Tower and premium amenities',
          availability: true
        },
        {
          id: 'paris-seine-view',
          name: 'Seine Riverside Boutique',
          location: 'Saint-Germain-des-Prés',
          rating: 4.5,
          price: 189,
          imageUrl: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=400&h=250&fit=crop',
          amenities: ['wifi', 'breakfast', 'bar', 'terrace'],
          distanceFromCenter: '1.2 km from Notre-Dame',
          description: 'Beautiful boutique hotel along the Seine River with classic Parisian charm',
          availability: true
        },
        {
          id: 'paris-loire-chateau',
          name: 'Château de Versailles Hotel',
          location: 'Versailles',
          rating: 4.8,
          price: 299,
          imageUrl: 'https://images.unsplash.com/photo-1584655456497-773cbd1e0f7c?w=400&h=250&fit=crop',
          amenities: ['wifi', 'parking', 'spa', 'gourmet_restaurant', 'palace_view'],
          distanceFromCenter: '20 km from Paris center',
          description: 'Elegant hotel near the Palace of Versailles with historic ambiance',
          availability: true
        }
      ],
      'tokyo': [
        {
          id: 'tokyo-skytree',
          name: 'Tokyo Skytree Tower Hotel',
          location: 'Sumida District',
          rating: 4.8,
          price: 199,
          imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c38395e3e?w=400&h=250&fit=crop',
          amenities: ['wifi', 'onsen', 'restaurant', 'gym', 'karaoke'],
          distanceFromCenter: '1.5 km from Tokyo Skytree',
          description: 'Modern hotel with traditional Japanese touches and rooftop views',
          availability: true
        },
        {
          id: 'tokyo-shibuya',
          name: 'Shibuya Crosswalk Inn',
          location: 'Shibuya District',
          rating: 4.6,
          price: 159,
          imageUrl: 'https://images.unsplash.com/photo-1584655456497-773cbd1e0f7c?w=400&h=250&fit=crop',
          amenities: ['wifi', 'breakfast', 'convenience_store', 'robot_service'],
          distanceFromCenter: '0.3 km from Shibuya Crossing',
          description: 'Compact, efficient hotel in the heart of Tokyo with tech amenities',
          availability: true
        },
        {
          id: 'tokyo-asakusa',
          name: 'Asakusa Traditional Ryokan',
          location: 'Asakusa District',
          rating: 4.9,
          price: 249,
          imageUrl: 'https://images.unsplash.com/photo-1592839494847-3da5d8f27f82?w=400&h=250&fit=crop',
          amenities: ['wifi', 'traditional_meal', 'tatami_rooms', 'onsen', 'tea_ceremony'],
          distanceFromCenter: '2.0 km from Senso-ji Temple',
          description: 'Traditional ryokan offering authentic Japanese hospitality',
          availability: true
        }
      ],
      'new york': [
        {
          id: 'nyc-central-park',
          name: 'Central Park Grand',
          location: 'Upper West Side',
          rating: 4.9,
          price: 329,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
          amenities: ['wifi', 'gym', 'spa', 'restaurant', 'city_view'],
          distanceFromCenter: '0.2 km from Central Park',
          description: 'Luxury hotel with iconic Manhattan skyline views',
          availability: true
        },
        {
          id: 'nyc-broadway',
          name: 'Times Square Theater Hotel',
          location: 'Midtown Manhattan',
          rating: 4.4,
          price: 249,
          imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
          amenities: ['wifi', 'concierge', 'bar', 'theater_packages'],
          distanceFromCenter: '0.1 km from Times Square',
          description: 'Convenient location in the heart of NYC entertainment district',
          availability: true
        },
        {
          id: 'nyc-brooklyn',
          name: 'Brooklyn Bridge Waterfront',
          location: 'Brooklyn Heights',
          rating: 4.6,
          price: 199,
          imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&h=250&fit=crop',
          amenities: ['wifi', 'water_view', 'fitness_center', 'rooftop_bar'],
          distanceFromCenter: '1.5 km from Brooklyn Bridge',
          description: 'Waterfront property with stunning views of Manhattan skyline',
          availability: true
        }
      ],
      'bali': [
        {
          id: 'bali-beach-resort',
          name: 'Seminyak Beachfront Resort',
          location: 'Seminyak',
          rating: 4.8,
          price: 179,
          imageUrl: 'https://images.unsplash.com/photo-1540259998304-16f2b9e1e672?w=400&h=250&fit=crop',
          amenities: ['wifi', 'pool', 'spa', 'beach_access', 'private_villa'],
          distanceFromCenter: 'On the beach',
          description: 'Tropical paradise with direct beach access and private villas',
          availability: true
        },
        {
          id: 'bali-forest-retreat',
          name: 'Ubud Jungle Retreat',
          location: 'Ubud',
          rating: 4.7,
          price: 149,
          imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop',
          amenities: ['wifi', 'yoga_studio', 'spa', 'garden', 'rice_field_view'],
          distanceFromCenter: 'Surrounded by rice terraces',
          description: 'Peaceful retreat surrounded by lush tropical forest and rice fields',
          availability: true
        },
        {
          id: 'bali-heritage',
          name: 'Heritage Cultural Resort',
          location: 'Ubud Cultural Center',
          rating: 4.9,
          price: 219,
          imageUrl: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=400&h=250&fit=crop',
          amenities: ['wifi', 'cultural_activities', 'temple_view', 'indonesian_spa', 'cooking_classes'],
          distanceFromCenter: '0.5 km from Sacred Monkey Forest',
          description: 'Resort showcasing traditional Balinese architecture and culture',
          availability: true
        }
      ],
      'london': [
        {
          id: 'london-buckingham',
          name: 'Buckingham Palace View Hotel',
          location: 'Westminster',
          rating: 4.6,
          price: 269,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
          amenities: ['wifi', 'parking', 'concierge', 'afternoon_tea', 'royal_view'],
          distanceFromCenter: '1.0 km from Buckingham Palace',
          description: 'Classic British hotel with royal views and traditional amenities',
          availability: true
        },
        {
          id: 'london-thames',
          name: 'Thames Riverside Hotel',
          location: 'South Bank',
          rating: 4.5,
          price: 219,
          imageUrl: 'https://images.unsplash.com/photo-1584655456497-773cbd1e0f7c?w=400&h=250&fit=crop',
          amenities: ['wifi', 'restaurant', 'river_view', 'theater_packages', 'london_eye_view'],
          distanceFromCenter: '0.5 km from Big Ben',
          description: 'Stunning views of the Thames and London Eye with premium location',
          availability: true
        },
        {
          id: 'london-covent',
          name: 'Covent Garden Boutique',
          location: 'Covent Garden',
          rating: 4.7,
          price: 239,
          imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=250&fit=crop',
          amenities: ['wifi', 'shopping', 'theater', 'boutique', 'london_market_view'],
          distanceFromCenter: '0.3 km from Covent Garden Market',
          description: 'Charming boutique hotel in the heart of London\'s shopping district',
          availability: true
        }
      ],
      'singapore': [
        {
          id: 'sg-marina',
          name: 'Marina Bay Sands Experience',
          location: 'Marina Bay',
          rating: 4.9,
          price: 399,
          imageUrl: 'https://images.unsplash.com/photo-1584655456497-773cbd1e0f7c?w=400&h=250&fit=crop',
          amenities: ['wifi', 'infinity_pool', 'sky_deck', 'fine_dining', 'harbor_view'],
          distanceFromCenter: 'On Marina Bay',
          description: 'Iconic hotel with stunning skyline views and world-class amenities',
          availability: true
        },
        {
          id: 'sg-gardens',
          name: 'Gardens by the Bay Resort',
          location: 'Bayfront',
          rating: 4.7,
          price: 259,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
          amenities: ['wifi', 'botanical_gardens_view', 'swimming_pool', 'nature_dome', 'conservatory'],
          distanceFromCenter: 'Adjacent to Gardens by the Bay',
          description: 'Modern hotel with views of the iconic Supertree Grove',
          availability: true
        }
      ],
      'dubai': [
        {
          id: 'dxb-burj',
          name: 'Burj Khalifa View Hotel',
          location: 'Downtown Dubai',
          rating: 4.8,
          price: 299,
          imageUrl: 'https://images.unsplash.com/photo-1592839494847-3da5d8f27f82?w=400&h=250&fit=crop',
          amenities: ['wifi', 'infinity_pool', 'luxury_spa', 'sky_view', 'mall_access'],
          distanceFromCenter: '0.5 km from Burj Khalifa',
          description: 'Luxury hotel with direct views of the world\'s tallest building',
          availability: true
        },
        {
          id: 'dxb-palm',
          name: 'Palm Jumeirah Resort',
          location: 'Palm Jumeirah',
          rating: 4.9,
          price: 349,
          imageUrl: 'https://images.unsplash.com/photo-1540259998304-16f2b9e1e672?w=400&h=250&fit=crop',
          amenities: ['wifi', 'private_beach', 'underwater_restaurant', 'water_sports', 'luxury_spa'],
          distanceFromCenter: 'On Palm Island',
          description: 'Exclusive resort on the iconic Palm Island with premium amenities',
          availability: true
        }
      ],
      'sydney': [
        {
          id: 'syd-opera',
          name: 'Sydney Opera House View',
          location: 'Circular Quay',
          rating: 4.7,
          price: 279,
          imageUrl: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=400&h=250&fit=crop',
          amenities: ['wifi', 'harbor_view', 'opera_house_view', 'harbor_cruise', 'australian_cuisine'],
          distanceFromCenter: '0.2 km from Sydney Opera House',
          description: 'Harbor-front hotel with stunning views of the Opera House and Harbour Bridge',
          availability: true
        },
        {
          id: 'syd-harbor',
          name: 'Harbour Bridge Luxury Hotel',
          location: 'The Rocks',
          rating: 4.6,
          price: 239,
          imageUrl: 'https://images.unsplash.com/photo-1584655456497-773cbd1e0f7c?w=400&h=250&fit=crop',
          amenities: ['wifi', 'harbor_view', 'harbor_bridge_view', 'australian_wine_cellar', 'harbor_cruise'],
          distanceFromCenter: '0.1 km from Sydney Harbour Bridge',
          description: 'Historic location with spectacular harbor views and modern luxury',
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
      // Create more generic hotels with location-appropriate names
      const genericHotels = [];
      const adjectives = ['Grand', 'Royal', 'Plaza', 'Metropolitan', 'Boutique', 'Luxury', 'Premium', 'Deluxe'];
      const types = ['Hotel', 'Inn', 'Resort', 'Suites', 'Palace', 'Tower', 'Garden', 'City'];
      
      for (let i = 0; i < 3; i++) {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        
        genericHotels.push({
          id: `generic-${destination}-${i}` + Math.random().toString(36).substr(2, 9),
          name: `${adj} ${params.destination} ${type}`,
          location: params.destination,
          rating: 4.0 + Math.random() * 0.9, // Between 4.0 and 4.9
          price: 120 + Math.floor(Math.random() * 180), // Between $120 and $300
          imageUrl: [
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
            'https://images.unsplash.com/photo-1584655456497-773cbd1e0f7c?w=400&h=250&fit=crop'
          ][i % 4],
          amenities: ['wifi', 'parking', 'restaurant', 'breakfast'].concat(
            ['spa', 'pool', 'gym', 'bar', 'concierge', 'room_service']
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3))
          ),
          distanceFromCenter: Math.random() > 0.5 ? 'City center' : `${(Math.random() * 5).toFixed(1)} km from center`,
          description: `Well-appointed ${type.toLowerCase()} in the heart of ${params.destination} with modern amenities`,
          availability: true
        });
      }
      
      hotels = genericHotels;
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