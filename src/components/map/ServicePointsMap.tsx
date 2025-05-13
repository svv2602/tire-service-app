import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ServicePoint } from '../../types/servicePoint';

// Исправляем проблему с иконками маркеров в React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface ServicePointsMapProps {
  servicePoints: ServicePoint[];
  selectedPoint: number | null;
  onPointSelect: (id: number) => void;
}

const ServicePointsMap: React.FC<ServicePointsMapProps> = ({
  servicePoints,
  selectedPoint,
  onPointSelect,
}) => {
  // Центр карты - примерный центр России
  const defaultCenter: [number, number] = [55.7558, 37.6173];
  
  // Enhanced debug logging for service points
  useEffect(() => {
    if (Array.isArray(servicePoints)) {
      console.log('Map component received points:', {
        total: servicePoints.length
      });
      
      // Log the first few points for detailed inspection
      if (servicePoints.length > 0) {
        console.log('Sample service points:');
        servicePoints.slice(0, 3).forEach((point, index) => {
          console.log(`Point ${index + 1}: id=${point.id}, name=${point.name}`);
        });
      }
    } else {
      console.log('Map received invalid servicePoints:', servicePoints);
    }
  }, [servicePoints]);
  
  // Handle invalid or empty service points array
  const validServicePoints = Array.isArray(servicePoints) 
    ? servicePoints.filter(point => 
        point && 
        typeof point.lat === 'number' && 
        typeof point.lng === 'number' &&
        !isNaN(point.lat) && 
        !isNaN(point.lng))
    : [];
  
  console.log('Valid service points for map:', validServicePoints.length);
  
  // If no valid service points, show default view
  if (!validServicePoints.length) {
    return (
      <MapContainer
        center={defaultCenter}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: 10, zIndex: 1000 }}>
          Нет доступных сервисных точек
        </div>
      </MapContainer>
    );
  }
  
  return (
    <MapContainer
      center={validServicePoints.length > 0 
        ? [validServicePoints[0].lat, validServicePoints[0].lng]
        : defaultCenter}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {validServicePoints.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          eventHandlers={{
            click: () => onPointSelect(point.id),
          }}
        >
          <Popup>
            <div>
              <h3>{point.name}</h3>
              <p>{point.address}</p>
              <p>Телефон: {point.phone || 'Не указан'}</p>
              {point.description && <p>{point.description}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ServicePointsMap;