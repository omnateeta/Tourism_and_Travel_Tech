import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTrip } from '../context/TripContext';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapView: React.FC = () => {
  const { currentItinerary, preferences } = useTrip();

  const center = currentItinerary 
    ? [currentItinerary.destination.lat, currentItinerary.destination.lng]
    : preferences.lat !== 0 
      ? [preferences.lat, preferences.lng]
      : [51.505, -0.09]; // Default to London

  const activities = currentItinerary?.days.flatMap(day => day.activities) || [];

  return (
    <div className="card h-full overflow-hidden">
      <MapContainer
        center={center as [number, number]}
        zoom={13}
        className="h-full w-full"
        style={{ height: '100%', minHeight: '500px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {activities.map((activity, index) => (
          <Marker
            key={index}
            position={[activity.location.lat, activity.location.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{activity.name}</h3>
                <p className="text-sm text-gray-600">{activity.timeSlot}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.description.slice(0, 100)}...</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
