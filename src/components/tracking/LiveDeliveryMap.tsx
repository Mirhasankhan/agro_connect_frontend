"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Navigation,
  Compass,
  MapPin,
  RefreshCw,
  Layers,
  AlertCircle,
  Clock,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  loadGoogleMaps,
  AGRO_CENTRAL_HUB_COORDS,
  geocodeAddress,
} from "@/lib/googleMaps";

export interface LiveDeliveryMapProps {
  deliveryId: string;
  driver?: {
    id?: string;
    fullName?: string;
    phoneNumber?: string | null;
    profileImage?: string | null;
    vehicleType?: string | null;
    registrationNumber?: string | null;
  } | null;
  shippingAddress?: {
    addressLine?: string;
    city?: string;
    postCode?: string | null;
    instruction?: string | null;
  } | null;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  currentHeading?: number | null;
  currentSpeed?: number | null;
  isTracking?: boolean;
  status?: string;
  lastUpdated?: Date | null;
  className?: string;
  height?: string;
  showControls?: boolean;
  onRefresh?: () => void;
}

export default function LiveDeliveryMap({
  driver,
  shippingAddress,
  currentLatitude,
  currentLongitude,
  currentHeading,
  currentSpeed,
  isTracking = false,
  status = "Assigned",
  lastUpdated,
  className = "",
  height = "420px",
  showControls = true,
  onRefresh,
}: LiveDeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const hubMarkerRef = useRef<google.maps.Marker | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>("Awaiting update");

  // Geocode delivery address to place destination pin
  useEffect(() => {
    let isMounted = true;
    const resolveDestination = async () => {
      if (!shippingAddress) return;
      const fullAddress = [
        shippingAddress.addressLine,
        shippingAddress.city,
        shippingAddress.postCode,
        "Côte d'Ivoire",
      ]
        .filter(Boolean)
        .join(", ");

      const coords = await geocodeAddress(fullAddress);
      if (isMounted && coords) {
        setDestinationCoords(coords);
      } else if (isMounted) {
        // Fallback default destination in Abidjan if geocode fails
        setDestinationCoords({
          lat: AGRO_CENTRAL_HUB_COORDS.lat + 0.035,
          lng: AGRO_CENTRAL_HUB_COORDS.lng + 0.042,
        });
      }
    };

    resolveDestination();
    return () => {
      isMounted = false;
    };
  }, [shippingAddress]);

  // Update time-ago ticker
  useEffect(() => {
    const updateTicker = () => {
      if (!lastUpdated) {
        setTimeAgo(isTracking ? "Live" : "Standby");
        return;
      }
      const seconds = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
      if (seconds < 5) setTimeAgo("Updated just now");
      else if (seconds < 60) setTimeAgo(`Updated ${seconds}s ago`);
      else {
        const mins = Math.floor(seconds / 60);
        setTimeAgo(`Updated ${mins}m ago`);
      }
    };

    updateTicker();
    const interval = setInterval(updateTicker, 3000);
    return () => clearInterval(interval);
  }, [lastUpdated, isTracking]);

  // Initialize Google Map
  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps()
      .then((googleMaps) => {
        if (!isMounted || !mapContainerRef.current) return;

        // Custom clean map styling
        const mapStyles: google.maps.MapTypeStyle[] = [
          { featureType: "water", stylers: [{ color: "#dbeafe" }, { visibility: "on" }] },
          { featureType: "landscape", stylers: [{ color: "#f8fafc" }] },
          { featureType: "road", stylers: [{ saturation: -20 }, { lightness: 20 }] },
          { featureType: "road.highway", stylers: [{ color: "#fed7aa" }, { visibility: "simplified" }] },
          { featureType: "road.arterial", stylers: [{ color: "#ffffff" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "simplified" }] },
        ];

        const initialCenter =
          typeof currentLatitude === "number" && typeof currentLongitude === "number"
            ? { lat: currentLatitude, lng: currentLongitude }
            : destinationCoords || AGRO_CENTRAL_HUB_COORDS;

        const map = new googleMaps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 14,
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: googleMaps.ControlPosition.RIGHT_BOTTOM,
          },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new googleMaps.InfoWindow();

        // 1. Hub Marker
        const hubIcon = {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="#047857" stroke="#ffffff" stroke-width="2.5"/>
              <path d="M12 22 L18 11 L24 22 Z" fill="#ffffff"/>
              <rect x="15" y="20" width="6" height="6" fill="#047857"/>
            </svg>
          `),
          scaledSize: new googleMaps.Size(36, 36),
          anchor: new googleMaps.Point(18, 18),
        };

        hubMarkerRef.current = new googleMaps.Marker({
          position: AGRO_CENTRAL_HUB_COORDS,
          map,
          title: "Agro Connect Central Hub",
          icon: hubIcon,
        });

        // 2. Polyline for path
        routePolylineRef.current = new googleMaps.Polyline({
          map,
          strokeColor: "#059669",
          strokeOpacity: 0.85,
          strokeWeight: 4,
          geodesic: true,
        });

        setMapLoaded(true);
      })
      .catch((err) => {
        if (isMounted) {
          setLoadError(err.message || "Failed to load Google Maps");
        }
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Destination Marker when coords become available
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !destinationCoords || !window.google?.maps) return;

    if (!destinationMarkerRef.current) {
      const destIcon = {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
            <path d="M19 0 C8.5 0 0 8.5 0 19 C0 31.5 19 46 19 46 C19 46 38 31.5 38 19 C38 8.5 29.5 0 19 0 Z" fill="#e11d48" stroke="#ffffff" stroke-width="2"/>
            <circle cx="19" cy="18" r="8" fill="#ffffff"/>
            <path d="M16 14 L22 14 L22 22 L16 22 Z" fill="#e11d48"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(34, 42),
        anchor: new window.google.maps.Point(17, 42),
      };

      destinationMarkerRef.current = new window.google.maps.Marker({
        position: destinationCoords,
        map: mapInstanceRef.current,
        title: "Delivery Destination",
        icon: destIcon,
      });

      const destInfoContent = `
        <div style="font-family:sans-serif;padding:6px;max-width:200px;">
          <div style="font-weight:bold;color:#1e293b;font-size:12px;margin-bottom:2px;">Delivery Destination</div>
          <div style="font-size:11px;color:#64748b;">${shippingAddress?.addressLine || "Customer Address"}</div>
          <div style="font-size:10px;color:#059669;font-weight:600;margin-top:4px;">${shippingAddress?.city || ""}</div>
        </div>
      `;

      destinationMarkerRef.current.addListener("click", () => {
        if (infoWindowRef.current && mapInstanceRef.current && destinationMarkerRef.current) {
          infoWindowRef.current.setContent(destInfoContent);
          infoWindowRef.current.open(mapInstanceRef.current, destinationMarkerRef.current);
        }
      });
    } else {
      destinationMarkerRef.current.setPosition(destinationCoords);
    }
  }, [mapLoaded, destinationCoords, shippingAddress]);

  // Update Driver Marker & Position
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google?.maps) return;

    const hasDriverCoords =
      typeof currentLatitude === "number" &&
      typeof currentLongitude === "number" &&
      !isNaN(currentLatitude) &&
      !isNaN(currentLongitude);

    if (!hasDriverCoords) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setMap(null);
        driverMarkerRef.current = null;
      }
      return;
    }

    const driverPos = { lat: currentLatitude!, lng: currentLongitude! };
    const headingDegrees = typeof currentHeading === "number" ? currentHeading : 0;

    // Custom modern vehicle marker with rotation arrow & pulse halo
    const driverSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
        <defs>
          <radialGradient id="halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#064e3b" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- Pulsing radar halo -->
        <circle cx="28" cy="28" r="26" fill="url(#halo)"/>
        <!-- Vehicle circle container with heading pointer -->
        <g transform="rotate(${headingDegrees} 28 28)">
          <circle cx="28" cy="28" r="16" fill="#065f46" stroke="#ffffff" stroke-width="2.5" filter="url(#shadow)"/>
          <!-- Heading direction indicator notch -->
          <polygon points="28,8 24,14 32,14" fill="#34d399"/>
          <!-- Truck silhouette -->
          <g transform="translate(19, 19) scale(0.75)" fill="#ffffff">
            <path d="M1 3h15v13H1z"/>
            <path d="M16 8h4l3 4v4h-7z"/>
            <circle cx="5.5" cy="17.5" r="2.5" fill="#10b981"/>
            <circle cx="18.5" cy="17.5" r="2.5" fill="#10b981"/>
          </g>
        </g>
      </svg>
    `;

    const driverIcon = {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(driverSvg),
      scaledSize: new window.google.maps.Size(56, 56),
      anchor: new window.google.maps.Point(28, 28),
    };

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = new window.google.maps.Marker({
        position: driverPos,
        map: mapInstanceRef.current,
        title: driver?.fullName || "Assigned Driver",
        icon: driverIcon,
        zIndex: 999,
      });

      const infoContent = `
        <div style="font-family:sans-serif;padding:8px;min-width:180px;">
          <div style="font-size:12px;font-weight:bold;color:#065f46;">🚚 ${driver?.fullName || "Delivery Driver"}</div>
          <div style="font-size:11px;color:#475569;margin-top:2px;">Vehicle: ${driver?.vehicleType || "Fleet Transport"} (${driver?.registrationNumber || "Certified"})</div>
          ${typeof currentSpeed === "number" ? `<div style="font-size:11px;font-weight:600;color:#0284c7;margin-top:4px;">Speed: ${(currentSpeed * 3.6).toFixed(0)} km/h</div>` : ""}
          <div style="font-size:10px;color:#94a3b8;margin-top:4px;">Live tracking active</div>
        </div>
      `;

      driverMarkerRef.current.addListener("click", () => {
        if (infoWindowRef.current && mapInstanceRef.current && driverMarkerRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(mapInstanceRef.current, driverMarkerRef.current);
        }
      });
    } else {
      driverMarkerRef.current.setPosition(driverPos);
      driverMarkerRef.current.setIcon(driverIcon);
    }

    // Update Polyline Route
    if (routePolylineRef.current) {
      const pathPoints: google.maps.LatLngLiteral[] = [AGRO_CENTRAL_HUB_COORDS, driverPos];
      if (destinationCoords) {
        pathPoints.push(destinationCoords);
      }
      routePolylineRef.current.setPath(pathPoints);
    }
  }, [
    mapLoaded,
    currentLatitude,
    currentLongitude,
    currentHeading,
    currentSpeed,
    driver,
    destinationCoords,
  ]);

  // Center on Driver or Route
  const handleCenterOnDriver = useCallback(() => {
    if (!mapInstanceRef.current) return;
    if (typeof currentLatitude === "number" && typeof currentLongitude === "number") {
      mapInstanceRef.current.panTo({ lat: currentLatitude, lng: currentLongitude });
      mapInstanceRef.current.setZoom(16);
    } else if (destinationCoords) {
      mapInstanceRef.current.panTo(destinationCoords);
      mapInstanceRef.current.setZoom(14);
    }
  }, [currentLatitude, currentLongitude, destinationCoords]);

  const handleFitRouteBounds = useCallback(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    const bounds = new window.google.maps.LatLngBounds();

    bounds.extend(AGRO_CENTRAL_HUB_COORDS);

    if (destinationCoords) {
      bounds.extend(destinationCoords);
    }

    if (typeof currentLatitude === "number" && typeof currentLongitude === "number") {
      bounds.extend({ lat: currentLatitude, lng: currentLongitude });
    }

    mapInstanceRef.current.fitBounds(bounds, 60);
  }, [destinationCoords, currentLatitude, currentLongitude]);

  const toggleTraffic = () => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new window.google.maps.TrafficLayer();
    }
    if (showTraffic) {
      trafficLayerRef.current.setMap(null);
      setShowTraffic(false);
    } else {
      trafficLayerRef.current.setMap(mapInstanceRef.current);
      setShowTraffic(true);
    }
  };

  const isDelivered = status === "Delivered";
  const hasLiveCoords =
    typeof currentLatitude === "number" && typeof currentLongitude === "number";

  if (loadError) {
    return (
      <div className={`rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center space-y-3 ${className}`}>
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h4 className="text-sm font-bold text-rose-900">Map Interface Offline</h4>
        <p className="text-xs text-rose-700 max-w-sm mx-auto">{loadError}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn-secondary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-sm transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none h-screen w-screen" : className
      }`}
      style={{ height: isFullscreen ? "100vh" : height }}
    >
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading Placeholder */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-xs gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-600">Initializing Live GPS Map...</span>
        </div>
      )}

      {/* Top HUD: Live Telemetry Status Pill */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-md text-xs font-bold text-slate-800">
          {isDelivered ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Delivery Completed</span>
            </>
          ) : isTracking && hasLiveCoords ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-emerald-700 font-extrabold tracking-wide uppercase text-[11px]">
                Live GPS
              </span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-slate-600 font-medium text-[11px]">{timeAgo}</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-amber-800 font-semibold text-[11px]">
                {driver ? "Driver Standby" : "Awaiting Driver"}
              </span>
            </>
          )}
        </div>

        {/* Speed indicator if moving */}
        {isTracking && typeof currentSpeed === "number" && currentSpeed > 0.5 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white shadow-md text-xs font-mono font-bold">
            <Compass className="w-3 h-3 text-emerald-400 animate-spin" />
            <span>{(currentSpeed * 3.6).toFixed(0)} km/h</span>
          </div>
        )}
      </div>

      {/* Top Right HUD: Map Controls */}
      {showControls && mapLoaded && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={handleCenterOnDriver}
            className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 border border-slate-200 shadow-md transition-all active:scale-95"
            title="Center on Driver Position"
          >
            <Navigation className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            type="button"
            onClick={handleFitRouteBounds}
            className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 border border-slate-200 shadow-md transition-all active:scale-95"
            title="Fit Full Route"
          >
            <MapPin className="w-4 h-4 text-slate-600" />
          </button>

          <button
            type="button"
            onClick={toggleTraffic}
            className={`p-2 rounded-xl border shadow-md transition-all active:scale-95 ${
              showTraffic
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-white/95 text-slate-700 border-slate-200 hover:bg-white"
            }`}
            title="Toggle Traffic Layer"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 border border-slate-200 shadow-md transition-all active:scale-95"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Bottom Standby Banner if Driver hasn't clicked Start Navigation */}
      {!isDelivered && !isTracking && (
        <div className="absolute bottom-3 left-3 right-3 z-10 max-w-lg mx-auto p-3 rounded-xl bg-white/95 backdrop-blur-md border border-amber-200 shadow-lg text-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-amber-950 block">Live Navigation Standby</span>
            <p className="text-[11px] text-amber-800 leading-tight">
              {driver
                ? `${driver.fullName} is assigned. Real-time GPS coordinates stream once navigation starts.`
                : "A certified driver will be assigned to fulfill this regional delivery."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export { LiveDeliveryMap };
