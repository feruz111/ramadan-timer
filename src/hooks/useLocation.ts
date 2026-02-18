import { useState, useEffect, useCallback } from "react";
import type { Location, LocationStatus } from "../types";

const STORAGE_KEY = "ramadan-timer-location";

function loadSaved(): Location | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(loc: Location) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
}

async function reverseGeocode(lat: number, lng: number): Promise<{ label: string; countryCode?: string }> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    const data = await res.json();
    const label = [data.city, data.countryName].filter(Boolean).join(", ") || "Current Location";
    return { label, countryCode: data.countryCode };
  } catch {
    return { label: "Current Location" };
  }
}

export function useLocation() {
  const saved = loadSaved();
  const [location, setLocation] = useState<Location | null>(saved);
  const [status, setStatus] = useState<LocationStatus>(saved ? "granted" : "loading");

  useEffect(() => {
    // Skip geolocation if we already have a saved location
    if (saved) return;

    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const geo = await reverseGeocode(latitude, longitude);
        const loc: Location = {
          latitude,
          longitude,
          label: geo.label,
          countryCode: geo.countryCode,
        };
        persist(loc);
        setLocation(loc);
        setStatus("granted");
      },
      () => {
        setStatus("denied");
      },
      { timeout: 10000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setManualLocation = useCallback((loc: Location) => {
    persist(loc);
    setLocation(loc);
    setStatus("granted");
  }, []);

  return { location, status, setManualLocation };
}
