import { SurahDetail } from '../types';

export const CACHE_NAME = 'quran-kemenag-cache-v1';

export const checkIsSurahDownloaded = async (surahId: number, reciter: string): Promise<boolean> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    // Cek apakah detail surah ada di cache
    const detailMatch = await cache.match(`https://equran.id/api/v2/surat/${surahId}`);
    if (!detailMatch) return false;

    // Cek apakah audio full untuk reciter yang dipilih ada di cache
    const detail: any = await detailMatch.clone().json();
    const audioUrl = detail.data.audioFull[reciter] || detail.data.audioFull['05'];
    const audioMatch = await cache.match(audioUrl);

    return !!audioMatch;
  } catch (e) {
    return false;
  }
};

export const getCachedAudioUrl = async (originalUrl: string): Promise<string> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(originalUrl);
    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      return URL.createObjectURL(blob);
    }
  } catch (e) {
    console.error("Error reading cache for audio", e);
  }
  return originalUrl;
};

export const downloadSurahData = async (surah: SurahDetail, reciter: string, progressCb: (p: number) => void) => {
  const cache = await caches.open(CACHE_NAME);
  const urlsToCache: string[] = [];

  // 1. URL Detail Surah
  urlsToCache.push(`https://equran.id/api/v2/surat/${surah.nomor}`);

  // 2. URL Tafsir Surah
  urlsToCache.push(`https://equran.id/api/v2/tafsir/${surah.nomor}`);

  // 3. URL Audio Full
  urlsToCache.push(surah.audioFull[reciter] || surah.audioFull['05']);
  
  // 4. URL Audio per Ayat
  surah.ayat.forEach(a => {
    urlsToCache.push(a.audio[reciter] || a.audio['05']);
  });

  let downloaded = 0;
  for (const url of urlsToCache) {
    try {
      const match = await cache.match(url);
      if (!match) {
        const res = await fetch(url);
        if (res.ok) await cache.put(url, res);
      }
    } catch (e) {
      console.error("Failed to cache", url);
    }
    downloaded++;
    progressCb(Math.round((downloaded / urlsToCache.length) * 100));
  }
};

export const clearOfflineData = async () => {
  try {
    await caches.delete(CACHE_NAME);
  } catch (e) {
    console.error("Failed to clear cache", e);
  }
};
