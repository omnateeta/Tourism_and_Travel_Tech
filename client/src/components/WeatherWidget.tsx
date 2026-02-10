import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dataAPI } from '../services/api';
import { Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react';

interface WeatherWidgetProps {
  lat: number;
  lng: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ lat, lng }) => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, [lat, lng]);

  const fetchWeather = async () => {
    try {
      const response = await dataAPI.getWeather(lat, lng);
      setWeather(response.data);
    } catch (err) {
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun': return <Sun className="w-8 h-8 text-accent-500" />;
      case 'rain': return <CloudRain className="w-8 h-8 text-primary-500" />;
      case 'cloud': return <Cloud className="w-8 h-8 text-gray-500" />;
      default: return <Sun className="w-8 h-8 text-accent-500" />;
    }
  };

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Forecast</h3>
      
      {/* Current Weather */}
      <div className="flex items-center gap-4 mb-6">
        {getWeatherIcon(weather.current.icon)}
        <div>
          <p className="text-3xl font-bold text-gray-900">{Math.round(weather.current.temperature)}°C</p>
          <p className="text-gray-600">{weather.current.description}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{weather.current.windSpeed} km/h</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{weather.current.humidity}%</span>
        </div>
      </div>

      {/* 3-Day Forecast */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">3-Day Forecast</p>
        <div className="space-y-2">
          {weather.daily.slice(1, 4).map((day: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <div className="flex items-center gap-2">
                {getWeatherIcon(day.icon)}
                <span className="text-sm font-medium">
                  {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
