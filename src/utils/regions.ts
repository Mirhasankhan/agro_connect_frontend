import bangladeshRegionsData from "@/data/bangladesh-regions-cities.json";

export interface RegionCitiesItem {
  region: string;
  cities: string[];
}

export const BANGLADESH_REGIONS: RegionCitiesItem[] = bangladeshRegionsData;

/**
 * Returns list of all 8 administrative divisions/regions of Bangladesh
 */
export const getAllRegions = (): string[] => {
  return BANGLADESH_REGIONS.map((item) => item.region);
};

/**
 * Returns list of cities/districts belonging to a specific region
 */
export const getCitiesForRegion = (regionName?: string | null): string[] => {
  if (!regionName) return [];
  const found = BANGLADESH_REGIONS.find(
    (item) => item.region.toLowerCase() === regionName.trim().toLowerCase()
  );
  return found ? found.cities : [];
};

/**
 * Checks if a given region is a valid Bangladesh division
 */
export const isValidRegion = (regionName?: string | null): boolean => {
  if (!regionName) return false;
  return BANGLADESH_REGIONS.some(
    (item) => item.region.toLowerCase() === regionName.trim().toLowerCase()
  );
};

/**
 * Checks if a given city belongs to the specified region
 */
export const isValidCity = (
  regionName?: string | null,
  cityName?: string | null
): boolean => {
  if (!regionName || !cityName) return false;
  const cities = getCitiesForRegion(regionName);
  return cities.some(
    (c) => c.toLowerCase() === cityName.trim().toLowerCase()
  );
};
