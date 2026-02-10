import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dataAPI } from '../services/api';
import { Calendar, MapPin, Ticket, ExternalLink } from 'lucide-react';

interface EventsWidgetProps {
  lat: number;
  lng: number;
  destination?: string;
  interests?: string[];
}

const EventsWidget: React.FC<EventsWidgetProps> = ({ lat, lng, destination, interests }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [lat, lng, destination, interests]);

  const fetchEvents = async () => {
    try {
      const response = await dataAPI.getEvents(lat, lng, destination, interests);
      setEvents(response.data.events.slice(0, 3));
    } catch (err) {
      console.error('Events fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Ticket className="w-5 h-5 text-primary-500" />
        Local Events
        {destination && (
          <span className="text-sm font-normal text-gray-500">
            in {destination.split(',')[0]}
          </span>
        )}
      </h3>

      {events.length === 0 ? (
        <p className="text-gray-500 text-sm">No events found nearby</p>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <p className="font-medium text-gray-900 text-sm flex-1">{event.title}</p>
                {event.url && (
                  <a 
                    href={event.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-600 ml-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{event.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(event.startDate).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.venue}
                </span>
              </div>
              {event.category && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                  {event.category}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default EventsWidget;
