const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 900 });

const weatherCodes = {
  0: { description: 'Clear sky', icon: 'sun' },
  1: { description: 'Mainly clear', icon: 'sun-cloud' },
  2: { description: 'Partly cloudy', icon: 'cloud-sun' },
  3: { description: 'Overcast', icon: 'cloud' },
  45: { description: 'Foggy', icon: 'fog' },
  48: { description: 'Depositing rime fog', icon: 'fog' },
  51: { description: 'Light drizzle', icon: 'drizzle' },
  53: { description: 'Moderate drizzle', icon: 'drizzle' },
  55: { description: 'Dense drizzle', icon: 'drizzle' },
  61: { description: 'Slight rain', icon: 'rain' },
  63: { description: 'Moderate rain', icon: 'rain' },
  65: { description: 'Heavy rain', icon: 'rain-heavy' },
  71: { description: 'Slight snow', icon: 'snow' },
  73: { description: 'Moderate snow', icon: 'snow' },
  75: { description: 'Heavy snow', icon: 'snow' },
  95: { description: 'Thunderstorm', icon: 'thunder' }
};

class WeatherService {
  async getWeather(lat, lng) {
    const cacheKey = `weather_${lat}_${lng}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lng,
          current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
          timezone: 'auto',
          forecast_days: 7
        }
      });

      const data = response.data;
      
      const weatherData = {
        current: {
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
          windSpeed: data.current.wind_speed_10m,
          humidity: data.current.relative_humidity_2m,
          description: weatherCodes[data.current.weather_code]?.description || 'Unknown',
          icon: weatherCodes[data.current.weather_code]?.icon || 'sun'
        },
        daily: data.daily.time.map((date, index) => ({
          date,
          maxTemp: data.daily.temperature_2m_max[index],
          minTemp: data.daily.temperature_2m_min[index],
          weatherCode: data.daily.weather_code[index],
          precipitation: data.daily.precipitation_probability_max[index],
          description: weatherCodes[data.daily.weather_code[index]]?.description || 'Unknown',
          icon: weatherCodes[data.daily.weather_code[index]]?.icon || 'sun'
        }))
      };

      cache.set(cacheKey, weatherData);
      return weatherData;
    } catch (error) {
      console.error('Weather API error:', error.message);
      throw new Error('Failed to fetch weather data');
    }
  }
}

module.exports = new WeatherService();
