import axios from 'axios';

interface SecurityContact {
  type: 'police' | 'hospital' | 'embassy' | 'tourist_police' | 'fire_station' | 'emergency';
  name: string;
  phone: string;
  address: string;
  distance: string;
  latitude: number;
  longitude: number;
  isEmergency?: boolean;
}

interface SecurityResponse {
  contacts: SecurityContact[];
  location: {
    lat: number;
    lng: number;
  };
}

class SecurityService {
  private readonly BASE_URL = 'https://nominatim.openstreetmap.org/search';
  
  async getSecurityContacts(destination: string): Promise<SecurityResponse> {
    try {
      // First, geocode the destination to get coordinates
      const geocodeResponse = await axios.get(this.BASE_URL, {
        params: {
          q: destination,
          format: 'json',
          limit: 1
        }
      });
      
      if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
        throw new Error('Location not found');
      }
      
      const location = geocodeResponse.data[0];
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);
      
      // Now search for nearby police stations
      const policeResponse = await axios.get(this.BASE_URL, {
        params: {
          q: `police station near ${destination}`,
          format: 'json',
          limit: 5
        }
      });
      
      const contacts: SecurityContact[] = [];
      
      // Process police stations
      if (policeResponse.data && policeResponse.data.length > 0) {
        policeResponse.data.slice(0, 3).forEach((station: any) => {
          const distance = this.calculateDistance(
            lat, 
            lon, 
            parseFloat(station.lat), 
            parseFloat(station.lon)
          ).toFixed(1);
          
          contacts.push({
            type: 'police',
            name: station.display_name.split(',')[0] || 'Police Station',
            phone: station.phone || 'Not available',
            address: station.display_name,
            distance: `${distance} km`,
            latitude: parseFloat(station.lat),
            longitude: parseFloat(station.lon),
            isEmergency: false
          });
        });
      }
      
      // Add tourist police if available
      const touristPoliceResponse = await axios.get(this.BASE_URL, {
        params: {
          q: `tourist police near ${destination}`,
          format: 'json',
          limit: 2
        }
      });
      
      if (touristPoliceResponse.data && touristPoliceResponse.data.length > 0) {
        touristPoliceResponse.data.forEach((station: any) => {
          const distance = this.calculateDistance(
            lat, 
            lon, 
            parseFloat(station.lat), 
            parseFloat(station.lon)
          ).toFixed(1);
          
          contacts.push({
            type: 'tourist_police',
            name: station.display_name.split(',')[0] || 'Tourist Police',
            phone: station.phone || 'Not available',
            address: station.display_name,
            distance: `${distance} km`,
            latitude: parseFloat(station.lat),
            longitude: parseFloat(station.lon),
            isEmergency: true
          });
        });
      }
      
      // Add emergency services
      contacts.push({
        type: 'emergency',
        name: 'Emergency Services',
        phone: this.getEmergencyNumber(destination),
        address: 'Dial from anywhere',
        distance: 'Immediate',
        latitude: lat,
        longitude: lon,
        isEmergency: true
      });
      
      // Add hospital if available
      const hospitalResponse = await axios.get(this.BASE_URL, {
        params: {
          q: `hospital near ${destination}`,
          format: 'json',
          limit: 2
        }
      });
      
      if (hospitalResponse.data && hospitalResponse.data.length > 0) {
        hospitalResponse.data.forEach((hospital: any) => {
          const distance = this.calculateDistance(
            lat, 
            lon, 
            parseFloat(hospital.lat), 
            parseFloat(hospital.lon)
          ).toFixed(1);
          
          contacts.push({
            type: 'hospital',
            name: hospital.display_name.split(',')[0] || 'Hospital',
            phone: hospital.phone || 'Not available',
            address: hospital.display_name,
            distance: `${distance} km`,
            latitude: parseFloat(hospital.lat),
            longitude: parseFloat(hospital.lon),
            isEmergency: false
          });
        });
      }
      
