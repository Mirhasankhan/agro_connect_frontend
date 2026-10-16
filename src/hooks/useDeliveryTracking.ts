import { useEffect, useState, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";

export interface DeliveryTrackingState {
  deliveryId: string;
  startLatitude: number | null;
  startLongitude: number | null;
  latitude: number | null;
  longitude: number | null;
  heading: number | null;
  speed: number | null;
  isTracking: boolean;
  status: string;
  lastUpdated: Date | null;
  connectionState: "connecting" | "connected" | "disconnected" | "reconnecting";
  error: string | null;
  reconnect: () => void;
}

export interface UseDeliveryTrackingOptions {
  initialStartLatitude?: number | null;
  initialStartLongitude?: number | null;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  initialHeading?: number | null;
  initialSpeed?: number | null;
  initialIsTracking?: boolean;
  initialStatus?: string;
  initialUpdatedAt?: string | null;
}

export function useDeliveryTracking(
  deliveryId?: string,
  options?: UseDeliveryTrackingOptions
): DeliveryTrackingState {
  const [startLatitude, setStartLatitude] = useState<number | null>(
    options?.initialStartLatitude ?? null
  );
  const [startLongitude, setStartLongitude] = useState<number | null>(
    options?.initialStartLongitude ?? null
  );
  const [latitude, setLatitude] = useState<number | null>(
    options?.initialLatitude ?? null
  );
  const [longitude, setLongitude] = useState<number | null>(
    options?.initialLongitude ?? null
  );
  const [heading, setHeading] = useState<number | null>(
    options?.initialHeading ?? null
  );
  const [speed, setSpeed] = useState<number | null>(
    options?.initialSpeed ?? null
  );
  const [isTracking, setIsTracking] = useState<boolean>(
    options?.initialIsTracking ?? false
  );
  const [status, setStatus] = useState<string>(
    options?.initialStatus ?? "Assigned"
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    options?.initialUpdatedAt ? new Date(options.initialUpdatedAt) : null
  );
  const [connectionState, setConnectionState] = useState<
    "connecting" | "connected" | "disconnected" | "reconnecting"
  >("connecting");
  const [error, setError] = useState<string | null>(null);

  // Sync initial options if they update from parent query
  useEffect(() => {
    if (typeof options?.initialStartLatitude === "number") {
      setStartLatitude(options.initialStartLatitude);
    }
    if (typeof options?.initialStartLongitude === "number") {
      setStartLongitude(options.initialStartLongitude);
    }
    if (typeof options?.initialLatitude === "number") {
      setLatitude(options.initialLatitude);
    }
    if (typeof options?.initialLongitude === "number") {
      setLongitude(options.initialLongitude);
    }
    if (typeof options?.initialHeading === "number") {
      setHeading(options.initialHeading);
    }
    if (typeof options?.initialSpeed === "number") {
      setSpeed(options.initialSpeed);
    }
    if (typeof options?.initialIsTracking === "boolean") {
      setIsTracking(options.initialIsTracking);
    }
    if (options?.initialStatus) {
      setStatus(options.initialStatus);
    }
    if (options?.initialUpdatedAt) {
      setLastUpdated(new Date(options.initialUpdatedAt));
    }
  }, [
    options?.initialStartLatitude,
    options?.initialStartLongitude,
    options?.initialLatitude,
    options?.initialLongitude,
    options?.initialHeading,
    options?.initialSpeed,
    options?.initialIsTracking,
    options?.initialStatus,
    options?.initialUpdatedAt,
  ]);

  const deliveryIdRef = useRef(deliveryId);
  deliveryIdRef.current = deliveryId;

  const subscribeToDelivery = useCallback(() => {
    if (!deliveryIdRef.current) return;
    const socket = getSocket();
    setError(null);

    if (socket.connected) {
      setConnectionState("connected");
      socket.emit("tracking:subscribe", { deliveryId: deliveryIdRef.current });
    } else {
      setConnectionState("connecting");
      socket.connect();
    }
  }, []);

  const reconnect = useCallback(() => {
    const socket = getSocket();
    if (!socket.connected) {
      setConnectionState("connecting");
      socket.connect();
    } else if (deliveryIdRef.current) {
      socket.emit("tracking:subscribe", { deliveryId: deliveryIdRef.current });
    }
  }, []);

  useEffect(() => {
    if (!deliveryId) return;

    const socket = getSocket();

    const handleConnect = () => {
      setConnectionState("connected");
      setError(null);
      if (deliveryIdRef.current) {
        socket.emit("tracking:subscribe", { deliveryId: deliveryIdRef.current });
      }
    };

    const handleDisconnect = () => {
      setConnectionState("disconnected");
    };

    const handleConnectError = (err: any) => {
      setConnectionState("disconnected");
      setError(err?.message || "Socket connection failed");
    };

    const handleTrackingInitial = (data: any) => {
      if (!data || data.deliveryId !== deliveryIdRef.current) return;

      if (typeof data.startLatitude === "number") setStartLatitude(data.startLatitude);
      if (typeof data.startLongitude === "number") setStartLongitude(data.startLongitude);
      if (typeof data.latitude === "number") setLatitude(data.latitude);
      if (typeof data.longitude === "number") setLongitude(data.longitude);
      if (typeof data.heading === "number") setHeading(data.heading);
      if (typeof data.speed === "number") setSpeed(data.speed);
      if (typeof data.isTracking === "boolean") setIsTracking(data.isTracking);
      if (data.status) setStatus(data.status);
      if (data.trackingUpdatedAt) setLastUpdated(new Date(data.trackingUpdatedAt));
      else if (data.updatedAt) setLastUpdated(new Date(data.updatedAt));
    };

    const handleLocationUpdate = (data: any) => {
      if (!data || data.deliveryId !== deliveryIdRef.current) return;

      if (typeof data.startLatitude === "number") setStartLatitude(data.startLatitude);
      if (typeof data.startLongitude === "number") setStartLongitude(data.startLongitude);
      if (typeof data.latitude === "number") setLatitude(data.latitude);
      if (typeof data.longitude === "number") setLongitude(data.longitude);
      if (typeof data.heading === "number") setHeading(data.heading);
      if (typeof data.speed === "number") setSpeed(data.speed);
      if (typeof data.isTracking === "boolean") setIsTracking(data.isTracking);
      if (data.status) setStatus(data.status);

      setLastUpdated(new Date(data.timestamp || Date.now()));
    };

    const handleTrackingStatus = (data: any) => {
      if (!data || data.deliveryId !== deliveryIdRef.current) return;

      if (typeof data.startLatitude === "number") setStartLatitude(data.startLatitude);
      if (typeof data.startLongitude === "number") setStartLongitude(data.startLongitude);
      if (typeof data.isTracking === "boolean") setIsTracking(data.isTracking);
      if (data.status) setStatus(data.status);
      if (typeof data.latitude === "number") setLatitude(data.latitude);
      if (typeof data.longitude === "number") setLongitude(data.longitude);
      if (typeof data.heading === "number") setHeading(data.heading);
      if (typeof data.speed === "number") setSpeed(data.speed);

      setLastUpdated(new Date(data.timestamp || Date.now()));
    };

    const handleTrackingError = (data: any) => {
      if (data?.deliveryId && data.deliveryId !== deliveryIdRef.current) return;
      setError(data?.message || "Tracking error");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("tracking:initial", handleTrackingInitial);
    socket.on("tracking:location", handleLocationUpdate);
    socket.on("tracking:status", handleTrackingStatus);
    socket.on("tracking:error", handleTrackingError);

    subscribeToDelivery();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("tracking:initial", handleTrackingInitial);
      socket.off("tracking:location", handleLocationUpdate);
      socket.off("tracking:status", handleTrackingStatus);
      socket.off("tracking:error", handleTrackingError);

      if (deliveryIdRef.current) {
        socket.emit("tracking:unsubscribe", { deliveryId: deliveryIdRef.current });
      }
    };
  }, [deliveryId, subscribeToDelivery]);

  return {
    deliveryId: deliveryId || "",
    startLatitude,
    startLongitude,
    latitude,
    longitude,
    heading,
    speed,
    isTracking,
    status,
    lastUpdated,
    connectionState,
    error,
    reconnect,
  };
}
