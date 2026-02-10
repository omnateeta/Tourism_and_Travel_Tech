const axios = require('axios');

const UNSPLASH_API_URL = 'https://api.unsplash.com';
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

class UnsplashService {
  constructor() {
    this.client = axios.create({
      baseURL: UNSPLASH_API_URL,
      headers: {
        'Authorization': `Client-ID ${ACCESS_KEY}`
      }
    });
  }

  async searchPhotos(query, perPage = 8) {
    try {
      // If no API key is set or it's the placeholder, use source.unsplash.com
      if (!ACCESS_KEY || ACCESS_KEY === 'your-unsplash-access-key') {
        return this.getFallbackImages(query, perPage);
      }

      const response = await this.client.get('/search/photos', {
        params: {
          query: `${query} travel tourism landmark`,
          per_page: perPage,
          orientation: 'landscape',
          content_filter: 'high'
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results.map(photo => ({
          id: photo.id,
          urls: {
            regular: photo.urls.regular,
            full: photo.urls.full,
            small: photo.urls.small
          },
          alt_description: photo.alt_description,
          description: photo.description,
          user: {
            name: photo.user.name,
            link: photo.user.links.html
          },
          location: photo.location?.name || query
        }));
      }

      return this.getFallbackImages(query, perPage);
    } catch (error) {
      console.error('Unsplash API error:', error.message);
      return this.getFallbackImages(query, perPage);
    }
  }

  getFallbackImages(query, count = 8) {
    // Fallback images using Lorem Picsum (reliable placeholder service)
    // These are random travel/landscape images that will be consistent
    const fallbackImageIds = [
      '10', '28', '29', '54', '76', '101', '103', '104', 
      '106', '110', '130', '152', '164', '177', '192', '200'
    ];
    
    return fallbackImageIds.slice(0, count).map((id, index) => ({
      id: `fallback-${query}-${index}`,
      urls: {
        regular: `https://picsum.photos/seed/${query}${id}/800/600`,
        full: `https://picsum.photos/seed/${query}${id}/1600/1200`,
        small: `https://picsum.photos/seed/${query}${id}/400/300`
      },
      alt_description: `${query} travel photo`,
      description: `Beautiful view of ${query}`,
      user: {
        name: 'Travel Gallery',
        link: 'https://unsplash.com'
      },
      location: query
    }));
  }
}

module.exports = new UnsplashService();
