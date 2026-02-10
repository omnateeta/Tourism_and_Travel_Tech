import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Itinerary API
export const itineraryAPI = {
  generate: (data: {
    destination: string;
    interests: string[];
    budget: string;
    duration: number;
    startDate: string;
    lat: number;
    lng: number;
  }) => api.post('/itineraries/generate', data),
  getAll: () => api.get('/itineraries'),
  getById: (id: string) => api.get(`/itineraries/${id}`),
  delete: (id: string) => api.delete(`/itineraries/${id}`),
};

// Data API
export const dataAPI = {
  getWeather: (lat: number, lng: number) =>
    api.get(`/data/weather/${lat}/${lng}`),
  searchPlaces: (query: string) =>
    api.get(`/data/places/search?q=${encodeURIComponent(query)}`),
  getNearbyAttractions: (lat: number, lng: number, radius?: number) =>
    api.get(`/data/places/nearby?lat=${lat}&lng=${lng}&radius=${radius || 5000}`),
  getEvents: (lat: number, lng: number) =>
    api.get(`/data/events/${lat}/${lng}`),
};

// Assistant API
export const assistantAPI = {
  chat: (data: { message: string; language: string; context?: any }) =>
    api.post('/assistant/chat', data),
  getSuggestions: (language: string, destination: string) =>
    api.get(`/assistant/suggestions?language=${language}&destination=${encodeURIComponent(destination)}`),
};

export default api;
