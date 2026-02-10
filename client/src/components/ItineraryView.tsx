import React from 'react';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { 
  Calendar, Clock, MapPin, Leaf, Users, 
  Sparkles, DollarSign, Star
} from 'lucide-react';

const ItineraryView: React.FC = () => {
  const { currentItinerary } = useTrip();

  if (!currentItinerary) {
    return (
      <div className="card p-12 text-center">
        <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Itinerary Yet</h3>
        <p className="text-gray-500">Generate a trip plan to see your personalized itinerary here</p>
      </div>
    );
  }

  const getCrowdBadge = (level: string) => {
    switch (level) {
      case 'low': return <span className="badge-green">Low Crowd</span>;
      case 'medium': return <span className="badge-yellow">Medium Crowd</span>;
      case 'high': return <span className="badge-red">High Crowd</span>;
      default: return null;
    }
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return 'bg-secondary-500';
    if (score >= 60) return 'bg-secondary-400';
    if (score >= 40) return 'bg-accent-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentItinerary.destination.name}</h2>
            <p className="text-gray-500">
              {new Date(currentItinerary.startDate).toLocaleDateString()} - {new Date(currentItinerary.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Sustainability</p>
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-secondary-500" />
                <span className="text-xl font-bold text-secondary-600">
                  {currentItinerary.totalSustainabilityScore}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-6">
        {currentItinerary.days.map((day, dayIndex) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.1 }}
            className="card overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Day {day.day}</h3>
                <p className="text-primary-100">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {day.activities.map((activity, actIndex) => (
                <motion.div
                  key={actIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: actIndex * 0.1 }}
                  className="border-l-4 border-primary-400 pl-4 py-2"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span className="text-sm font-medium text-primary-600">{activity.timeSlot}</span>
                        {activity.isHiddenGem && (
                          <span className="badge-blue">Hidden Gem</span>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">{activity.name}</h4>
                      <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {getCrowdBadge(activity.crowdLevel)}
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">${activity.cost}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{activity.duration} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-secondary-500" />
                        <div className="w-24 sustainability-bar">
                          <div 
                            className={`sustainability-fill ${getSustainabilityColor(activity.sustainabilityScore)}`}
                            style={{ width: `${activity.sustainabilityScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-secondary-600">{activity.sustainabilityScore}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryView;
