import { useState, useEffect, useRef, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { toast } from "react-toastify";

export interface DriverCoords {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  altitude?: number | null;
}

export type TrackingStatus =
  | "Not Started"
  | "Connecting"
  | "Live"
  | "Connection Lost"
  | "Stopped";

export interface UseDriverGeoTrackerOptions {
  deliveryId: string;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  initialIsTracking?: boolean;
  deliveryStatus?: string;
  onLocationUpdate?: (coords: DriverCoords) => void;
}

export function useDriverGeoTracker({
  deliveryId,
  initialLatitude,
  initialLongitude,
  initialIsTracking = false,
  deliveryStatus = "Assigned",
  onLocationUpdate,
}: UseDriverGeoTrackerOptions) {
  const [isNavigating, setIsNavigating] = useState<boolean>(initialIsTracking);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>(
    initialIsTracking ? "Live" : "Not Started"
  );
  const [coords, setCoords] = useState<DriverCoords | null>(
    typeof initialLatitude === "number" && typeof initialLongitude === "number"
      ? {
          latitude: initialLatitude,
          longitude: initialLongitude,
          heading: null,
          speed: null,
          accuracy: null,
        }
      : null
  );
  const [lastEmittedAt, setLastEmittedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  const lastEmitTimeRef = useRef<number>(0);
  const deliveryIdRef = useRef(deliveryId);
  deliveryIdRef.current = deliveryId;
  const isNavigatingRef = useRef(isNavigating);
  isNavigatingRef.current = isNavigating;

  // Request screen wake lock to keep display active while navigating
  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        wakeLockRef.current.addEventListener("release", () => {
          wakeLockRef.current = null;
        });
      }
    } catch {
      // Wake lock request failed or not permitted; non-critical
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // ignore
      }
      wakeLockRef.current = null;
    }
  }, []);

  // Stop tracking handler
  const stopNavigation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    releaseWakeLock();

    const socket = getSocket();
    if (socket.connected && deliveryIdRef.current) {
      socket.emit("tracking:stop", { deliveryId: deliveryIdRef.current });
    }

    setIsNavigating(false);
    setTrackingStatus("Stopped");
    toast.info("Navigation and live location transmission stopped.");
  }, [releaseWakeLock]);

  // Start tracking handler
  const startNavigation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser");
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    if (deliveryStatus === "Delivered") {
      toast.warning("Delivery is already completed. Navigation cannot be started.");
      return;
    }

    setError(null);
    setTrackingStatus("Connecting");
    setIsNavigating(true);

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    requestWakeLock();

    // 1. Get quick initial position fix
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, heading, speed, accuracy, altitude } = pos.coords;
        const currentCoords: DriverCoords = {
          latitude,
          longitude,
          heading: heading ?? null,
          speed: speed ?? null,
          accuracy: accuracy ?? null,
          altitude: altitude ?? null,
        };

        setCoords(currentCoords);
        setTrackingStatus("Live");
        setLastEmittedAt(new Date());
        lastEmitTimeRef.current = Date.now();

        // Emit start tracking event
        socket.emit("tracking:start", {
          deliveryId: deliveryIdRef.current,
          latitude,
          longitude,
          heading: heading ?? undefined,
          speed: speed ?? undefined,
        });

        onLocationUpdate?.(currentCoords);
        toast.success("Live navigation started. Transmitting GPS updates.");
      },
      (err) => {
        let errMsg = "Unable to retrieve GPS location";
        if (err.code === err.PERMISSION_DENIED) {
          errMsg = "Location permission denied. Please enable GPS permissions in browser settings.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errMsg = "GPS position unavailable. Ensure device location is switched on.";
        } else if (err.code === err.TIMEOUT) {
          errMsg = "Location request timed out. Retrying...";
        }
        setError(errMsg);
        setTrackingStatus("Connection Lost");
        toast.error(errMsg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 }
    );

    // 2. Start continuous GPS watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading, speed, accuracy, altitude } = pos.coords;
        const currentCoords: DriverCoords = {
          latitude,
          longitude,
          heading: heading ?? null,
          speed: speed ?? null,
          accuracy: accuracy ?? null,
          altitude: altitude ?? null,
        };

        setCoords(currentCoords);
        setTrackingStatus("Live");
        setError(null);

        // Throttle emission to once every 1800ms
        const now = Date.now();
        if (now - lastEmitTimeRef.current >= 1800) {
          lastEmitTimeRef.current = now;
          setLastEmittedAt(new Date());

          socket.emit("tracking:location", {
            deliveryId: deliveryIdRef.current,
            latitude,
            longitude,
            heading: heading ?? undefined,
            speed: speed ?? undefined,
            timestamp: new Date().toISOString(),
          });
        }

        onLocationUpdate?.(currentCoords);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission revoked.");
          setTrackingStatus("Stopped");
          stopNavigation();
        } else {
          setTrackingStatus("Connection Lost");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
      }
    );
  }, [deliveryStatus, onLocationUpdate, requestWakeLock, stopNavigation]);

  // Handle visibility change: re-acquire wake lock if active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isNavigatingRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [requestWakeLock]);

  // Auto-stop tracking when delivery completes or unmounts
  useEffect(() => {
    if (deliveryStatus === "Delivered" && isNavigatingRef.current) {
      stopNavigation();
    }
  }, [deliveryStatus, stopNavigation]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  // Monitor socket reconnection while navigating
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      if (isNavigatingRef.current && deliveryIdRef.current) {
        setTrackingStatus("Live");
        socket.emit("tracking:start", {
          deliveryId: deliveryIdRef.current,
        });
      }
    };

    const handleDisconnect = () => {
      if (isNavigatingRef.current) {
        setTrackingStatus("Connection Lost");
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return {
    isNavigating,
    trackingStatus,
    coords,
    lastEmittedAt,
    error,
    startNavigation,
    stopNavigation,
  };
}
