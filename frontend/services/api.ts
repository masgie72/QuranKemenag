import { SurahListResponse, SurahDetailResponse, SurahTafsirResponse, PrayerTimesResponse, LocationCoords, TajweedResponse, TajweedVerse, GeocodingResult } from '../types';
import { CACHE_NAME } from '../utils/offlineManager';

const EQURAN_BASE_URL = 'https://equran.id/api/v2';
const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1';
const QURAN_COM_BASE_URL = 'https://api.quran.com/api/v4';

const fetchWithCache = async (url: string) => {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(url);
    if (response.ok) {
      cache.put(url, response.clone());
    }
    return response;
  } catch (e) {
    const cachedResponse = await cache.match(url);
    if (cachedResponse) return cachedResponse;
    throw new Error('Anda sedang offline dan data belum diunduh.');
  }
};

export const fetchSurahs = async (): Promise<SurahListResponse> => {
  const response = await fetchWithCache(`${EQURAN_BASE_URL}/surat`);
  return response.json();
};

export const fetchSurahDetail = async (nomor: number): Promise<SurahDetailResponse> => {
  const response = await fetchWithCache(`${EQURAN_BASE_URL}/surat/${nomor}`);
  return response.json();
};

export const fetchSurahTafsir = async (nomor: number): Promise<SurahTafsirResponse> => {
  const response = await fetchWithCache(`${EQURAN_BASE_URL}/tafsir/${nomor}`);
  return response.json();
};

export const fetchPrayerTimes = async (coords: LocationCoords, date: Date = new Date()): Promise<PrayerTimesResponse> => {
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  const url = `${ALADHAN_BASE_URL}/timings/${formattedDate}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=20`;
  
  const response = await fetchWithCache(url);
  return response.json();
};

export const searchLocation = async (query: string): Promise<GeocodingResult[]> => {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=id`);
  if (!response.ok) throw new Error('Failed to search location');
  return response.json();
};

export const fetchTajweed = async (nomor: number): Promise<TajweedResponse> => {
  const cache = await caches.open(CACHE_NAME);
  const baseUrl = `${QURAN_COM_BASE_URL}/verses/by_chapter/${nomor}?fields=text_uthmani_tajweed&per_page=50`;

  const fetchPage = async (page: number) => {
    const url = `${baseUrl}&page=${page}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        cache.put(url, res.clone());
        return res.json();
      }
      throw new Error('Network response was not ok');
    } catch (e) {
      const cached = await cache.match(url);
      if (cached) return cached.json();
      throw new Error('Offline');
    }
  };

  try {
    const firstData = await fetchPage(1);
    let allVerses: TajweedVerse[] = [...firstData.verses];
    const totalPages = firstData.pagination?.total_pages || 1;

    if (totalPages > 1) {
      const promises = [];
      for (let i = 2; i <= totalPages; i++) {
        promises.push(fetchPage(i));
      }
      const remainingPagesData = await Promise.all(promises);
      remainingPagesData.forEach(data => {
        if (data.verses) {
          allVerses = [...allVerses, ...data.verses];
        }
      });
    }
    return { verses: allVerses };
  } catch (e) {
    // Jika offline dan tidak ada di cache, kembalikan array kosong agar tidak error
    return { verses: [] };
  }
};
