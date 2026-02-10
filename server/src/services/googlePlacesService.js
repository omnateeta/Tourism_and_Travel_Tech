const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 });

class GooglePlacesService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.baseURL = 'https://maps.googleapis.com/maps/api/place';
  }

  async searchPlaceDetails(query, lat, lng) {
    if (!this.apiKey || this.apiKey === 'your-google-places-api-key') {
      console.log('Google Places API key not configured, using fallback data');
      return this.getFallbackPlaceDetails(query);
    }

    const cacheKey = `place_details_${query}_${lat}_${lng}`;
    const cached = cache.get(cacheKey);
    
    if (cached) return cached;

    try {
      // Step 1: Search for place using Text Search
      const searchResponse = await axios.get(`${this.baseURL}/textsearch/json`, {
        params: {
          query: query,
          location: `${lat},${lng}`,
          radius: 5000,
          key: this.apiKey
        },
        timeout: 10000
      });

      if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
        return this.getFallbackPlaceDetails(query);
      }

      // Get the first (most relevant) result
      const place = searchResponse.data.results[0];
      const placeId = place.place_id;

      // Step 2: Get detailed place information including phone number
      const detailsResponse = await axios.get(`${this.baseURL}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_phone_number,international_phone_number,formatted_address,website,rating,opening_hours,photos,geometry',
          key: this.apiKey
        },
        timeout: 10000
      });

      const details = detailsResponse.data.result;

      const placeDetails = {
        name: details.name || place.name,
        phoneNumber: details.international_phone_number || details.formatted_phone_number || null,
        formattedPhone: details.formatted_phone_number || null,
        address: details.formatted_address || place.formatted_address,
        website: details.website || null,
        rating: details.rating || place.rating,
        location: details.geometry?.location || place.geometry?.location,
        openingHours: details.opening_hours?.weekday_text || null,
        photos: details.photos ? details.photos.slice(0, 3).map(p => p.photo_reference) : [],
        placeId: placeId
      };

      cache.set(cacheKey, placeDetails);
      return placeDetails;

    } catch (error) {
      console.error('Google Places API error:', error.message);
      return this.getFallbackPlaceDetails(query);
    }
  }

  async getPlacePhoto(photoReference, maxWidth = 400) {
    if (!this.apiKey || !photoReference) {
      return null;
    }

    try {
      const response = await axios.get(`${this.baseURL}/photo`, {
        params: {
          photoreference: photoReference,
          maxwidth: maxWidth,
          key: this.apiKey
        },
        responseType: 'arraybuffer',
        timeout: 10000
      });

      // Convert to base64
      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Photo fetch error:', error.message);
      return null;
    }
  }

  getFallbackPlaceDetails(query) {
    // Generate realistic fallback data based on location name
    const locationLower = query.toLowerCase();
    
    // Country-specific phone number patterns
    const countryPatterns = {
      'india': { code: '+91', pattern: '98XXX XXXXX', example: '+91 98765 43210' },
      'mumbai': { code: '+91', pattern: '98XXX XXXXX', example: '+91 98765 43210' },
      'delhi': { code: '+91', pattern: '98XXX XXXXX', example: '+91 98765 43210' },
      'bangalore': { code: '+91', pattern: '98XXX XXXXX', example: '+91 98765 43210' },
      'china': { code: '+86', pattern: '138 XXXX XXXX', example: '+86 138 1234 5678' },
      'beijing': { code: '+86', pattern: '138 XXXX XXXX', example: '+86 138 1234 5678' },
      'shanghai': { code: '+86', pattern: '138 XXXX XXXX', example: '+86 138 1234 5678' },
      'japan': { code: '+81', pattern: '90 XXXX XXXX', example: '+81 90 1234 5678' },
      'tokyo': { code: '+81', pattern: '90 XXXX XXXX', example: '+81 90 1234 5678' },
      'uk': { code: '+44', pattern: '7XXX XXXXXX', example: '+44 7700 900123' },
      'london': { code: '+44', pattern: '7XXX XXXXXX', example: '+44 7700 900123' },
      'france': { code: '+33', pattern: '6 XX XX XX XX', example: '+33 6 12 34 56 78' },
      'paris': { code: '+33', pattern: '6 XX XX XX XX', example: '+33 6 12 34 56 78' },
      'germany': { code: '+49', pattern: '151X XXXXXXX', example: '+49 151 12345678' },
      'berlin': { code: '+49', pattern: '151X XXXXXXX', example: '+49 151 12345678' },
      'italy': { code: '+39', pattern: '3XX XXX XXXX', example: '+39 312 345 6789' },
      'rome': { code: '+39', pattern: '3XX XXX XXXX', example: '+39 312 345 6789' },
      'spain': { code: '+34', pattern: '6XX XXX XXX', example: '+34 612 345 678' },
      'barcelona': { code: '+34', pattern: '6XX XXX XXX', example: '+34 612 345 678' },
      'usa': { code: '+1', pattern: '(555) XXX-XXXX', example: '+1 (555) 123-4567' },
      'new york': { code: '+1', pattern: '(555) XXX-XXXX', example: '+1 (555) 123-4567' },
      'canada': { code: '+1', pattern: '(555) XXX-XXXX', example: '+1 (555) 123-4567' },
      'australia': { code: '+61', pattern: '4XX XXX XXX', example: '+61 412 345 678' },
      'sydney': { code: '+61', pattern: '4XX XXX XXX', example: '+61 412 345 678' },
      'brazil': { code: '+55', pattern: '11 9XXXX XXXX', example: '+55 11 98765 4321' },
      'mexico': { code: '+52', pattern: '1 55 XXXX XXXX', example: '+52 1 55 1234 5678' },
      'thailand': { code: '+66', pattern: '8X XXX XXXX', example: '+66 81 234 5678' },
      'bangkok': { code: '+66', pattern: '8X XXX XXXX', example: '+66 81 234 5678' },
      'singapore': { code: '+65', pattern: '8XXX XXXX', example: '+65 8123 4567' },
      'dubai': { code: '+971', pattern: '50 XXX XXXX', example: '+971 50 123 4567' },
      'uae': { code: '+971', pattern: '50 XXX XXXX', example: '+971 50 123 4567' },
      'turkey': { code: '+90', pattern: '5XX XXX XXXX', example: '+90 532 123 4567' },
      'istanbul': { code: '+90', pattern: '5XX XXX XXXX', example: '+90 532 123 4567' },
      'russia': { code: '+7', pattern: '9XX XXX XXXX', example: '+7 912 345 6789' },
      'south africa': { code: '+27', pattern: '71 XXX XXXX', example: '+27 71 234 5678' },
      'egypt': { code: '+20', pattern: '10 XXX XXXX', example: '+20 10 1234 5678' },
      'cairo': { code: '+20', pattern: '10 XXX XXXX', example: '+20 10 1234 5678' },
    };

    let phoneInfo = { code: '+1', example: '+1 (555) 123-4567' };
    
    for (const [key, info] of Object.entries(countryPatterns)) {
      if (locationLower.includes(key)) {
        phoneInfo = info;
        break;
      }
    }

    // Generate a realistic phone number
    const randomNum = Math.floor(Math.random() * 9000000000 + 1000000000).toString();
    const phoneNumber = phoneInfo.example;

    return {
      name: query,
      phoneNumber: phoneNumber,
      formattedPhone: phoneNumber,
      address: `${query}, Local Address`,
      website: null,
      rating: 4.0 + Math.random(),
      location: null,
      openingHours: null,
      photos: [],
      placeId: null,
      isFallback: true
    };
  }

  async batchSearchPlaces(activities, lat, lng) {
    const results = {};
    
    // Process in batches to avoid rate limiting
    for (const activity of activities) {
      try {
        const details = await this.searchPlaceDetails(activity.name, lat, lng);
        results[activity.name] = details;
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching details for ${activity.name}:`, error.message);
        results[activity.name] = this.getFallbackPlaceDetails(activity.name);
      }
    }
    
    return results;
  }
}

module.exports = new GooglePlacesService();
