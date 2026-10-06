"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, ExternalLink, Copy, Check } from "lucide-react";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface CustomLocationMapProps {
  lat?: number;
  lng?: number;
  title?: string;
  address?: string;
}

export default function CustomLocationMap({
  lat = -23.6698,
  lng = 27.7411,
  title = "Lephalale Base",
  address = "Lephalale, Limpopo, South Africa",
}: CustomLocationMapProps) {
  const [copied, setCopied] = useState(false);
  const position: [number, number] = [lat, lng];

  // Direct link to open Google Maps directions from user's location to coordinates
  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 group">
      {/* MAP CONTAINER */}
      <div className="w-full h-[380px] relative z-0">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          attributionControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          {/* High-Resolution Esri Satellite Imagery */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
          <Marker position={position} icon={customIcon}>
            <Popup className="custom-popup">
              <div className="p-1 max-w-[220px]">
                <h4 className="font-bold text-navy-900 text-sm mb-1">
                  {title}
                </h4>
                <p className="text-xs text-slate-600 mb-3">{address}</p>
                <a
                  href={googleDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-navy-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5 fill-current" />
                  Get Directions
                </a>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* FLOATING ACTION BAR OVERLAY */}
      <div className="absolute bottom-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-navy-950 flex items-center justify-center font-bold text-xs shrink-0">
            <Navigation className="w-4 h-4 fill-current" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-none">
              {title}
            </p>
            <p className="text-[11px] font-mono text-slate-300 mt-1">
              {lat}, {lng}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Coordinates Button */}
          <button
            onClick={handleCopyCoords}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors"
            title="Copy Coordinates"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? "Copied" : "Coords"}</span>
          </button>

          {/* Open Google Maps Directions */}
          <a
            href={googleDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-navy-950 font-bold text-xs transition-transform active:scale-95"
          >
            <span>Directions</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
