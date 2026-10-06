'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function CustomLocationMap({ 
  lat = -23.6698, 
  lng = 27.7411, 
  title = "Lephalale, Limpopo" 
}) {
  const position: [number, number] = [lat, lng];

  return (
    <div className="w-full h-[350px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer 
        center={position} 
        zoom={12} 
        scrollWheelZoom={false} 
        attributionControl={false} // <-- Removes the Leaflet / OpenStreetMap badge
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customIcon}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}