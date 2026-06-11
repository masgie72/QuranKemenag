import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchPrayerTimes } from '../services/api';
import { PrayerTimesResponse, LocationCoords } from '../types';

interface PrayerTimesContextType {
  prayerData: PrayerTimesResponse | null;
  locationName: string;
  loading: boolean;
  error: string | null;
  updateLocation: (coords: LocationCoords, name: string) => Promise<void>;
  refreshCurrentLocation: () => void;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);
const DEFAULT_COORDS: LocationCoords = { latitude: -6.2088, longitude: 106.8456 }; // Jakarta
const SAVED_LOCATION_KEY = 'saved_prayer_location';

export const PrayerTimesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prayerData, setPrayerData] = useState<PrayerTimesResponse | null>(null);
  const [locationName, setLocationName] = useState<string>("Jakarta (Default)");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateLocation = useCallback(async (coords: LocationCoords, name: string, save: boolean = true) => {
    try {
      setLoading(true);
      const data = await fetchPrayerTimes(coords);
      setPrayerData(data);
      setLocationName(name);
      setError(null);
      if (save) {
        localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify({ coords, name }));
      }
    } catch (err) {
      setError('Gagal memuat jadwal shalat.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCurrentLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation(
            { latitude: position.coords.latitude, longitude: position.coords.longitude },
            "Lokasi Saat Ini",
            true
          );
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          setError('Gagal mendapatkan lokasi saat ini. Menggunakan lokasi default.');
          updateLocation(DEFAULT_COORDS, "Jakarta (Default)", false);
        },
        { timeout: 10000 }
      );
    } else {
      updateLocation(DEFAULT_COORDS, "Jakarta (Default)", false);
    }
  }, [updateLocation]);

  useEffect(() => {
    const initLocation = async () => {
      const saved = localStorage.getItem(SAVED_LOCATION_KEY);
      if (saved) {
        try {
          const { coords, name } = JSON.parse(saved);
          await updateLocation(coords, name, false);
          return;
        } catch (e) {
          console.error("Failed to parse saved location");
        }
      }
      
      // Fallback to geolocation if no saved location
      refreshCurrentLocation();
    };

    initLocation();
  }, [updateLocation, refreshCurrentLocation]);

  return (
    <PrayerTimesContext.Provider value={{ prayerData, locationName, loading, error, updateLocation, refreshCurrentLocation }}>
      {children}
    </PrayerTimesContext.Provider>
  );
};

export const usePrayerTimes = () => {
  const context = useContext(PrayerTimesContext);
  if (context === undefined) {
    throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
  }
  return context;
};
