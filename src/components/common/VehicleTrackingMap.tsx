import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Truck,
  MapPin,
  Navigation,
  Fuel,
  Thermometer,
  BatteryCharging,
  Gauge,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Layers,
  X,
  ExternalLink,
  Edit3,
  Save,
  Maximize2,
  Crosshair,
  User,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { Shipment, VehicleDriverTelemetry, RouteCheckpoint } from '../../types';
import { useApp } from '../../context/AppContext';

interface VehicleTrackingMapProps {
  shipment: Shipment;
  onClose?: () => void;
}

// Major Tamil Nadu logistics hub coordinates (Real Latitude & Longitude)
interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
  type: 'port' | 'hub' | 'city' | 'toll';
}

const TN_HUBS: Record<string, GeoPoint> = {
  chennai: { lat: 13.0827, lng: 80.2707, label: 'Chennai Hub & Ennore Port', type: 'port' },
  sriperumbudur: { lat: 12.9675, lng: 79.9430, label: 'Sriperumbudur SIPCOT Hub', type: 'hub' },
  sunguvarchatram: { lat: 12.9312, lng: 79.8055, label: 'Sunguvarchatram Toll Plaza', type: 'toll' },
  ranipet: { lat: 12.9238, lng: 79.3241, label: 'Walajapet / Ranipet Bypass', type: 'hub' },
  vellore: { lat: 12.9165, lng: 79.1325, label: 'Vellore Pallikonda Toll Plaza', type: 'toll' },
  vaniyambadi: { lat: 12.6865, lng: 78.6186, label: 'Vaniyambadi NH48 Section', type: 'city' },
  krishnagiri: { lat: 12.5266, lng: 78.2146, label: 'Krishnagiri Junction Hub', type: 'hub' },
  hosur: { lat: 12.7409, lng: 77.8253, label: 'Hosur SIPCOT Industrial Complex', type: 'hub' },
  dharmapuri: { lat: 12.1211, lng: 78.1582, label: 'Dharmapuri Thoppur Ghat', type: 'city' },
  salem: { lat: 11.6643, lng: 78.1460, label: 'Salem Steel Logistics Hub', type: 'hub' },
  sankari: { lat: 11.4883, lng: 77.8686, label: 'Sankari Toll Plaza', type: 'toll' },
  erode: { lat: 11.3410, lng: 77.7172, label: 'Erode Perundurai Hub', type: 'hub' },
  tiruppur: { lat: 11.1085, lng: 77.3411, label: 'Tiruppur Export Garment Hub', type: 'city' },
  coimbatore: { lat: 11.0168, lng: 76.9558, label: 'Coimbatore Peelamedu Park', type: 'hub' },
  trichy: { lat: 10.7905, lng: 78.7047, label: 'Trichy BHEL Industrial Hub', type: 'hub' },
  dindigul: { lat: 10.3673, lng: 77.9803, label: 'Dindigul Bypass Corridor', type: 'city' },
  madurai: { lat: 9.9252, lng: 78.1198, label: 'Madurai Kappalur Hub', type: 'hub' },
  virudhunagar: { lat: 9.5872, lng: 77.9578, label: 'Virudhunagar Industrial Ring', type: 'city' },
  tuticorin: { lat: 8.7642, lng: 78.1348, label: 'Tuticorin VOC Deepwater Port', type: 'port' },
  tirunelveli: { lat: 8.7139, lng: 77.7567, label: 'Tirunelveli Logistics Terminal', type: 'hub' },
};

// Detour bypass coordinates for NH 48 incident (SH 116 Arcot bypass)
const DETOUR_POINTS: [number, number][] = [
  [12.9675, 79.9430], // Sriperumbudur
  [12.9050, 79.5200], // Kanchipuram West
  [12.8710, 79.3510], // SH-116 Arcot Bypass
  [12.8300, 79.2000], // Kannamangalam
  [12.6865, 78.6186], // Rejoining near Vaniyambadi
  [12.5266, 78.2146], // Krishnagiri
  [11.6643, 78.1460], // Salem
  [11.3410, 77.7172], // Erode
  [11.0168, 76.9558], // Coimbatore
];

