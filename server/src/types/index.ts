import { Request } from 'express';

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  preferences: {
    interests: string[];
    budget: 'low' | 'medium' | 'high';
    language: string;
  };
  createdAt: Date;
}

export interface IActivity {
  _id: string;
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
  openingHours?: string;
  rating?: number;
}

export interface IDayPlan {
  day: number;
  date: Date;
  activities: IActivity[];
  sustainabilityScore: number;
}

export interface IItinerary {
  _id: string;
  userId: string;
  destination: {
    name: string;
    country: string;
    lat: number;
    lng: number;
  };
  startDate: Date;
  endDate: Date;
  days: IDayPlan[];
  totalSustainabilityScore: number;
  interests: string[];
  budget: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface WeatherData {
  current: {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
  };
  daily: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
    precipitation: number;
  }>;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  category: string;
}

export interface CrowdData {
  level: 'low' | 'medium' | 'high';
  percentage: number;
  peakHours: string[];
}

export interface TripPreferences {
  destination: string;
  interests: string[];
  budget: 'low' | 'medium' | 'high';
  duration: number;
  startDate: string;
  language: string;
}
