"use client";

import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLng = { lat: number; lng: number };

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const COLORS: Record<string, string> = {
  fastest: "#b42318",
  cleanest: "#2f6f4e",
  balanced: "#1f6f8b",
};

export default function RouteMap({
  origin,
  destination,
  options,
  selectedId,
  stations = [],
  onSelect,
}: {
  origin: LatLng;
  destination: LatLng;
  options: Array<{ id: string; geometry: LatLng[]; label?: string }>;
  selectedId?: string;
  stations?: Array<{ lat: number; lng: number; name?: string; pm25?: number }>;
  onSelect?: (id: string) => void;
}) {
  const center = {
    lat: (origin.lat + destination.lat) / 2,
    lng: (origin.lng + destination.lng) / 2,
  };

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[origin.lat, origin.lng]} icon={icon}>
        <Popup>Origin</Popup>
      </Marker>
      <Marker position={[destination.lat, destination.lng]} icon={icon}>
        <Popup>Destination</Popup>
      </Marker>
      {stations.map((s, i) => (
        <CircleMarker
          key={`${s.lat}-${s.lng}-${i}`}
          center={[s.lat, s.lng]}
          radius={8}
          pathOptions={{ color: "#d97706", fillColor: "#f2d7a4", fillOpacity: 0.85 }}
        >
          <Popup>
            {s.name || "Station"}
            {s.pm25 != null ? ` · PM2.5 ${s.pm25}` : ""}
          </Popup>
        </CircleMarker>
      ))}
      {options.map((opt) => (
        <Polyline
          key={opt.id}
          positions={opt.geometry.map((p) => [p.lat, p.lng] as [number, number])}
          eventHandlers={{
            click: () => onSelect?.(opt.id),
          }}
          pathOptions={{
            color: COLORS[opt.id] || "#0f3d4c",
            weight: opt.id === selectedId ? 7 : 3.5,
            opacity: opt.id === selectedId ? 0.95 : 0.4,
          }}
        />
      ))}
    </MapContainer>
  );
}