      return {
        contacts,
        location: {
          lat,
          lng: lon
        }
      };
    } catch (error) {
      console.error('Error fetching security contacts:', error);
      // Return mock data in case of error
      return this.getMockData(destination);
    }
  }
  
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }
  
  private getEmergencyNumber(destination: string): string {
    // Return appropriate emergency number based on country
    const lowerDest = destination.toLowerCase();
    
    if (lowerDest.includes('united states') || lowerDest.includes('usa') || lowerDest.includes('new york')) {
      return '911';
    } else if (lowerDest.includes('uk') || lowerDest.includes('london') || lowerDest.includes('england')) {
      return '999';
    } else if (lowerDest.includes('france') || lowerDest.includes('paris')) {
      return '112';
    } else if (lowerDest.includes('japan') || lowerDest.includes('tokyo')) {
      return '119';
    } else if (lowerDest.includes('uae') || lowerDest.includes('dubai')) {
      return '999';
    } else {
      return '112'; // International emergency number
    }
  }
  
  private getMockData(destination: string): SecurityResponse {
    // Mock data for when API calls fail
    const mockData: Record<string, SecurityContact[]> = {
      paris: [
        {
          type: 'police',
          name: 'Police Station - Champs-Élysées',
          phone: '+33 1 53 75 82 16',
          address: '1 Avenue des Champs-Élysées, 75008 Paris',
          distance: '0.2 km',
          latitude: 48.8698,
          longitude: 2.3075,
          isEmergency: false
        },
        {
          type: 'tourist_police',
          name: 'Tourist Police - 8th Arrondissement',
          phone: '+33 1 53 87 53 87',
          address: '36 Rue du Faubourg Saint-Honoré, 75008 Paris',
          distance: '0.5 km',
          latitude: 48.8712,
          longitude: 2.3223,
          isEmergency: true
        },
        {
          type: 'emergency',
          name: 'Emergency Services',
          phone: '112',
          address: 'Dial from anywhere',
          distance: 'Immediate',
          latitude: 48.8566,
          longitude: 2.3522,
          isEmergency: true
        }
      ],
      'new york': [
        {
          type: 'police',
          name: 'NYPD - 23rd Precinct',
          phone: '+1 212-358-1111',
          address: '226 E 23rd St, New York, NY 10010',
          distance: '0.3 km',
          latitude: 40.7394,
          longitude: -73.9776,
          isEmergency: false
        },
        {
          type: 'tourist_police',
          name: 'NYPD Tourist Assistance',
          phone: '+1 212-334-0300',
          address: 'Broadway & W 45th St, New York, NY 10036',
          distance: '0.7 km',
          latitude: 40.7580,
          longitude: -73.9855,
          isEmergency: true
        },
        {
          type: 'emergency',
          name: 'Emergency Services',
          phone: '911',
          address: 'Dial from anywhere',
          distance: 'Immediate',
          latitude: 40.7128,
          longitude: -74.0060,
          isEmergency: true
        }
      ],
      london: [
        {
          type: 'police',
          name: 'Metropolitan Police - Westminster',
          phone: '+44 20 7839 2888',
          address: '11 Broadway, London SW1H 0BG',
          distance: '0.4 km',
          latitude: 51.4975,
          longitude: -0.1356,
          isEmergency: false
        },
        {
          type: 'tourist_police',
          name: 'Met Police Tourism Unit',
          phone: '+44 20 7230 1111',
          address: 'Great Scotland Yard, London SW1A 2HQ',
          distance: '0.6 km',
          latitude: 51.5063,
          longitude: -0.1272,
          isEmergency: true
        },
        {
          type: 'emergency',
          name: 'Emergency Services',
          phone: '999',
          address: 'Dial from anywhere',
          distance: 'Immediate',
          latitude: 51.5074,
          longitude: -0.1278,
          isEmergency: true
        }
      ],
      tokyo: [
        {
          type: 'police',
          name: 'Tokyo Metropolitan Police - Shibuya',
          phone: '+81 3-3466-3110',
          address: '2-1-1 Jinnan, Shibuya City, Tokyo 150-0041',
          distance: '0.2 km',
          latitude: 35.6602,
          longitude: 139.7008,
          isEmergency: false
        },
        {
          type: 'tourist_police',
          name: 'Tourist Police - Shibuya',
          phone: '+81 3-3466-3110',
          address: '2-1-1 Jinnan, Shibuya City, Tokyo 150-0041',
          distance: '0.2 km',
          latitude: 35.6602,
          longitude: 139.7008,
          isEmergency: true
        },
        {
          type: 'emergency',
          name: 'Emergency Services',
          phone: '119',
          address: 'Dial from anywhere',
          distance: 'Immediate',
          latitude: 35.6895,
          longitude: 139.6917,
          isEmergency: true
        }
      ],
      dubai: [
        {
          type: 'police',
          name: 'Dubai Police Station - Bur Dubai',
          phone: '+971 4-605 5555',
          address: 'Al Rigga Street, Bur Dubai, Dubai',
          distance: '0.3 km',
          latitude: 25.2718,
          longitude: 55.2940,
          isEmergency: false
        },
        {
          type: 'tourist_police',
          name: 'Tourist Police - Dubai',
          phone: '+971 4-357 8888',
          address: 'Al Khaleej Centre, Al Rigga, Dubai',
          distance: '0.5 km',
          latitude: 25.2697,
          longitude: 55.3077,
          isEmergency: true
        },
        {
          type: 'emergency',
          name: 'Emergency Services',
          phone: '999',
          address: 'Dial from anywhere',
          distance: 'Immediate',
          latitude: 25.2048,
          longitude: 55.2708,
          isEmergency: true
        }
      ]
    };
    
    const normalizedDest = destination.toLowerCase().trim();
    let destKey: keyof typeof mockData = 'paris'; // Default
    
    if (normalizedDest.includes('paris')) {
      destKey = 'paris';
    } else if (normalizedDest.includes('new york') || normalizedDest.includes('nyc')) {
      destKey = 'new york';
    } else if (normalizedDest.includes('london')) {
      destKey = 'london';
    } else if (normalizedDest.includes('tokyo')) {
      destKey = 'tokyo';
    } else if (normalizedDest.includes('dubai') || normalizedDest.includes('dubai')) {
      destKey = 'dubai';
    }
    
    return {
      contacts: mockData[destKey],
      location: { lat: 0, lng: 0 } // Will be updated with real coords if API works
    };
  }
}

export const securityService = new SecurityService();
export type { SecurityContact, SecurityResponse };