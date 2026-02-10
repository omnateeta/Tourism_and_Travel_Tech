import React, { createContext, useContext, useState, type ReactNode } from 'react';

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
    lat: number;
    lng: number;
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
  lat: number;
  lng: number;
}

interface TripContextType {
  currentItinerary: Itinerary | null;
  preferences: TripPreferences;
  setPreferences: (prefs: Partial<TripPreferences>) => void;
  setCurrentItinerary: (itinerary: Itinerary | null) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

const defaultPreferences: TripPreferences = {
  destination: '',
  interests: [],
  budget: 'medium',
  duration: 3,
  startDate: new Date().toISOString().split('T')[0],
  language: 'en',
  lat: 0,
  lng: 0,
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [preferences, setPreferencesState] = useState<TripPreferences>(defaultPreferences);
  const [isGenerating, setIsGenerating] = useState(false);

  const setPreferences = (prefs: Partial<TripPreferences>) => {
    setPreferencesState((prev) => ({ ...prev, ...prefs }));
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
