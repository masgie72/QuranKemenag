import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, WifiOff } from 'lucide-react';
import { fetchSurahs } from '../services/api';
import { SurahSummary } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { QuranIcon } from '../components/IslamicIcons';

export const QuranList: React.FC = () => {
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { arabicFontFamily, latinFontFamily } = useSettings();

  useEffect(() => {
    const loadSurahs = async () => {
      try {
        setLoading(true);
        const response = await fetchSurahs();
        setSurahs(response.data);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat daftar surat. Periksa koneksi internet Anda.');
      } finally {
        setLoading(false);
      }
    };

    loadSurahs();
  }, []);

  const filteredSurahs = surahs.filter(surah => 
    surah.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.arti.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-teal-500 via-emerald-600 to-primary-700 dark:from-gray-900 dark:via-primary-900 dark:to-gray-900 bg-pattern-islamic sticky top-0 z-10 px-4 py-5 shadow-lg rounded-b-2xl transition-colors duration-200">
        <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2 drop-shadow-sm">
          <QuranIcon className="text-yellow-300" size={26} /> Al-Quran
        </h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/70" />
          </div>
          <input
            type="text"
            className={`block w-full pl-10 pr-3 py-3 border-0 rounded-xl leading-5 bg-white/10 dark:bg-black/20 text-white placeholder-white/70 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/50 sm:text-sm transition-colors backdrop-blur-md shadow-inner ${latinFontFamily}`}
            placeholder="Cari surat (misal: Yasin, Al-Kahf)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 mt-6">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
              <WifiOff size={32} />
            </div>
            <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">Anda Sedang Offline</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[250px]">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSurahs.map((surah) => (
              <Link 
                key={surah.nomor} 
                to={`/surah/${surah.nomor}`}
                className="block bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Islamic Vector Ornament for Surah Number */}
                    <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="4" y="4" width="16" height="16" rx="1.5" transform="rotate(45 12 12)" className="fill-primary-50 dark:fill-primary-900/20 group-hover:fill-primary-100 dark:group-hover:fill-primary-900/40 transition-colors" />
                        <rect x="4" y="4" width="16" height="16" rx="1.5" className="fill-primary-50 dark:fill-primary-900/20 group-hover:fill-primary-100 dark:group-hover:fill-primary-900/40 transition-colors" />
                        <circle cx="12" cy="12" r="6" />
                      </svg>
                      <span className="relative z-10 font-bold text-sm leading-none">{surah.nomor}</span>
                    </div>
                    <div className={latinFontFamily}>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{surah.namaLatin}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {surah.tempatTurun} • {surah.jumlahAyat} Ayat
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`arabic-text ${arabicFontFamily} text-2xl text-primary-700 dark:text-primary-400`}>{surah.nama}</p>
                    <p className={`text-xs text-gray-500 dark:text-gray-400 ${latinFontFamily}`}>{surah.arti}</p>
                  </div>
                </div>
              </Link>
            ))}
            {filteredSurahs.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                Surat tidak ditemukan.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
