/**
 * Google Maps API Loader utility for Agro Connect
 * Loads Google Maps JavaScript API idempotently without duplicate script tags.
 */

const DEFAULT_MAPS_API_KEY = "AIzaSyD_dV0eoWcI8MEoPSB5gXN_peqd69IQciI";

export const getGoogleMapsApiKey = (): string => {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    DEFAULT_MAPS_API_KEY
  );
};

let googleMapsPromise: Promise<any> | null = null;

export const loadGoogleMaps = (): Promise<any> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser"));
  }

  // Already loaded
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script tag already exists in document
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.google?.maps) {
        resolve(window.google.maps);
        return;
      }
      existingScript.addEventListener("load", () => {
        if (window.google?.maps) {
          resolve(window.google.maps);
        } else {
          reject(new Error("Google Maps failed to initialize"));
        }
      });
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }

    const apiKey = getGoogleMapsApiKey();
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Google Maps object not found on window"));
      }
    };

    script.onerror = (err) => {
      googleMapsPromise = null;
      reject(new Error(`Failed to load Google Maps script: ${err}`));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// Default coordinates for Agro Connect Central Hub (e.g. Abidjan Regional Logistics Hub)
export const AGRO_CENTRAL_HUB_COORDS = {
  lat: 5.359952,
  lng: -4.008256,
  label: "Agro Connect Regional Hub",
};

// Geocoding helper with caching
const geocodeCache = new Map<string, { lat: number; lng: number }>();

export const geocodeAddress = async (
  address: string
): Promise<{ lat: number; lng: number } | null> => {
  if (!address || typeof window === "undefined") return null;

  const normalized = address.trim().toLowerCase();
  if (geocodeCache.has(normalized)) {
    return geocodeCache.get(normalized)!;
  }

  try {
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === "OK" && results && results[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          const coords = { lat: loc.lat(), lng: loc.lng() };
          geocodeCache.set(normalized, coords);
          resolve(coords);
        } else {
          resolve(null);
        }
      });
    });
  } catch {
    return null;
  }
};
