import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dataAPI } from '../services/api';
import { Calendar, MapPin, Ticket } from 'lucide-react';

interface EventsWidgetProps {
  lat: number;
  lng: number;
}

const EventsWidget: React.FC<EventsWidgetProps> = ({ lat, lng }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [lat, lng]);

  const fetchEvents = async () => {
    try {
      const response = await dataAPI.getEvents(lat, lng);
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
              <p className="font-medium text-gray-900 text-sm">{event.title}</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(event.startDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.venue}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default EventsWidget;
