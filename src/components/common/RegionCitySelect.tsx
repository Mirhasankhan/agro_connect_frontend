"use client";

import React, { useMemo } from "react";
import { MapPin } from "lucide-react";
import { getAllRegions, getCitiesForRegion } from "@/utils/regions";

export interface RegionCitySelectProps {
  regionValue?: string | null;
  cityValue?: string | null;
  onRegionChange: (region: string) => void;
  onCityChange: (city: string) => void;
  regionError?: string;
  cityError?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: "form" | "profile";
  regionLabel?: string;
  cityLabel?: string;
  regionId?: string;
  cityId?: string;
  containerClassName?: string;
}

export function RegionCitySelect({
  regionValue = "",
  cityValue = "",
  onRegionChange,
  onCityChange,
  regionError,
  cityError,
  disabled = false,
  required = false,
  variant = "form",
  regionLabel = "Region / Division",
  cityLabel = "City / District",
  regionId = "region",
  cityId = "city",
  containerClassName,
}: RegionCitySelectProps) {
  const regions = useMemo(() => getAllRegions(), []);

  const normalizedRegion = regionValue || "";
  const normalizedCity = cityValue || "";

  // Get cities belonging to the selected region
  const availableCities = useMemo(() => {
    return getCitiesForRegion(normalizedRegion);
  }, [normalizedRegion]);

  const isCityDisabled = disabled || !normalizedRegion.trim();

  const handleRegionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRegion = e.target.value;
    onRegionChange(nextRegion);
    // Reset previously selected city when region changes
    onCityChange("");
  };

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCityChange(e.target.value);
  };

  // Check if current region is legacy or custom (not in standard 8 divisions)
  const isCustomRegion =
    normalizedRegion &&
    !regions.some(
      (r) => r.toLowerCase() === normalizedRegion.trim().toLowerCase()
    );

  // Check if current city is legacy or custom (not in region's city list)
  const isCustomCity =
    normalizedCity &&
    !availableCities.some(
      (c) => c.toLowerCase() === normalizedCity.trim().toLowerCase()
    );

  if (variant === "profile") {
    const selectClasses =
      "w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

    return (
      <div
        className={
          containerClassName || "grid grid-cols-1 sm:grid-cols-2 gap-5"
        }
      >
        {/* Region Dropdown */}
        <div>
          <label
            htmlFor={regionId}
            className="block text-xs font-bold text-slate-700 tracking-wider mb-2"
          >
            {regionLabel} {required && <span className="text-rose-500">*</span>}
          </label>
          <div className="relative">
            <select
              id={regionId}
              name={regionId}
              value={normalizedRegion}
              onChange={handleRegionSelect}
              disabled={disabled}
              className={selectClasses}
            >
              <option value="">Select a region</option>
              {isCustomRegion && (
                <option value={normalizedRegion}>{normalizedRegion}</option>
              )}
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>
          {regionError && <p className="mt-1 text-xs text-rose-500">{regionError}</p>}
        </div>

        {/* City Dropdown */}
        <div>
          <label
            htmlFor={cityId}
            className="block text-xs font-bold text-slate-700 tracking-wider mb-2"
          >
            {cityLabel} {required && <span className="text-rose-500">*</span>}
          </label>
          <div className="relative">
            <select
              id={cityId}
              name={cityId}
              value={normalizedCity}
              onChange={handleCitySelect}
              disabled={isCityDisabled}
              className={selectClasses}
            >
              {isCityDisabled ? (
                <option value="">Select a region first</option>
              ) : (
                <>
                  <option value="">Select a city or district</option>
                  {isCustomCity && (
                    <option value={normalizedCity}>{normalizedCity}</option>
                  )}
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </>
              )}
            </select>
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>
          {cityError && <p className="mt-1 text-xs text-rose-500">{cityError}</p>}
        </div>
      </div>
    );
  }

  // Default "form" variant (for setup modals and onboarding pages)
  return (
    <div
      className={
        containerClassName || "grid grid-cols-1 sm:grid-cols-2 gap-3"
      }
    >
      {/* Region Dropdown */}
      <div>
        <label htmlFor={regionId} className="form-label">
          {regionLabel} {required && "*"}
        </label>
        <select
          id={regionId}
          name={regionId}
          value={normalizedRegion}
          onChange={handleRegionSelect}
          disabled={disabled}
          className="form-select"
        >
          <option value="">Select a region</option>
          {isCustomRegion && (
            <option value={normalizedRegion}>{normalizedRegion}</option>
          )}
          {regions.map((reg) => (
            <option key={reg} value={reg}>
              {reg}
            </option>
          ))}
        </select>
        {regionError && <p className="form-error">{regionError}</p>}
      </div>

      {/* City Dropdown */}
      <div>
        <label htmlFor={cityId} className="form-label">
          {cityLabel} {required && "*"}
        </label>
        <select
          id={cityId}
          name={cityId}
          value={normalizedCity}
          onChange={handleCitySelect}
          disabled={isCityDisabled}
          className="form-select"
        >
          {isCityDisabled ? (
            <option value="">Select a region first</option>
          ) : (
            <>
              <option value="">Select a city or district</option>
              {isCustomCity && (
                <option value={normalizedCity}>{normalizedCity}</option>
              )}
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </>
          )}
        </select>
        {cityError && <p className="form-error">{cityError}</p>}
      </div>
    </div>
  );
}

export default RegionCitySelect;
