import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface Activity {
  name: string;
  type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  duration: number;
  cost: number;
  sustainabilityScore: number;
  crowdLevel: 'low' | 'medium' | 'high';
  isHiddenGem: boolean;
  images: string[];
  timeSlot: string;
  phoneNumber?: string;
  formattedPhone?: string;
  address?: string;
  website?: string;
  rating?: number;
  openingHours?: string[];
  placeId?: string;
  photos?: string[];
  hasRealData?: boolean;
  lat?: number;
  lng?: number;
  popularity?: 'low' | 'medium' | 'high';
  tags?: Record<string, string>;
}

interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  sustainabilityScore: number;
}

interface Itinerary {
  _id: string;
  destination: {
    name: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  startDate: string;
  endDate: string;
  days: DayPlan[];
  totalSustainabilityScore: number;
  interests: string[];
  budget: string;
}

interface TripPreferences {
  destination: string;
  interests: string[];
  budget: 'low' | 'medium' | 'high';
  duration: number;
  startDate: string;
  language: string;
  lat?: number;
  lng?: number;
}

interface TripContextType {
  currentItinerary: Itinerary | null;
  preferences: TripPreferences;
  setPreferences: (prefs: Partial<TripPreferences>) => void;
  setCurrentItinerary: (itinerary: Itinerary | null) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  clearTripData: () => void;
}

const defaultPreferences: TripPreferences = {
  destination: '',
  interests: [],
  budget: 'medium',
  duration: 0,
  startDate: new Date().toISOString().split('T')[0],
  language: 'en',
  lat: undefined,
  lng: undefined,
};

const STORAGE_KEY = 'smart_travel_itinerary';
const PREFERENCES_KEY = 'smart_travel_preferences';

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from localStorage on initial render
  const [currentItinerary, setCurrentItineraryState] = useState<Itinerary | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved itinerary:', e);
        }
      }
    }
    return null;
  });
  
  const [preferences, setPreferencesState] = useState<TripPreferences>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      if (saved) {
        try {
          return { ...defaultPreferences, ...JSON.parse(saved) };
        } catch (e) {
          console.error('Failed to parse saved preferences:', e);
        }
      }
    }
    return defaultPreferences;
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Save to localStorage whenever itinerary changes
  useEffect(() => {
    if (currentItinerary) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentItinerary));
    }
  }, [currentItinerary]);

  // Save to localStorage whenever preferences change
  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const setCurrentItinerary = (itinerary: Itinerary | null) => {
    setCurrentItineraryState(itinerary);
    if (itinerary) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itinerary));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const setPreferences = (prefs: Partial<TripPreferences>) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, ...prefs };
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearTripData = () => {
    setCurrentItineraryState(null);
    setPreferencesState(defaultPreferences);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREFERENCES_KEY);
  };

  return (
    <TripContext.Provider
      value={{
        currentItinerary,
        preferences,
        setPreferences,
        setCurrentItinerary,
        isGenerating,
        setIsGenerating,
        clearTripData,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
