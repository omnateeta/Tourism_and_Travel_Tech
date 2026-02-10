import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { dataAPI, itineraryAPI } from '../services/api';
import { 
  MapPin, Calendar, DollarSign, Sparkles, Search, 
  Loader2, Globe, CheckCircle, X
} from 'lucide-react';

// Declare Google Translate types
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
];

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

// Currency data by country
const CURRENCY_DATA: Record<string, { code: string; symbol: string; name: string; rates: { low: number; medium: number; high: number } }> = {
  'united states': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 100, medium: 250, high: 500 } },
  'usa': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 100, medium: 250, high: 500 } },
  'new york': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 150, medium: 350, high: 700 } },
  'los angeles': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 120, medium: 300, high: 600 } },
  'chicago': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 110, medium: 280, high: 550 } },
  'san francisco': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 150, medium: 350, high: 700 } },
  'las vegas': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 120, medium: 300, high: 600 } },
  'miami': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 130, medium: 320, high: 650 } },
  'boston': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 140, medium: 340, high: 680 } },
  'seattle': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 120, medium: 300, high: 600 } },
  'united kingdom': { code: 'GBP', symbol: '£', name: 'British Pound', rates: { low: 80, medium: 200, high: 400 } },
  'uk': { code: 'GBP', symbol: '£', name: 'British Pound', rates: { low: 80, medium: 200, high: 400 } },
  'london': { code: 'GBP', symbol: '£', name: 'British Pound', rates: { low: 100, medium: 250, high: 500 } },
  'manchester': { code: 'GBP', symbol: '£', name: 'British Pound', rates: { low: 70, medium: 180, high: 350 } },
  'edinburgh': { code: 'GBP', symbol: '£', name: 'British Pound', rates: { low: 75, medium: 190, high: 380 } },
  'european union': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 90, medium: 220, high: 450 } },
  'france': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 90, medium: 220, high: 450 } },
  'paris': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 100, medium: 250, high: 500 } },
  'nice': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 85, medium: 210, high: 420 } },
  'lyon': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 75, medium: 190, high: 380 } },
  'germany': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 90, medium: 220, high: 450 } },
  'berlin': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 80, medium: 200, high: 400 } },
  'munich': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 85, medium: 210, high: 420 } },
  'italy': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 80, medium: 200, high: 400 } },
  'rome': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 85, medium: 210, high: 420 } },
  'milan': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 90, medium: 220, high: 450 } },
  'venice': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 95, medium: 240, high: 480 } },
  'spain': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 70, medium: 180, high: 350 } },
  'barcelona': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 75, medium: 190, high: 380 } },
  'madrid': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 70, medium: 180, high: 350 } },
  'netherlands': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 90, medium: 220, high: 450 } },
  'amsterdam': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 95, medium: 240, high: 480 } },
  'japan': { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rates: { low: 10000, medium: 25000, high: 50000 } },
  'tokyo': { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rates: { low: 12000, medium: 30000, high: 60000 } },
  'osaka': { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rates: { low: 10000, medium: 25000, high: 50000 } },
  'kyoto': { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rates: { low: 10000, medium: 25000, high: 50000 } },
  'china': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rates: { low: 500, medium: 1200, high: 2500 } },
  'beijing': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rates: { low: 500, medium: 1200, high: 2500 } },
  'shanghai': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rates: { low: 550, medium: 1300, high: 2700 } },
  'india': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'mumbai': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'delhi': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'bangalore': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'bengaluru': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'hyderabad': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'chennai': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'kolkata': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'pune': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'jaipur': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'agra': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'goa': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'kerala': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'varanasi': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'udaipur': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'jodhpur': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'australia': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rates: { low: 150, medium: 350, high: 700 } },
  'canada': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rates: { low: 130, medium: 320, high: 650 } },
  'brazil': { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rates: { low: 300, medium: 750, high: 1500 } },
  'mexico': { code: 'MXN', symbol: '$', name: 'Mexican Peso', rates: { low: 1500, medium: 4000, high: 8000 } },
  'thailand': { code: 'THB', symbol: '฿', name: 'Thai Baht', rates: { low: 2500, medium: 6000, high: 12000 } },
  'singapore': { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rates: { low: 130, medium: 320, high: 650 } },
  'south korea': { code: 'KRW', symbol: '₩', name: 'South Korean Won', rates: { low: 100000, medium: 250000, high: 500000 } },
  'switzerland': { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', rates: { low: 100, medium: 250, high: 500 } },
  'sweden': { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rates: { low: 900, medium: 2200, high: 4500 } },
  'norway': { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rates: { low: 900, medium: 2200, high: 4500 } },
  'denmark': { code: 'DKK', symbol: 'kr', name: 'Danish Krone', rates: { low: 600, medium: 1500, high: 3000 } },
  'poland': { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rates: { low: 350, medium: 900, high: 1800 } },
  'turkey': { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rates: { low: 2000, medium: 5000, high: 10000 } },
  'russia': { code: 'RUB', symbol: '₽', name: 'Russian Ruble', rates: { low: 6000, medium: 15000, high: 30000 } },
  'south africa': { code: 'ZAR', symbol: 'R', name: 'South African Rand', rates: { low: 1500, medium: 4000, high: 8000 } },
  'uae': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rates: { low: 350, medium: 900, high: 1800 } },
  'dubai': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rates: { low: 350, medium: 900, high: 1800 } },
  'egypt': { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rates: { low: 2000, medium: 5000, high: 10000 } },
  'indonesia': { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rates: { low: 1000000, medium: 2500000, high: 5000000 } },
  'malaysia': { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rates: { low: 400, medium: 1000, high: 2000 } },
  'vietnam': { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rates: { low: 2000000, medium: 5000000, high: 10000000 } },
  'philippines': { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rates: { low: 4000, medium: 10000, high: 20000 } },
  'new zealand': { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rates: { low: 150, medium: 350, high: 700 } },
  'argentina': { code: 'ARS', symbol: '$', name: 'Argentine Peso', rates: { low: 50000, medium: 125000, high: 250000 } },
  'chile': { code: 'CLP', symbol: '$', name: 'Chilean Peso', rates: { low: 70000, medium: 175000, high: 350000 } },
  'colombia': { code: 'COP', symbol: '$', name: 'Colombian Peso', rates: { low: 300000, medium: 750000, high: 1500000 } },
  'peru': { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', rates: { low: 300, medium: 750, high: 1500 } },
  'morocco': { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rates: { low: 800, medium: 2000, high: 4000 } },
  'kenya': { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rates: { low: 10000, medium: 25000, high: 50000 } },
  'nigeria': { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rates: { low: 50000, medium: 125000, high: 250000 } },
  'israel': { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', rates: { low: 350, medium: 900, high: 1800 } },
  'saudi arabia': { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', rates: { low: 350, medium: 900, high: 1800 } },
  'pakistan': { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', rates: { low: 20000, medium: 50000, high: 100000 } },
  'bangladesh': { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rates: { low: 8000, medium: 20000, high: 40000 } },
  'sri lanka': { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', rates: { low: 25000, medium: 60000, high: 120000 } },
};

const getCurrencyForDestination = (destination: string) => {
  if (!destination) return null;
  const destLower = destination.toLowerCase();
  
  // Priority 1: Check for major cities first (more specific)
  const cityMappings: Record<string, string> = {
    // China cities
    'beijing': 'CNY', 'shanghai': 'CNY', 'guangzhou': 'CNY', 'shenzhen': 'CNY',
    'chengdu': 'CNY', 'hangzhou': 'CNY', 'xian': 'CNY', 'xi\'an': 'CNY',
    'nanjing': 'CNY', 'wuhan': 'CNY', 'tianjin': 'CNY', 'chongqing': 'CNY',
    'suzhou': 'CNY', 'dalian': 'CNY', 'qingdao': 'CNY', 'xiamen': 'CNY',
    // India cities
    'mumbai': 'INR', 'delhi': 'INR', 'bangalore': 'INR', 'bengaluru': 'INR',
    'hyderabad': 'INR', 'chennai': 'INR', 'kolkata': 'INR', 'pune': 'INR',
    'jaipur': 'INR', 'agra': 'INR', 'goa': 'INR', 'kerala': 'INR',
    'varanasi': 'INR', 'udaipur': 'INR', 'jodhpur': 'INR', 'amritsar': 'INR',
    // Japan cities
    'tokyo': 'JPY', 'osaka': 'JPY', 'kyoto': 'JPY', 'yokohama': 'JPY',
    'nagoya': 'JPY', 'sapporo': 'JPY', 'fukuoka': 'JPY', 'kobe': 'JPY',
    // UK cities
    'london': 'GBP', 'manchester': 'GBP', 'edinburgh': 'GBP', 'birmingham': 'GBP',
    'glasgow': 'GBP', 'liverpool': 'GBP', 'bristol': 'GBP', 'leeds': 'GBP',
    // US cities
    'new york': 'USD', 'los angeles': 'USD', 'chicago': 'USD', 'san francisco': 'USD',
    'las vegas': 'USD', 'miami': 'USD', 'boston': 'USD', 'seattle': 'USD',
    'washington': 'USD', 'philadelphia': 'USD', 'atlanta': 'USD', 'houston': 'USD',
    // France cities
    'paris': 'EUR', 'nice': 'EUR', 'lyon': 'EUR', 'marseille': 'EUR',
    'toulouse': 'EUR', 'bordeaux': 'EUR', 'strasbourg': 'EUR',
    // Germany cities
    'berlin': 'EUR', 'munich': 'EUR', 'hamburg': 'EUR', 'cologne': 'EUR',
    'frankfurt': 'EUR', 'stuttgart': 'EUR', 'dusseldorf': 'EUR',
    // Italy cities
    'rome': 'EUR', 'milan': 'EUR', 'venice': 'EUR', 'florence': 'EUR',
    'naples': 'EUR', 'turin': 'EUR', 'bologna': 'EUR',
    // Spain cities
    'barcelona': 'EUR', 'madrid': 'EUR', 'seville': 'EUR', 'valencia': 'EUR',
    'granada': 'EUR', 'malaga': 'EUR',
    // Netherlands cities
    'amsterdam': 'EUR', 'rotterdam': 'EUR', 'the hague': 'EUR',
    // Switzerland cities
    'zurich': 'CHF', 'geneva': 'CHF', 'basel': 'CHF', 'bern': 'CHF',
    'lausanne': 'CHF', 'lucerne': 'CHF',
    // Australia cities
    'sydney': 'AUD', 'melbourne': 'AUD', 'brisbane': 'AUD', 'perth': 'AUD',
    'adelaide': 'AUD', 'gold coast': 'AUD', 'cairns': 'AUD',
    // Canada cities
    'toronto': 'CAD', 'vancouver': 'CAD', 'montreal': 'CAD', 'calgary': 'CAD',
    'ottawa': 'CAD', 'quebec': 'CAD', 'edmonton': 'CAD',
    // Brazil cities
    'rio de janeiro': 'BRL', 'sao paulo': 'BRL', 'brasilia': 'BRL',
    'salvador': 'BRL', 'fortaleza': 'BRL',
    // Mexico cities
    'mexico city': 'MXN', 'cancun': 'MXN', 'guadalajara': 'MXN',
    'tijuana': 'MXN', 'puerto vallarta': 'MXN',
    // Thailand cities
    'bangkok': 'THB', 'phuket': 'THB', 'chiang mai': 'THB', 'pattaya': 'THB',
    // Singapore
    'singapore': 'SGD',
    // South Korea cities
    'seoul': 'KRW', 'busan': 'KRW', 'incheon': 'KRW', 'jeju': 'KRW',
    // UAE cities
    'dubai': 'AED', 'abu dhabi': 'AED', 'sharjah': 'AED',
    // Saudi Arabia cities
    'riyadh': 'SAR', 'jeddah': 'SAR', 'mecca': 'SAR', 'medina': 'SAR',
    // Turkey cities
    'istanbul': 'TRY', 'ankara': 'TRY', 'izmir': 'TRY', 'antalya': 'TRY',
    // Russia cities
    'moscow': 'RUB', 'saint petersburg': 'RUB', 'novosibirsk': 'RUB',
    // South Africa cities
    'cape town': 'ZAR', 'johannesburg': 'ZAR', 'durban': 'ZAR',
    'pretoria': 'ZAR',
    // Egypt cities
    'cairo': 'EGP', 'alexandria': 'EGP', 'luxor': 'EGP', 'aswan': 'EGP',
    'sharm el sheikh': 'EGP', 'hurghada': 'EGP',
    // Morocco cities
    'casablanca': 'MAD', 'marrakech': 'MAD', 'rabat': 'MAD', 'fes': 'MAD',
    'tangier': 'MAD', 'agadir': 'MAD',
    // Kenya cities
    'nairobi': 'KES', 'mombasa': 'KES', 'kisumu': 'KES',
    // Israel cities
    'jerusalem': 'ILS', 'tel aviv': 'ILS', 'haifa': 'ILS',
    // Indonesia cities
    'jakarta': 'IDR', 'bali': 'IDR', 'surabaya': 'IDR', 'yogyakarta': 'IDR',
    'bandung': 'IDR', 'lombok': 'IDR',
    // Malaysia cities
    'kuala lumpur': 'MYR', 'penang': 'MYR', 'langkawi': 'MYR', 'malacca': 'MYR',
    // Vietnam cities
    'ho chi minh': 'VND', 'hanoi': 'VND', 'da nang': 'VND', 'nha trang': 'VND',
    'phu quoc': 'VND',
    // Philippines cities
    'manila': 'PHP', 'cebu': 'PHP', 'boracay': 'PHP', 'palawan': 'PHP',
    // New Zealand cities
    'auckland': 'NZD', 'wellington': 'NZD', 'christchurch': 'NZD',
    'queenstown': 'NZD',
    // Argentina cities
    'buenos aires': 'ARS', 'cordoba': 'ARS', 'mendoza': 'ARS',
    'bariloche': 'ARS',
    // Chile cities
    'santiago': 'CLP', 'valparaiso': 'CLP', 'san pedro': 'CLP',
    // Colombia cities
    'bogota': 'COP', 'medellin': 'COP', 'cartagena': 'COP', 'cali': 'COP',
    // Peru cities
    'lima': 'PEN', 'cusco': 'PEN', 'arequipa': 'PEN', 'machu picchu': 'PEN',
    // Pakistan cities
    'karachi': 'PKR', 'lahore': 'PKR', 'islamabad': 'PKR',
    // Bangladesh cities
    'dhaka': 'BDT', 'chittagong': 'BDT', 'sylhet': 'BDT',
    // Sri Lanka cities
    'colombo': 'LKR', 'kandy': 'LKR', 'galle': 'LKR', 'negombo': 'LKR',
    // Poland cities
    'warsaw': 'PLN', 'krakow': 'PLN', 'gdansk': 'PLN', 'wroclaw': 'PLN',
    // Czech Republic cities
    'prague': 'CZK', 'brno': 'CZK', 'karlovy vary': 'CZK',
    // Hungary cities
    'budapest': 'HUF', 'debrecen': 'HUF',
    // Romania cities
    'bucharest': 'RON', 'cluj': 'RON', 'brasov': 'RON',
    // Bulgaria cities
    'sofia': 'BGN', 'plovdiv': 'BGN', 'varna': 'BGN',
    // Croatia cities
    'zagreb': 'HRK', 'dubrovnik': 'HRK', 'split': 'HRK',
    // Norway cities
    'oslo': 'NOK', 'bergen': 'NOK', 'trondheim': 'NOK',
    // Sweden cities
    'stockholm': 'SEK', 'gothenburg': 'SEK', 'malmo': 'SEK',
    // Denmark cities
    'copenhagen': 'DKK', 'aarhus': 'DKK', 'odense': 'DKK',
    // Finland cities
    'helsinki': 'EUR', 'espoo': 'EUR', 'tampere': 'EUR',
    // Austria cities
    'vienna': 'EUR', 'salzburg': 'EUR', 'innsbruck': 'EUR',
    // Belgium cities
    'brussels': 'EUR', 'bruges': 'EUR', 'antwerp': 'EUR', 'ghent': 'EUR',
    // Portugal cities
    'lisbon': 'EUR', 'porto': 'EUR', 'faro': 'EUR', 'madeira': 'EUR',
    // Greece cities
    'athens': 'EUR', 'santorini': 'EUR', 'mykonos': 'EUR', 'crete': 'EUR',
    'rhodes': 'EUR',
  };
  
  // Check for city match first
  for (const [city, currencyCode] of Object.entries(cityMappings)) {
    if (destLower.includes(city)) {
      // Find the full currency data
      for (const [country, data] of Object.entries(CURRENCY_DATA)) {
        if (data.code === currencyCode) {
          return data;
        }
      }
    }
  }
  
  // Priority 2: Check for country match
  for (const [country, data] of Object.entries(CURRENCY_DATA)) {
    if (destLower.includes(country)) {
      return data;
    }
  }
  
  // Default to USD only if it's clearly a US location
  if (destLower.includes('united states') || destLower.includes('usa') || 
      destLower.includes(', us') || destLower.includes(', us ')) {
    return CURRENCY_DATA['united states'];
  }
  
  // Try to detect from common patterns
  // If destination has comma, check the part after comma (usually country/state)
  if (destLower.includes(',')) {
    const parts = destLower.split(',').map(p => p.trim());
    for (const part of parts) {
      for (const [country, data] of Object.entries(CURRENCY_DATA)) {
        if (part.includes(country) || country.includes(part)) {
          return data;
        }
      }
    }
  }
  
  // Last resort: return USD with a flag that it's unknown
  return CURRENCY_DATA['united states'];
};

const TripPlanner: React.FC = () => {
  const { preferences, setPreferences, setCurrentItinerary, isGenerating, setIsGenerating } = useTrip();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [showCustomInterest, setShowCustomInterest] = useState(false);
  const [customInterestInput, setCustomInterestInput] = useState('');
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loadingRates, setLoadingRates] = useState(false);

  // Fetch real-time exchange rates when destination changes
  useEffect(() => {
    const fetchExchangeRates = async () => {
      if (!preferences.destination) return;
      
      const currency = getCurrencyForDestination(preferences.destination);
      if (!currency || currency.code === 'USD') {
        setExchangeRates({});
        return;
      }

      setLoadingRates(true);
      try {
        // Using exchangerate-api.com (free tier available)
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (err) {
        console.error('Exchange rate fetch error:', err);
        setExchangeRates({});
      } finally {
        setLoadingRates(false);
      }
    };

    fetchExchangeRates();
  }, [preferences.destination]);

  const getExchangeRateDisplay = () => {
    const currency = getCurrencyForDestination(preferences.destination);
    if (!currency || currency.code === 'USD' || !exchangeRates[currency.code]) {
      return null;
    }
    const rate = exchangeRates[currency.code];
    return null; // Removed exchange rate display
  };
  useEffect(() => {
    const initGoogleTranslate = () => {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        // Check if already initialized
        const existingWidget = document.getElementById('google_translate_element');
        if (existingWidget && !existingWidget.querySelector('.goog-te-gadget')) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,es,fr,de,it,pt,zh-CN,zh-TW,ja,ko,ar,hi,kn,te,ta,bn,mr,gu,ml,pa,ru,tr,nl,pl,sv,no,da,fi,th,vi,id',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
            },
            'google_translate_element'
          );
          console.log('Google Translate widget initialized in TripPlanner');
        }
      }
    };

    // Try to initialize immediately
    initGoogleTranslate();

    // Also try after a delay in case script loads slowly
    const timer = setTimeout(initGoogleTranslate, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  const handleAddCustomInterest = () => {
    if (customInterestInput.trim()) {
      const newInterest = customInterestInput.trim().toLowerCase().replace(/\s+/g, '-');
      if (!customInterests.includes(newInterest)) {
        setCustomInterests([...customInterests, newInterest]);
        setPreferences({ interests: [...preferences.interests, newInterest] });
      }
      setCustomInterestInput('');
    }
  };

  const handleRemoveCustomInterest = (interest: string) => {
    setCustomInterests(customInterests.filter(i => i !== interest));
    setPreferences({ interests: preferences.interests.filter(i => i !== interest) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomInterest();
    }
  };

  const generateItinerary = async () => {
    if (!preferences.destination || preferences.interests.length === 0) {
      setError('Please select a destination and at least one interest');
      return;
    }

    if (!preferences.duration || preferences.duration < 1) {
      setError('Please enter the number of days for your trip');
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
      
      // Show success notification
      setNotificationMessage(`Itinerary generated for ${preferences.destination.split(',')[0]}!`);
      setShowNotification(true);
      
      // Auto-hide notification after 4 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Success Notification */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-4 right-4 z-50 bg-white border-l-4 border-green-500 shadow-lg rounded-lg p-4 flex items-center gap-3 min-w-[300px]"
        >
          <div className="bg-green-100 rounded-full p-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Success!</p>
            <p className="text-sm text-gray-600">{notificationMessage}</p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

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
            {/* Other Button */}
            <button
              onClick={() => setShowCustomInterest(!showCustomInterest)}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                showCustomInterest || customInterests.length > 0
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">✨</span>
              <p className="text-sm font-medium mt-1">Other</p>
            </button>
          </div>
          
          {/* Custom Interest Input */}
          {showCustomInterest && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-gray-50 rounded-lg"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Your Own Interests
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInterestInput}
                  onChange={(e) => setCustomInterestInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type interest and press Enter (e.g., Photography, Hiking)"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddCustomInterest}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {/* Display Custom Interests */}
              {customInterests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {customInterests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {interest.replace(/-/g, ' ')}
                      <button
                        onClick={() => handleRemoveCustomInterest(interest)}
                        className="hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Budget & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Budget
              {preferences.destination && (
                <span className="ml-2 text-xs text-gray-500">
                  {(() => {
                    const currency = getCurrencyForDestination(preferences.destination);
                    return currency ? `${currency.symbol} ${currency.code}` : '$ USD';
                  })()}
                </span>
              )}
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
            {preferences.destination && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600">
                  {(() => {
                    const currency = getCurrencyForDestination(preferences.destination);
                    return currency ? `${currency.name}` : 'US Dollar';
                  })()}
                </p>
                {loadingRates ? (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading rate...
                  </p>
                ) : (
                  getExchangeRateDisplay() && (
                    <p className="text-xs text-primary-600 font-medium">
                      {getExchangeRateDisplay()}
                    </p>
                  )
                )}
              </div>
            )}
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
              value={preferences.duration || ''}
              onChange={(e) => setPreferences({ duration: parseInt(e.target.value) || 0 })}
              placeholder="Enter days"
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

        {/* Google Translate */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Translate Page
          </label>
          <div id="google_translate_element"></div>
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
    </>
  );
};

export default TripPlanner;