export const VehicleTrackingMap: React.FC<VehicleTrackingMapProps> = ({ shipment, onClose }) => {
  const { updateShipment } = useApp();

  // Baseline telemetry or initial defaults
  const initialTelemetry: VehicleDriverTelemetry = shipment.telemetry || {
    vehicleNumber: 'TN-04-BJ-8821',
    vehicleType: 'Ashok Leyland 2820-6x2 Multi-Axle Hauler',
    vehicleModelYear: 2023,
    transporterName: 'TVS Supply Chain Logistics',
    gpsDeviceId: 'GPS-TN-7014',
    speedKmph: 58,
    fuelPercent: 76,
    engineTempCelsius: 83,
    batteryVoltage: 24.3,
    odometerKm: 48210,
    gpsStatus: 'Active NavIC/GPS',
    lastPingTime: 'Just now',
    driverName: 'K. Senthil Kumar',
    driverLicense: 'TN-02-2016-0038192',
    driverPhone: '+91 98401 23456',
    driverExperienceYears: 12,
    driverBloodGroup: 'O+',
    dutyHoursToday: 4.2,
    safetyScore: 98,
    originHub: shipment.originLocation || 'SIPCOT Sriperumbudur Hub',
    destinationHub: shipment.destinationLocation || 'Coimbatore Peelamedu Park',
    highwayCorridor: 'NH 48 & NH 544 Express Corridor',
    totalDistanceKm: 420,
    coveredDistanceKm: 180,
    progressPercent: 45,
    currentLat: 12.9238,
    currentLng: 79.3241,
    currentLocationName: 'NH 48 Walajapet Highway Section, Ranipet',
    checkpoints: [
      {
        id: 'chk-1',
        name: 'Origin Dispatch Depot',
        location: 'Sriperumbudur SIPCOT',
        tollPlazaOrDepot: 'Depot Gate #2',
        plannedTime: '06:00 AM',
        actualTime: '06:12 AM',
        status: 'completed',
        lat: 12.9675,
        lng: 79.9430,
      },
      {
        id: 'chk-2',
        name: 'Sunguvarchatram Toll Plaza',
        location: 'NH 48 KM 42',
        tollPlazaOrDepot: 'Fastag Lane 4',
        plannedTime: '06:50 AM',
        actualTime: '06:48 AM',
        status: 'completed',
        lat: 12.9312,
        lng: 79.8055,
      },
      {
        id: 'chk-3',
        name: 'Walajapet Toll Plaza',
        location: 'Ranipet Section',
        tollPlazaOrDepot: 'Fastag Lane 2',
        plannedTime: '08:15 AM',
        actualTime: '08:45 AM (Congestion)',
        status: 'in_progress',
        lat: 12.9238,
        lng: 79.3241,
      },
      {
        id: 'chk-4',
        name: 'Pallikonda Toll Plaza',
        location: 'Vellore Bypass',
        tollPlazaOrDepot: 'Toll Lane 6',
        plannedTime: '10:00 AM',
        status: 'pending',
        lat: 12.9165,
        lng: 79.1325,
      },
      {
        id: 'chk-5',
        name: 'Krishnagiri Logistics Plaza',
        location: 'NH 48 / NH 44 Junction',
        tollPlazaOrDepot: 'Highway Checkpost',
        plannedTime: '12:30 PM',
        status: 'pending',
        lat: 12.5266,
        lng: 78.2146,
      },
      {
        id: 'chk-6',
        name: 'Salem Steel Highway Terminal',
        location: 'NH 544 Salem Bypass',
        tollPlazaOrDepot: 'Toll Terminal 3',
        plannedTime: '02:45 PM',
        status: 'pending',
        lat: 11.6643,
        lng: 78.1460,
      },
      {
        id: 'chk-7',
        name: 'Perundurai Junction',
        location: 'Erode Industrial Zone',
        tollPlazaOrDepot: 'Perundurai Plaza',
        plannedTime: '04:15 PM',
        status: 'pending',
        lat: 11.3410,
        lng: 77.7172,
      },
      {
        id: 'chk-8',
        name: 'Destination Delivery Hub',
        location: 'Coimbatore Peelamedu Park',
        tollPlazaOrDepot: 'Warehouse Receiving Dock #4',
        plannedTime: '06:30 PM',
        status: 'pending',
        lat: 11.0168,
        lng: 76.9558,
      },
    ],
    disruptionAlert: {
      active: shipment.status === 'Delayed',
      location: 'NH 48 Walajapet Highway Section',
      issue: 'Heavy vehicle axle breakdown causing a 7 km slow crawl queue',
      delayHours: 3.5,
      suggestedDetour: 'Divert via SH-116 Arcot-Cheyyar bypass to rejoin NH 44 at Tiruvannamalai.',
    },
  };

  const [telemetry, setTelemetry] = useState<VehicleDriverTelemetry>(initialTelemetry);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(telemetry.progressPercent || 45);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'telematics' | 'driver' | 'checkpoints'>('telematics');
  const [showDetourModal, setShowDetourModal] = useState<boolean>(false);
  const [detourApplied, setDetourApplied] = useState<boolean>(false);
  const [mapTileLayer, setMapTileLayer] = useState<'streets' | 'satellite' | 'carto'>('streets');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Editable Form State
  const [editForm, setEditForm] = useState({
    vehicleNumber: telemetry.vehicleNumber,
    vehicleType: telemetry.vehicleType,
    transporterName: telemetry.transporterName,
    speedKmph: telemetry.speedKmph,
    fuelPercent: telemetry.fuelPercent,
    engineTempCelsius: telemetry.engineTempCelsius,
    batteryVoltage: telemetry.batteryVoltage,
    odometerKm: telemetry.odometerKm,
    currentLocationName: telemetry.currentLocationName,
    driverName: telemetry.driverName,
    driverLicense: telemetry.driverLicense,
    driverPhone: telemetry.driverPhone,
    driverExperienceYears: telemetry.driverExperienceYears,
    driverBloodGroup: telemetry.driverBloodGroup,
    dutyHoursToday: telemetry.dutyHoursToday,
    safetyScore: telemetry.safetyScore,
  });

  // Map DOM & Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const detourPolylineRef = useRef<L.Polyline | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Route points determination based on shipment origin & destination
  const isCoimbatore =
    shipment.destinationLocation.toLowerCase().includes('coimbatore') ||
    shipment.originLocation.toLowerCase().includes('coimbatore') ||
    shipment.originLocation.toLowerCase().includes('sriperumbudur');

  const isMaduraiOrTuticorin =
    shipment.destinationLocation.toLowerCase().includes('madurai') ||
    shipment.destinationLocation.toLowerCase().includes('tuticorin');

  // Primary highway waypoint coordinates
  const standardRouteCoords: [number, number][] = isCoimbatore
    ? [
        [TN_HUBS.sriperumbudur.lat, TN_HUBS.sriperumbudur.lng],
        [TN_HUBS.sunguvarchatram.lat, TN_HUBS.sunguvarchatram.lng],
        [TN_HUBS.ranipet.lat, TN_HUBS.ranipet.lng],
        [TN_HUBS.vellore.lat, TN_HUBS.vellore.lng],
        [TN_HUBS.vaniyambadi.lat, TN_HUBS.vaniyambadi.lng],
        [TN_HUBS.krishnagiri.lat, TN_HUBS.krishnagiri.lng],
        [TN_HUBS.dharmapuri.lat, TN_HUBS.dharmapuri.lng],
        [TN_HUBS.salem.lat, TN_HUBS.salem.lng],
        [TN_HUBS.sankari.lat, TN_HUBS.sankari.lng],
        [TN_HUBS.erode.lat, TN_HUBS.erode.lng],
        [TN_HUBS.tiruppur.lat, TN_HUBS.tiruppur.lng],
        [TN_HUBS.coimbatore.lat, TN_HUBS.coimbatore.lng],
      ]
    : isMaduraiOrTuticorin
    ? [
        [TN_HUBS.chennai.lat, TN_HUBS.chennai.lng],
        [12.6841, 79.9836], // Chengalpattu
        [12.2286, 79.6542], // Tindivanam
        [11.9398, 79.4924], // Villupuram
        [TN_HUBS.trichy.lat, TN_HUBS.trichy.lng],
        [TN_HUBS.dindigul.lat, TN_HUBS.dindigul.lng],
        [TN_HUBS.madurai.lat, TN_HUBS.madurai.lng],
        [TN_HUBS.virudhunagar.lat, TN_HUBS.virudhunagar.lng],
        [TN_HUBS.tuticorin.lat, TN_HUBS.tuticorin.lng],
      ]
    : [
        [TN_HUBS.hosur.lat, TN_HUBS.hosur.lng],
        [TN_HUBS.krishnagiri.lat, TN_HUBS.krishnagiri.lng],
        [TN_HUBS.dharmapuri.lat, TN_HUBS.dharmapuri.lng],
        [TN_HUBS.salem.lat, TN_HUBS.salem.lng],
        [TN_HUBS.dindigul.lat, TN_HUBS.dindigul.lng],
        [TN_HUBS.madurai.lat, TN_HUBS.madurai.lng],
      ];

  const activeRouteCoords = detourApplied ? DETOUR_POINTS : standardRouteCoords;

  // Calculate coordinates along route based on progress percentage
  const getCoordinatesAtProgress = (progress: number, points: [number, number][]): [number, number] => {
    if (points.length === 0) return [12.9238, 79.3241];
    if (progress <= 0) return points[0];
    if (progress >= 100) return points[points.length - 1];

    const fraction = progress / 100;
    const segmentCount = points.length - 1;
    const currentSegmentIndex = Math.min(Math.floor(fraction * segmentCount), segmentCount - 1);
    const segmentFraction = fraction * segmentCount - currentSegmentIndex;

    const p1 = points[currentSegmentIndex];
    const p2 = points[currentSegmentIndex + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * segmentFraction;
    const lng = p1[1] + (p2[1] - p1[1]) * segmentFraction;

    return [lat, lng];
  };

  const currentVehicleLatLng = getCoordinatesAtProgress(simulatedProgress, activeRouteCoords);

  // Tile URL definitions
  const tileUrls = {
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
    },
    carto: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    },
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up prior map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCenter: [number, number] = [11.8, 78.5]; // Central Tamil Nadu
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 8,
      zoomControl: false, // We'll add custom positioned zoom buttons
    });

    // Add Tile Layer
    const currentConfig = tileUrls[mapTileLayer];
    const tileLayer = L.tileLayer(currentConfig.url, {
      attribution: currentConfig.attribution,
      maxZoom: 18,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Layer Group for markers
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    // 1. Draw Highway Route Polyline
    const routePoly = L.polyline(activeRouteCoords, {
      color: detourApplied ? '#10b981' : '#2563eb',
      weight: 5,
      opacity: 0.85,
      dashArray: detourApplied ? '8, 6' : undefined,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    routePolylineRef.current = routePoly;

    // Outer glow line for night highway aesthetic
    L.polyline(activeRouteCoords, {
      color: detourApplied ? '#34d399' : '#60a5fa',
      weight: 10,
      opacity: 0.25,
      lineCap: 'round',
    }).addTo(markersGroup);

    // 2. Add Origin & Destination Markers
    const originPoint = activeRouteCoords[0];
    const destPoint = activeRouteCoords[activeRouteCoords.length - 1];

    // Origin Icon
    const originIcon = L.divIcon({
      className: 'custom-hub-icon',
      html: `
        <div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 13px;">
          O
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    L.marker(originPoint, { icon: originIcon })
      .addTo(markersGroup)
      .bindPopup(
        `<div style="font-family: sans-serif; font-size: 12px;">
          <strong style="color: #059669;">ORIGIN DEPOT</strong><br/>
          <strong>${telemetry.originHub}</strong><br/>
          <span style="color: #64748b;">Departure: 06:12 AM</span>
        </div>`
      );

    // Destination Icon
    const destIcon = L.divIcon({
      className: 'custom-hub-icon',
      html: `
        <div style="background-color: #2563eb; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 13px;">
          D
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    L.marker(destPoint, { icon: destIcon })
      .addTo(markersGroup)
      .bindPopup(
        `<div style="font-family: sans-serif; font-size: 12px;">
          <strong style="color: #2563eb;">DESTINATION HUB</strong><br/>
          <strong>${telemetry.destinationHub}</strong><br/>
          <span style="color: #64748b;">Target ETA: 06:30 PM Today</span>
        </div>`
      );

    // 3. Add Intermediate Checkpoint Markers
    (telemetry.checkpoints || []).forEach((chk, index) => {
      if (!chk.lat || !chk.lng) return;
      const isCompleted = chk.status === 'completed';
      const isCurrent = chk.status === 'in_progress';

      const chkColor = isCompleted ? '#10b981' : isCurrent ? '#ef4444' : '#64748b';
      const chkIcon = L.divIcon({
        className: 'custom-chk-icon',
        html: `
          <div style="background-color: ${chkColor}; width: 18px; height: 18px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 10px; font-weight: bold;">
            ${index + 1}
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([chk.lat, chk.lng], { icon: chkIcon })
        .addTo(markersGroup)
        .bindPopup(
          `<div style="font-family: sans-serif; font-size: 11px;">
            <strong style="color: ${chkColor};">Checkpoint #${index + 1}: ${chk.name}</strong><br/>
            <span>Location: ${chk.location}</span><br/>
            <span>Facility: ${chk.tollPlazaOrDepot}</span><br/>
            <span style="color: #64748b;">Planned: ${chk.plannedTime}</span>
            ${chk.actualTime ? `<br/><b style="color: #0f172a;">Actual: ${chk.actualTime}</b>` : ''}
          </div>`
        );
    });

    // 4. Incident / Disruption Marker on Walajapet
    const hasDisruption = !!telemetry.disruptionAlert?.active && !detourApplied;
    if (hasDisruption) {
      const incidentIcon = L.divIcon({
        className: 'custom-incident-icon',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; background-color: #ef4444; border-radius: 50%; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background-color: #dc2626; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 12px; box-shadow: 0 3px 8px rgba(0,0,0,0.4);">
              !
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([TN_HUBS.ranipet.lat, TN_HUBS.ranipet.lng], { icon: incidentIcon })
        .addTo(markersGroup)
        .bindPopup(
          `<div style="font-family: sans-serif; font-size: 11px; max-width: 200px;">
            <strong style="color: #dc2626;">HIGHWAY DELAY CORRIDOR</strong><br/>
            <strong>NH 48 Walajapet Highway Section</strong><br/>
            <span>${telemetry.disruptionAlert?.issue}</span><br/>
            <strong style="color: #b91c1c;">Estimated Delay: +3.5 Hours</strong>
          </div>`
        );
    }

    // 5. Live Vehicle Truck Marker
    const vehicleIcon = L.divIcon({
      className: 'custom-vehicle-truck-icon',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: #0f172a; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; font-family: monospace; white-space: nowrap; border: 1px solid #3b82f6; box-shadow: 0 2px 6px rgba(0,0,0,0.4); margin-bottom: 2px;">
            ${telemetry.vehicleNumber} &bull; ${telemetry.speedKmph} km/h
          </div>
          <div style="background: #2563eb; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; color: #ffffff; box-shadow: 0 4px 12px rgba(37,99,235,0.6);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [120, 60],
      iconAnchor: [60, 52],
    });

    const vehicleMarker = L.marker(currentVehicleLatLng, { icon: vehicleIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: sans-serif; font-size: 12px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #1e293b; font-size: 13px;">${telemetry.vehicleNumber}</strong>
            <span style="background: #ecfdf5; color: #059669; font-weight: bold; font-size: 10px; padding: 2px 6px; border-radius: 4px;">LIVE AIS-140</span>
          </div>
          <div><b>Model:</b> ${telemetry.vehicleType}</div>
          <div><b>Driver:</b> ${telemetry.driverName} (${telemetry.driverPhone})</div>
          <div><b>Location:</b> ${telemetry.currentLocationName}</div>
          <div style="margin-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
            <div style="background: #f1f5f9; padding: 3px 6px; border-radius: 3px;">Speed: <b>${telemetry.speedKmph} km/h</b></div>
            <div style="background: #f1f5f9; padding: 3px 6px; border-radius: 3px;">Diesel: <b>${telemetry.fuelPercent}%</b></div>
          </div>
        </div>`
      );
    vehicleMarkerRef.current = vehicleMarker;

    // Fit map bounds to show route nicely
    map.fitBounds(routePoly.getBounds(), { padding: [50, 50] });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [detourApplied, isCoimbatore, isMaduraiOrTuticorin]);

  // Update Tile Layer dynamically when user switches map style
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newConfig = tileUrls[mapTileLayer];
    const newLayer = L.tileLayer(newConfig.url, {
      attribution: newConfig.attribution,
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [mapTileLayer]);

  // Update vehicle marker position whenever simulatedProgress or telemetry changes
  useEffect(() => {
    if (!vehicleMarkerRef.current) return;
    const newPos = getCoordinatesAtProgress(simulatedProgress, activeRouteCoords);
    vehicleMarkerRef.current.setLatLng(newPos);

    // Update the custom HTML icon badge with latest speed and vehicle number
    const vehicleIcon = L.divIcon({
      className: 'custom-vehicle-truck-icon',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: #0f172a; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; font-family: monospace; white-space: nowrap; border: 1px solid #3b82f6; box-shadow: 0 2px 6px rgba(0,0,0,0.4); margin-bottom: 2px;">
            ${telemetry.vehicleNumber} &bull; ${telemetry.speedKmph} km/h
          </div>
          <div style="background: #2563eb; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; color: #ffffff; box-shadow: 0 4px 12px rgba(37,99,235,0.6);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [120, 60],
      iconAnchor: [60, 52],
    });
    vehicleMarkerRef.current.setIcon(vehicleIcon);
  }, [simulatedProgress, telemetry.vehicleNumber, telemetry.speedKmph, activeRouteCoords]);

  // Simulation play loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimulatedProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return Math.min(100, prev + 1);
        });
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Save changes handler to update telemetry and persist into AppContext and shipment
  const handleSaveDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const updatedTelemetry: VehicleDriverTelemetry = {
      ...telemetry,
      vehicleNumber: editForm.vehicleNumber.trim(),
      vehicleType: editForm.vehicleType.trim(),
      transporterName: editForm.transporterName.trim(),
      speedKmph: Number(editForm.speedKmph),
      fuelPercent: Number(editForm.fuelPercent),
      engineTempCelsius: Number(editForm.engineTempCelsius),
      batteryVoltage: Number(editForm.batteryVoltage),
      odometerKm: Number(editForm.odometerKm),
      currentLocationName: editForm.currentLocationName.trim(),
      driverName: editForm.driverName.trim(),
      driverLicense: editForm.driverLicense.trim(),
      driverPhone: editForm.driverPhone.trim(),
      driverExperienceYears: Number(editForm.driverExperienceYears),
      driverBloodGroup: editForm.driverBloodGroup.trim(),
      dutyHoursToday: Number(editForm.dutyHoursToday),
      safetyScore: Number(editForm.safetyScore),
      lastPingTime: 'Just updated',
    };

    setTelemetry(updatedTelemetry);
    updateShipment(shipment.id, {
      telemetry: updatedTelemetry,
      carrierId: shipment.carrierId,
    });

    setSaveSuccessNotice('Vehicle and driver records updated and persisted successfully.');
    setShowEditModal(false);

    setTimeout(() => {
      setSaveSuccessNotice(null);
    }, 4000);
  };

  // Recenter Map on Vehicle
  const handleRecenterOnVehicle = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(currentVehicleLatLng, 12, { animate: true });
    }
  };

  // Fit Entire Route Bounds
  const handleFitRouteBounds = () => {
    if (mapInstanceRef.current && routePolylineRef.current) {
      mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });
    }
  };

  const hasDisruption = !!telemetry.disruptionAlert?.active && !detourApplied;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-w-6xl w-full mx-auto">
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold tracking-tight text-white">
                {telemetry.vehicleNumber}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>AIS 140 NavIC LIVE</span>
              </span>
              {hasDisruption && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-500 text-white flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  CORRIDOR DELAY
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Transporter: <strong>{telemetry.transporterName}</strong> &bull; Manifest #{shipment.shipmentNumber} &bull; Driver: <strong>{telemetry.driverName}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Edit Details Button */}
          <button
            onClick={() => {
              setEditForm({
                vehicleNumber: telemetry.vehicleNumber,
                vehicleType: telemetry.vehicleType,
                transporterName: telemetry.transporterName,
                speedKmph: telemetry.speedKmph,
                fuelPercent: telemetry.fuelPercent,
                engineTempCelsius: telemetry.engineTempCelsius,
                batteryVoltage: telemetry.batteryVoltage,
                odometerKm: telemetry.odometerKm,
                currentLocationName: telemetry.currentLocationName,
                driverName: telemetry.driverName,
                driverLicense: telemetry.driverLicense,
                driverPhone: telemetry.driverPhone,
                driverExperienceYears: telemetry.driverExperienceYears,
                driverBloodGroup: telemetry.driverBloodGroup,
                dutyHoursToday: telemetry.dutyHoursToday,
                safetyScore: telemetry.safetyScore,
              });
              setShowEditModal(true);
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Vehicle & Driver Details</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close live map"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Disruption Warning Strip */}
      {hasDisruption && (
        <div className="bg-red-50 border-b border-red-200 p-3 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <div>
              <span className="font-bold">Active Tamil Nadu Highway Disruption: </span>
              <span>{telemetry.disruptionAlert?.location} &mdash; {telemetry.disruptionAlert?.issue}</span>
            </div>
          </div>
          <button
            onClick={() => setShowDetourModal(true)}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded text-xs shrink-0 shadow-xs"
          >
            Review Recommended Detour (SH-116)
          </button>
        </div>
      )}

      {detourApplied && (
        <div className="bg-emerald-50 border-b border-emerald-200 p-2.5 px-6 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Detour active: Dispatched via State Highway SH-116 Arcot bypass. Delay minimized to nominal +20 mins.</span>
          </div>
          <button
            onClick={() => setDetourApplied(false)}
            className="text-[11px] text-emerald-800 underline font-medium hover:text-emerald-950"
          >
            Revert to Primary Highway (NH 48)
          </button>
        </div>
      )}

      {/* Main Content Layout: Real Map (Left) + Detailed Telematics & Driver (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        {/* Real Interactive Leaflet Tile Map Section (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 relative flex flex-col justify-between overflow-hidden">
          {/* Map Controls Floating Overlay (Top) */}
          <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 font-mono text-[11px] flex items-center gap-2 shadow-lg">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>{detourApplied ? 'Detour Corridor: SH-116 Arcot Bypass' : telemetry.highwayCorridor}</span>
            </div>

            {/* Map Layer Switcher & Re-center Buttons */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-lg">
              <button
                onClick={() => setMapTileLayer('streets')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                  mapTileLayer === 'streets' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="OpenStreetMap Street View"
              >
                Streets
              </button>
              <button
                onClick={() => setMapTileLayer('carto')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                  mapTileLayer === 'carto' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Carto Clean Road Network"
              >
                Carto
              </button>
              <button
                onClick={() => setMapTileLayer('satellite')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                  mapTileLayer === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Esri Satellite Imagery"
              >
                Satellite
              </button>

              <div className="w-px h-3.5 bg-slate-700 mx-0.5"></div>

              <button
                onClick={handleRecenterOnVehicle}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Center on Truck"
              >
                <Crosshair className="w-3.5 h-3.5 text-blue-400" />
              </button>
              <button
                onClick={handleFitRouteBounds}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Fit Route to Screen"
              >
                <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>
          </div>

          {/* Leaflet Map DOM Canvas */}
          <div
            ref={mapContainerRef}
            className="w-full h-[460px] lg:h-full min-h-[460px] z-0"
            style={{ minHeight: '460px' }}
          />

          {/* Route Transit Scrubber & Playback Bar (Bottom) */}
          <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-xs text-white shadow-2xl">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-slate-300 truncate max-w-[40%]">
                Origin: <strong className="text-white">{telemetry.originHub.split('(')[0]}</strong>
              </span>

              {/* Transit Player Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  title={isPlaying ? 'Pause transit replay' : 'Play live transit replay'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setSimulatedProgress(10);
                  }}
                  className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Reset to origin"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-xs text-blue-400 font-bold px-1">
                  {simulatedProgress}% Transit Complete
                </span>
              </div>

              <span className="text-slate-300 truncate max-w-[40%] text-right">
                Destination: <strong className="text-white">{telemetry.destinationHub.split('(')[0]}</strong>
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={simulatedProgress}
              onChange={(e) => {
                setIsPlaying(false);
                setSimulatedProgress(Number(e.target.value));
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>GPS Fix: {currentVehicleLatLng[0].toFixed(4)}°N, {currentVehicleLatLng[1].toFixed(4)}°E</span>
              <span>Speed: {telemetry.speedKmph} km/h &bull; Fuel: {telemetry.fuelPercent}% &bull; Odo: {telemetry.odometerKm} km</span>
              <span>Total Distance: {telemetry.totalDistanceKm} km</span>
            </div>
          </div>
        </div>

        {/* Telematics, Driver, & Checkpoint Panels (Right 5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200">
          <div>
            {/* Nav Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setActiveTab('telematics')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'telematics'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Telematics</span>
                </button>

                <button
                  onClick={() => setActiveTab('driver')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'driver'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Driver</span>
                </button>

                <button
                  onClick={() => setActiveTab('checkpoints')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'checkpoints'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Tolls ({telemetry.checkpoints?.length || 0})</span>
                </button>
              </div>

              {/* In-tab Quick Edit Trigger */}
              <button
                onClick={() => {
                  setEditForm({
                    vehicleNumber: telemetry.vehicleNumber,
                    vehicleType: telemetry.vehicleType,
                    transporterName: telemetry.transporterName,
                    speedKmph: telemetry.speedKmph,
                    fuelPercent: telemetry.fuelPercent,
                    engineTempCelsius: telemetry.engineTempCelsius,
                    batteryVoltage: telemetry.batteryVoltage,
                    odometerKm: telemetry.odometerKm,
                    currentLocationName: telemetry.currentLocationName,
                    driverName: telemetry.driverName,
                    driverLicense: telemetry.driverLicense,
                    driverPhone: telemetry.driverPhone,
                    driverExperienceYears: telemetry.driverExperienceYears,
                    driverBloodGroup: telemetry.driverBloodGroup,
                    dutyHoursToday: telemetry.dutyHoursToday,
                    safetyScore: telemetry.safetyScore,
                  });
                  setShowEditModal(true);
                }}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                title="Edit name, vehicle & driver metrics"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {/* TAB 1: VEHICLE TELEMATICS */}
            {activeTab === 'telematics' && (
              <div className="space-y-3.5 pt-4 text-xs">
                {/* Vehicle Specs Header */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                    <span>Registered Commercial Vehicle</span>
                    <span className="text-blue-600 font-mono">GPS-ID: {telemetry.gpsDeviceId}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{telemetry.vehicleType}</div>
                  <div className="flex items-center gap-3 text-slate-600 mt-1.5 font-mono text-[11px]">
                    <span>Plate: <strong className="text-slate-900">{telemetry.vehicleNumber}</strong></span>
                    <span>&bull;</span>
                    <span>Transporter: <strong className="text-slate-900">{telemetry.transporterName}</strong></span>
                    <span>&bull;</span>
                    <span>Year: <strong>{telemetry.vehicleModelYear}</strong></span>
                  </div>
                </div>

                {/* Sensor Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[10px] uppercase font-semibold">Speed</span>
                      <Gauge className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-900">
                      {hasDisruption ? 0 : telemetry.speedKmph}
                      <span className="text-xs font-normal text-slate-500 ml-1">km/h</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {hasDisruption ? 'Vehicle stationary (Queued)' : 'Permissible limit (≤65 km/h)'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[10px] uppercase font-semibold">Fuel Tank</span>
                      <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-900">
                      {telemetry.fuelPercent}%
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                      Sufficient for ~350 km
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[10px] uppercase font-semibold">Engine Temp</span>
                      <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-900">
                      {telemetry.engineTempCelsius}°C
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Optimal operating band
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[10px] uppercase font-semibold">Battery / Alt</span>
                      <BatteryCharging className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-900">
                      {telemetry.batteryVoltage} V
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Odometer: {telemetry.odometerKm} km
                    </span>
                  </div>
                </div>

                {/* GPS Coordinates Location */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 text-[11px]">
                  <div className="flex items-center justify-between text-blue-900 font-semibold mb-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Current Real-World Location</span>
                    </div>
                    <span className="text-[10px] bg-blue-200/60 text-blue-900 px-1.5 py-0.5 rounded font-mono">
                      NavIC Geo-Fix
                    </span>
                  </div>
                  <div className="text-slate-800 font-medium">{telemetry.currentLocationName}</div>
                  <div className="font-mono text-slate-500 text-[10px] mt-0.5">
                    Lat: {currentVehicleLatLng[0].toFixed(4)}°N &bull; Lng: {currentVehicleLatLng[1].toFixed(4)}°E
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DRIVER PROFILE */}
            {activeTab === 'driver' && (
              <div className="space-y-3.5 pt-4 text-xs">
                {/* Driver Identity Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                    {telemetry.driverName
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2) || 'DR'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900">{telemetry.driverName}</div>
                    <div className="text-slate-500 font-mono text-[11px]">License: {telemetry.driverLicense}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Tamil Nadu Heavy Vehicle Badge &bull; {telemetry.driverExperienceYears} Yrs Exp
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Driver Contact</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">{telemetry.driverPhone}</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Blood Group</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{telemetry.driverBloodGroup}</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Duty Hours Today</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">{telemetry.dutyHoursToday} Hours</span>
                    <span className="text-[9px] text-emerald-600">Compliant (Max 8.0h limit)</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Safety Score</span>
                    <span className="font-mono font-bold text-emerald-600 mt-0.5 block">{telemetry.safetyScore} / 100</span>
                    <span className="text-[9px] text-slate-400">Zero sudden braking</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={`tel:${telemetry.driverPhone.replace(/\s+/g, '')}`}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Driver Directly</span>
                  </a>
                  <button
                    onClick={() => {
                      setEditForm({
                        vehicleNumber: telemetry.vehicleNumber,
                        vehicleType: telemetry.vehicleType,
                        transporterName: telemetry.transporterName,
                        speedKmph: telemetry.speedKmph,
                        fuelPercent: telemetry.fuelPercent,
                        engineTempCelsius: telemetry.engineTempCelsius,
                        batteryVoltage: telemetry.batteryVoltage,
                        odometerKm: telemetry.odometerKm,
                        currentLocationName: telemetry.currentLocationName,
                        driverName: telemetry.driverName,
                        driverLicense: telemetry.driverLicense,
                        driverPhone: telemetry.driverPhone,
                        driverExperienceYears: telemetry.driverExperienceYears,
                        driverBloodGroup: telemetry.driverBloodGroup,
                        dutyHoursToday: telemetry.dutyHoursToday,
                        safetyScore: telemetry.safetyScore,
                      });
                      setShowEditModal(true);
                    }}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: CHECKPOINTS & TOLL PLAZAS */}
            {activeTab === 'checkpoints' && (
              <div className="space-y-2.5 pt-4 text-xs max-h-[300px] overflow-y-auto pr-1">
                {(telemetry.checkpoints || []).map((chk, idx) => {
                  const isDone = chk.status === 'completed';
                  const isCurrent = chk.status === 'in_progress';

                  return (
                    <div
                      key={chk.id || idx}
                      className="flex items-start gap-3 relative pb-2.5 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                      onClick={() => {
                        if (chk.lat && chk.lng && mapInstanceRef.current) {
                          mapInstanceRef.current.setView([chk.lat, chk.lng], 12, { animate: true });
                        }
                      }}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                            ✓
                          </div>
                        ) : isCurrent ? (
                          <div className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px] animate-pulse">
                            ●
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${isCurrent ? 'text-red-700 font-bold' : 'text-slate-900'}`}>
                            {chk.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{chk.plannedTime}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {chk.location} &bull; {chk.tollPlazaOrDepot}
                        </div>
                        {chk.actualTime && (
                          <div className={`text-[10px] font-mono mt-0.5 ${isCurrent ? 'text-red-600 font-semibold' : 'text-emerald-700'}`}>
                            Actual: {chk.actualTime}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2 mt-4 text-xs">
            <span className="text-slate-500 font-mono text-[11px]">
              Last Ping: {telemetry.lastPingTime}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditForm({
                    vehicleNumber: telemetry.vehicleNumber,
                    vehicleType: telemetry.vehicleType,
                    transporterName: telemetry.transporterName,
                    speedKmph: telemetry.speedKmph,
                    fuelPercent: telemetry.fuelPercent,
                    engineTempCelsius: telemetry.engineTempCelsius,
                    batteryVoltage: telemetry.batteryVoltage,
                    odometerKm: telemetry.odometerKm,
                    currentLocationName: telemetry.currentLocationName,
                    driverName: telemetry.driverName,
                    driverLicense: telemetry.driverLicense,
                    driverPhone: telemetry.driverPhone,
                    driverExperienceYears: telemetry.driverExperienceYears,
                    driverBloodGroup: telemetry.driverBloodGroup,
                    dutyHoursToday: telemetry.dutyHoursToday,
                    safetyScore: telemetry.safetyScore,
                  });
                  setShowEditModal(true);
                }}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit All Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL EDIT VEHICLE & DRIVER DETAILS MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <span>Edit Vehicle, Driver & Telemetry Specifications</span>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="py-4 space-y-4">
              {/* Section 1: Vehicle Information */}
              <div>
                <h4 className="text-xs font-bold uppercase text-blue-700 tracking-wider mb-2 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Commercial Vehicle Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Vehicle Registration Plate *
                    </label>
                    <input
                      type="text"
                      value={editForm.vehicleNumber}
                      onChange={(e) => setEditForm({ ...editForm, vehicleNumber: e.target.value })}
                      required
                      placeholder="e.g. TN-04-BJ-8821"
                      className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Vehicle Model / Make *
                    </label>
                    <input
                      type="text"
                      value={editForm.vehicleType}
                      onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}
                      required
                      placeholder="e.g. Ashok Leyland 2820-6x2 Multi-Axle Hauler"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Transporter / Fleet Operator *
                    </label>
                    <input
                      type="text"
                      value={editForm.transporterName}
                      onChange={(e) => setEditForm({ ...editForm, transporterName: e.target.value })}
                      required
                      placeholder="e.g. TVS Supply Chain Logistics"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Current Location Description
                    </label>
                    <input
                      type="text"
                      value={editForm.currentLocationName}
                      onChange={(e) => setEditForm({ ...editForm, currentLocationName: e.target.value })}
                      placeholder="e.g. NH 48 Walajapet Highway Section"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Real-time Telemetry Metrics */}
              <div>
                <h4 className="text-xs font-bold uppercase text-blue-700 tracking-wider mb-2 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Real-Time Sensor Metrics</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Speed (km/h)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={editForm.speedKmph}
                      onChange={(e) => setEditForm({ ...editForm, speedKmph: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Diesel Fuel (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.fuelPercent}
                      onChange={(e) => setEditForm({ ...editForm, fuelPercent: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Engine Temp (°C)
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="130"
                      value={editForm.engineTempCelsius}
                      onChange={(e) => setEditForm({ ...editForm, engineTempCelsius: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Battery (V)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="12"
                      max="32"
                      value={editForm.batteryVoltage}
                      onChange={(e) => setEditForm({ ...editForm, batteryVoltage: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Driver Details */}
              <div>
                <h4 className="text-xs font-bold uppercase text-blue-700 tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Driver Identification & Credentials</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Driver Full Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.driverName}
                      onChange={(e) => setEditForm({ ...editForm, driverName: e.target.value })}
                      required
                      placeholder="e.g. K. Senthil Kumar"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Commercial Driving License *
                    </label>
                    <input
                      type="text"
                      value={editForm.driverLicense}
                      onChange={(e) => setEditForm({ ...editForm, driverLicense: e.target.value })}
                      required
                      placeholder="e.g. TN-02-2016-0038192"
                      className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="text"
                      value={editForm.driverPhone}
                      onChange={(e) => setEditForm({ ...editForm, driverPhone: e.target.value })}
                      required
                      placeholder="e.g. +91 98401 23456"
                      className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={editForm.driverExperienceYears}
                      onChange={(e) => setEditForm({ ...editForm, driverExperienceYears: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={editForm.driverBloodGroup}
                      onChange={(e) => setEditForm({ ...editForm, driverBloodGroup: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Safety Score (0 - 100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.safetyScore}
                      onChange={(e) => setEditForm({ ...editForm, safetyScore: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detour Recommendation Modal */}
      {showDetourModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Highway Incident Detour Authorization</span>
              </div>
              <button
                onClick={() => setShowDetourModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <div className="py-3 space-y-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-900">
                <div className="font-bold">Incident on NH 48 Walajapet Highway:</div>
                <p className="mt-1">{telemetry.disruptionAlert?.issue}</p>
                <div className="mt-2 font-mono font-bold text-red-700">Estimated Delay Impact: +3.5 Hours</div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950">
                <div className="font-bold text-emerald-800">Autonomous Detour Recommendation:</div>
                <p className="mt-1">
                  {telemetry.disruptionAlert?.suggestedDetour ||
                    'Divert via SH-116 Arcot-Cheyyar bypass to rejoin NH 44 at Tiruvannamalai.'}
                </p>
                <div className="mt-2 font-semibold text-emerald-700">
                  Expected Time Savings: 3.0 Hours saved &bull; Added distance: 18 km
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDetourModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setDetourApplied(true);
                  setShowDetourModal(false);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs"
              >
                Authorize Detour & Send to Driver In-Cab GPS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
