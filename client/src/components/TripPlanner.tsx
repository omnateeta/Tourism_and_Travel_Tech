import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { dataAPI, itineraryAPI } from '../services/api';
import { 
  MapPin, Calendar, DollarSign, Sparkles, Search, 
  Loader2, Check, Globe
} from 'lucide-react';

const INTERESTS = [
  { id: 'culture', label: 'Culture', icon: '🎭' },
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'nature', label: 'Nature', icon: '🌲' },
  { id: 'adventure', label: 'Adventure', icon: '🏔️' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'nightlife', label: 'Nightlife', icon: '🌃' },
  { id: 'history', label: 'History', icon: '🏛️' },
  { id: 'art', label: 'Art', icon: '🎨' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
];

const TripPlanner: React.FC = () => {
  const { preferences, setPreferences, setCurrentItinerary, isGenerating, setIsGenerating } = useTrip();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSearch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await dataAPI.searchPlaces(searchQuery);
      setSearchResults(response.data.places);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectDestination = (place: any) => {
    setPreferences({
      destination: place.fullName,
      lat: place.lat,
      lng: place.lng,
    });
    setSearchQuery(place.name);
    setSearchResults([]);
  };

  const toggleInterest = (interestId: string) => {
    const newInterests = preferences.interests.includes(interestId)
      ? preferences.interests.filter((i) => i !== interestId)
      : [...preferences.interests, interestId];
    setPreferences({ interests: newInterests });
  };

  const generateItinerary = async () => {
    if (!preferences.destination || preferences.interests.length === 0) {
      setError('Please select a destination and at least one interest');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const response = await itineraryAPI.generate({
        destination: preferences.destination,
        interests: preferences.interests,
        budget: preferences.budget,
        duration: preferences.duration,
        startDate: preferences.startDate,
        lat: preferences.lat,
        lng: preferences.lng,
      });

      setCurrentItinerary(response.data.itinerary);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary-500" />
        Plan Your Trip
      </h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Destination Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Destination
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
              placeholder="Search for a city or destination..."
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            {isSearching && (
              <Loader2 className="w-5 h-5 text-primary-500 absolute right-3 top-3.5 animate-spin" />
            )}
          </div>
          
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {searchResults.map((place, index) => (
                <button
                  key={index}
                  onClick={() => selectDestination(place)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <p className="font-medium text-gray-900">{place.name}</p>
                  <p className="text-sm text-gray-500">{place.fullName}</p>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Interests
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {INTERESTS.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  preferences.interests.includes(interest.id)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{interest.icon}</span>
                <p className="text-sm font-medium mt-1">{interest.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Budget & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Budget
            </label>
            <select
              value={preferences.budget}
              onChange={(e) => setPreferences({ budget: e.target.value as any })}
              className="input-field"
            >
              <option value="low">Budget Friendly</option>
              <option value="medium">Moderate</option>
              <option value="high">Luxury</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Duration (days)
            </label>
            <input
              type="number"
              min={1}
              max={14}
              value={preferences.duration}
              onChange={(e) => setPreferences({ duration: parseInt(e.target.value) })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={preferences.startDate}
              onChange={(e) => setPreferences({ startDate: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Preferred Language
          </label>
          <div className="flex gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setPreferences({ language: lang.code })}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  preferences.language === lang.code
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateItinerary}
          disabled={isGenerating}
          className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Smart Itinerary...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Smart Trip
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TripPlanner;
