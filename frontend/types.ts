export interface SurahListResponse {
  code: number;
  message: string;
  data: SurahSummary[];
}

export interface SurahSummary {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: {
    [key: string]: string;
  };
}

export interface SurahDetailResponse {
  code: number;
  message: string;
  data: SurahDetail;
}

export interface SurahDetail extends SurahSummary {
  ayat: Ayah[];
  suratSelanjutnya: SurahSummary | false;
  suratSebelumnya: SurahSummary | false;
}

export interface Ayah {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: {
    [key: string]: string;
  };
}

export interface TafsirAyah {
  ayat: number;
  teks: string;
}

export interface SurahTafsir extends SurahSummary {
  tafsir: TafsirAyah[];
}

export interface SurahTafsirResponse {
  code: number;
  message: string;
  data: SurahTafsir;
}

export interface PrayerTimesResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimings;
    date: {
      readable: string;
      hijri: {
        date: string;
        month: { en: string; ar: string };
        year: string;
      };
    };
    meta: {
      timezone: string;
    };
  };
}

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  [key: string]: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export interface TajweedVerse {
  id: number;
  verse_key: string;
  text_uthmani_tajweed: string;
}

export interface TajweedResponse {
  verses: TajweedVerse[];
  pagination?: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

export const RECITER_OPTIONS = [
  { id: '01', name: 'Abdullah Al-Juhany' },
  { id: '02', name: 'Abdul Muhsin Al-Qasim' },
  { id: '03', name: 'Abdurrahman as-Sudais' },
  { id: '04', name: 'Ibrahim Al-Dawsari' },
  { id: '05', name: 'Mishary Rashid Alafasy' },
];

export const ARABIC_FONT_OPTIONS = [
  { id: 'font-arabic', name: 'Amiri (Default)' },
  { id: 'font-scheherazade', name: 'Scheherazade New' },
  { id: 'font-notonaskh', name: 'Noto Naskh Arabic' },
];

export const LATIN_FONT_OPTIONS = [
  { id: 'font-sans', name: 'Inter (Default)' },
  { id: 'font-roboto', name: 'Roboto' },
  { id: 'font-lora', name: 'Lora (Serif)' },
];
