import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, AlertCircle, Sun, Moon, ChevronDown, Search, X, Navigation } from 'lucide-react';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';
import { useTheme } from '../contexts/ThemeContext';
import { searchLocation } from '../services/api';
import { GeocodingResult } from '../types';
import { CrescentStarIcon, QuranIcon, KaabaIcon } from '../components/IslamicIcons';

export const Home: React.FC = () => {
  const { prayerData, locationName, loading, error, updateLocation, refreshCurrentLocation } = usePrayerTimes();
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; diff: string } | null>(null);
  const { theme, toggleTheme } = useTheme();

  // Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!prayerData) return;

    const calculateNextPrayer = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const prayers = [
        { name: 'Subuh', key: 'Fajr' },
        { name: 'Dzuhur', key: 'Dhuhr' },
        { name: 'Ashar', key: 'Asr' },
        { name: 'Maghrib', key: 'Maghrib' },
        { name: 'Isya', key: 'Isha' }
      ];

      let next = null;
      let minDiff = Infinity;

      for (const prayer of prayers) {
        const timeStr = prayerData.data.timings[prayer.key];
        if (!timeStr) continue;
        
        const [hours, mins] = timeStr.split(':').map(Number);
        const prayerMinutes = hours * 60 + mins;
        
        let diff = prayerMinutes - currentMinutes;
        
        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          next = { 
            name: prayer.name, 
            time: timeStr,
            diff: `${Math.floor(diff / 60)}j ${diff % 60}m`
          };
        }
      }

      if (!next) {
         const subuhTime = prayerData.data.timings['Fajr'];
         if(subuhTime) {
             const [hours, mins] = subuhTime.split(':').map(Number);
             const prayerMinutes = (hours + 24) * 60 + mins;
             const diff = prayerMinutes - currentMinutes;
             next = {
                 name: 'Subuh (Besok)',
                 time: subuhTime,
                 diff: `${Math.floor(diff / 60)}j ${diff % 60}m`
             }
         }
      }

      setNextPrayer(next);
    };

    calculateNextPrayer();
    const interval = setInterval(calculateNextPrayer, 60000);
    return () => clearInterval(interval);
  }, [prayerData]);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const results = await searchLocation(searchQuery);
          setSearchResults(results);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const prayersList = [
    { name: 'Imsak', key: 'Imsak' },
    { name: 'Subuh', key: 'Fajr' },
    { name: 'Terbit', key: 'Sunrise' },
    { name: 'Dzuhur', key: 'Dhuhr' },
    { name: 'Ashar', key: 'Asr' },
    { name: 'Maghrib', key: 'Maghrib' },
    { name: 'Isya', key: 'Isha' },
  ];

  return (
    <div className="pb-24">
      {/* Header Section with Professional Islamic Gradient */}
      <div className="bg-gradient-to-br from-teal-500 via-emerald-600 to-primary-700 dark:from-gray-900 dark:via-primary-900 dark:to-gray-900 bg-pattern-islamic text-white p-6 rounded-b-[2.5rem] shadow-xl mb-6 transition-colors duration-200 relative overflow-hidden">
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <CrescentStarIcon size={26} className="text-yellow-300 drop-shadow-sm" /> 
              <span>Quran Kemenag</span>
            </h1>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-primary-100 text-sm flex items-center gap-1 ml-1 hover:text-white transition-colors bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10"
            >
              <MapPin size={14} /> 
              <span className="truncate max-w-[150px]">{locationName}</span>
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={toggleTheme} 
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors border border-white/20 shadow-sm"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-200" /> : <Moon size={18} />}
            </button>
            <div className="text-right mt-1">
              <p className="text-sm font-medium text-yellow-100">{prayerData?.data.date.hijri.date} {prayerData?.data.date.hijri.month.ar}</p>
              <p className="text-xs text-primary-100">{prayerData?.data.date.readable}</p>
            </div>
          </div>
        </div>

        {/* Next Prayer Card */}
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 dark:border-white/10 relative z-10 shadow-inner">
          <p className="text-sm text-primary-50 mb-1 font-medium">Shalat Selanjutnya</p>
          {loading ? (
            <div className="animate-pulse h-8 bg-white/20 rounded w-1/2"></div>
          ) : nextPrayer ? (
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-yellow-300 drop-shadow-sm">{nextPrayer.name}</h2>
                <p className="text-xl font-medium">{nextPrayer.time}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-50">dalam</p>
                <p className="text-lg font-semibold">{nextPrayer.diff}</p>
              </div>
            </div>
          ) : (
            <p>Menghitung...</p>
          )}
        </div>
      </div>

      <div className="px-4 max-w-3xl mx-auto">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link to="/quran" className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all group">
            <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-full text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
              <QuranIcon size={28} />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">Baca Quran</span>
          </Link>
          <Link to="/qibla" className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group relative">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <KaabaIcon size={28} />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">Arah Kiblat</span>
          </Link>
        </div>

        {/* Prayer Times List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Clock size={20} className="text-primary-600 dark:text-primary-400" />
            <h3 className="font-bold text-lg">Jadwal Shalat Hari Ini</h3>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : prayerData ? (
            <div className="space-y-2">
              {prayersList.map((prayer) => {
                const time = prayerData.data.timings[prayer.key];
                const isNext = nextPrayer?.name.includes(prayer.name);
                
                return (
                  <div 
                    key={prayer.key} 
                    className={`flex justify-between items-center p-3 rounded-xl transition-colors ${
                      isNext 
                        ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 shadow-sm' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className={`font-medium ${isNext ? 'text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {prayer.name}
                    </span>
                    <span className={`font-bold ${isNext ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {time}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* Location Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-gray-100 dark:border-gray-800">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50">
              <button onClick={() => setIsSearchOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                <X size={24} />
              </button>
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Cari kota atau daerah..."
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="overflow-y-auto p-2 flex-1">
              <button
                onClick={() => {
                  refreshCurrentLocation();
                  setIsSearchOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl text-left transition-colors text-primary-600 dark:text-primary-400 font-medium"
              >
                <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
                  <Navigation size={18} />
                </div>
                Gunakan Lokasi Saat Ini
              </button>
              
              <div className="my-2 border-t border-gray-100 dark:border-gray-800"></div>
              
              {isSearching ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                  <span className="text-sm">Mencari lokasi...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((res) => {
                    const parts = res.display_name.split(',');
                    const shortName = parts[0].trim();
                    const detailName = parts.slice(1).join(',').trim();
                    
                    return (
                      <button
                        key={res.place_id}
                        onClick={() => {
                          updateLocation({ latitude: parseFloat(res.lat), longitude: parseFloat(res.lon) }, shortName);
                          setIsSearchOpen(false);
                        }}
                        className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-left transition-colors group"
                      >
                        <div className="mt-0.5 text-gray-400 group-hover:text-primary-500 transition-colors">
                          <MapPin size={18} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{shortName}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full">{detailName}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : searchQuery.length > 2 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Lokasi tidak ditemukan. Coba kata kunci lain.
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                  Ketik nama kota atau daerah untuk mencari jadwal shalat.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
