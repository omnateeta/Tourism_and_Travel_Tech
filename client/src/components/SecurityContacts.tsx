import React, { useState, useEffect } from 'react';
import { Shield, Phone, MapPin, AlertTriangle, Radio, RotateCcw } from 'lucide-react';
import { securityService, type SecurityContact } from '../services/securityService';

const SecurityContacts: React.FC<{ destination?: string }> = ({ destination }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<SecurityContact[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (destination) {
      fetchSecurityContacts(destination);
    } else {
      setContacts([]);
    }
  }, [destination]);

  const fetchSecurityContacts = async (dest: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await securityService.getSecurityContacts(dest);
      setContacts(response.contacts);
    } catch (err) {
      console.error('Error fetching security contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load security contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    if (phone.startsWith('+')) {
      window.location.href = `tel:${phone}`;
    } else {
      alert(`Dial this number: ${phone}`);
    }
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'police':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'tourist_police':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'hospital':
        return <Radio className="w-4 h-4 text-blue-500" />;
      case 'fire_station':
        return <Radio className="w-4 h-4 text-orange-500" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          isOpen 
            ? 'bg-red-100 text-red-700 border border-red-200' 
            : 'bg-white/80 text-gray-700 hover:bg-white/90 border border-white/60'
        } backdrop-blur-sm shadow-sm`}
      >
        <Shield className={`w-5 h-5 ${isOpen ? 'text-red-600' : 'text-gray-600'}`} />
        <span className="hidden sm:inline">Security Contacts</span>
        <span className="sm:hidden">Safety</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold text-lg">Emergency Contacts</h3>
              </div>
              <button 
                onClick={() => destination && fetchSecurityContacts(destination)}
                disabled={isLoading}
                className="text-white/80 hover:text-white transition-colors"
                title="Refresh contacts"
              >
                <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-red-100 text-sm mt-1">Nearby security services for {destination || 'your location'}</p>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                <span className="ml-2 text-gray-600">Finding nearby security services...</span>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center py-4">
                <p>{error}</p>
                <button 
                  onClick={() => destination && fetchSecurityContacts(destination)}
                  className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors flex items-center gap-1 mx-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            ) : contacts.length > 0 ? (
              <div className="space-y-3">
                {contacts.map((contact, index) => (
                  <div 
                    key={`${contact.type}-${index}`} 
                    className={`p-3 rounded-lg border ${
                      contact.isEmergency 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getContactIcon(contact.type)}
                        <div>
                          <h4 className="font-medium text-gray-900">{contact.name}</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {contact.address}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCall(contact.phone)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          contact.isEmergency
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        Call
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{contact.distance} away</span>
                      {contact.isEmergency && (
                        <span className="text-red-600 font-medium">Emergency</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No security contacts available for this location
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span>In case of emergency, dial local emergency number</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityContacts;