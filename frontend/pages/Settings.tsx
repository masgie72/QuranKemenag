import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { Moon, Sun, Info, Shield, Database, Palette, Languages, Bell, Type, Settings as SettingsIcon, Scaling, Mic, HardDrive, Trash2, PenTool, User, Mail, Code, Globe, FileText } from 'lucide-react';
import { RECITER_OPTIONS, ARABIC_FONT_OPTIONS, LATIN_FONT_OPTIONS } from '../types';
import { clearOfflineData } from '../utils/offlineManager';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { 
    showTajweed, toggleTajweed, 
    showTranslation, toggleTranslation, 
    showLatin, toggleLatin,
    showTafsir, toggleTafsir,
    isAdzanEnabled, toggleAdzan,
    arabicFontSize, setArabicFontSize,
    selectedReciter, setSelectedReciter,
    arabicFontFamily, setArabicFontFamily,
    latinFontFamily, setLatinFontFamily
  } = useSettings();

  const handleClearCache = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua data offline (Surat & Audio)?')) {
      await clearOfflineData();
      alert('Data offline berhasil dihapus.');
    }
  };

  return (
    <div className="pb-24 max-w-3xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header with Islamic Pattern */}
      <div className="bg-gradient-to-r from-teal-500 via-emerald-600 to-primary-700 dark:from-gray-900 dark:via-primary-900 dark:to-gray-900 bg-pattern-islamic sticky top-0 z-10 px-4 py-5 shadow-lg rounded-b-2xl transition-colors duration-200">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-sm">
          <SettingsIcon size={26} className="text-yellow-300" /> Pengaturan
        </h1>
      </div>

      <div className="p-4 space-y-6 mt-2">
        {/* Tampilan Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">Tampilan</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <p className="font-medium">Mode Gelap</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sesuaikan tampilan dengan tema perangkat</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Notifikasi Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">Notifikasi</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                  <Bell size={20} />
                </div>
                <div>
                  <p className="font-medium">Suara Adzan</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Putar suara saat waktu shalat tiba</p>
                </div>
              </div>
              <button
                onClick={toggleAdzan}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  isAdzanEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAdzanEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Preferensi Membaca Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">Preferensi Membaca & Audio</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            
            {/* Pilihan Qari */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200 mb-3">
                <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400">
                  <Mic size={20} />
                </div>
                <div>
                  <p className="font-medium">Qari (Pembaca)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pilih suara lantunan Al-Quran</p>
                </div>
              </div>
              <div className="relative px-1">
                <select
                  value={selectedReciter}
                  onChange={(e) => setSelectedReciter(e.target.value)}
                  className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-sm font-medium"
                >
                  {RECITER_OPTIONS.map(reciter => (
                    <option key={reciter.id} value={reciter.id}>{reciter.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-500 dark:text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Gaya Huruf Arab */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200 mb-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <PenTool size={20} />
                </div>
                <div>
                  <p className="font-medium">Gaya Huruf Arab</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pilih jenis khat Al-Quran</p>
                </div>
              </div>
              <div className="relative px-1">
                <select
                  value={arabicFontFamily}
                  onChange={(e) => setArabicFontFamily(e.target.value)}
                  className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-sm font-medium"
                >
                  {ARABIC_FONT_OPTIONS.map(font => (
                    <option key={font.id} value={font.id}>{font.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-500 dark:text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Gaya Huruf Latin */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200 mb-3">
                <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg text-cyan-600 dark:text-cyan-400">
                  <Type size={20} />
                </div>
                <div>
                  <p className="font-medium">Gaya Huruf Latin</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pilih jenis font untuk terjemahan</p>
                </div>
              </div>
              <div className="relative px-1">
                <select
                  value={latinFontFamily}
                  onChange={(e) => setLatinFontFamily(e.target.value)}
                  className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-sm font-medium"
                >
                  {LATIN_FONT_OPTIONS.map(font => (
                    <option key={font.id} value={font.id}>{font.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-500 dark:text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Ukuran Font Arab */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Scaling size={20} />
                </div>
                <div>
                  <p className="font-medium">Ukuran Huruf Arab</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sesuaikan besar huruf Al-Quran</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-2">
                <span className="text-sm font-arabic text-gray-500 dark:text-gray-400">A</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={arabicFontSize}
                  onChange={(e) => setArabicFontSize(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
                />
                <span className="text-2xl font-arabic text-gray-800 dark:text-gray-200">A</span>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                  <Palette size={20} />
                </div>
                <div>
                  <p className="font-medium">Tajwid Berwarna</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tampilkan panduan warna tajwid</p>
                </div>
              </div>
              <button
                onClick={toggleTajweed}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  showTajweed ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showTajweed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <Type size={20} />
                </div>
                <div>
                  <p className="font-medium">Huruf Latin</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tampilkan teks latin (transliterasi)</p>
                </div>
              </div>
              <button
                onClick={toggleLatin}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  showLatin ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showLatin ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                  <Languages size={20} />
                </div>
                <div>
                  <p className="font-medium">Terjemahan</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tampilkan terjemahan bahasa Indonesia</p>
                </div>
              </div>
              <button
                onClick={toggleTranslation}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  showTranslation ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showTranslation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-medium">Tafsir Kemenag</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tampilkan tafsir ringkas per ayat</p>
                </div>
              </div>
              <button
                onClick={toggleTafsir}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  showTafsir ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showTafsir ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

          </div>
        </section>

        {/* Data Offline Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">Penyimpanan</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                  <HardDrive size={20} />
                </div>
                <div>
                  <p className="font-medium">Data Offline</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Hapus surat dan audio yang diunduh</p>
                </div>
              </div>
              <button
                onClick={handleClearCache}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Hapus Data Offline"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* Informasi Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">Tentang Aplikasi</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-start gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Info size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Quran Kemenag & Jadwal Shalat</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Versi 1.0.0</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                  Aplikasi Al-Quran digital yang dibangun untuk memudahkan umat Muslim membaca Al-Quran dengan standar Kemenag RI, dilengkapi dengan tajwid warna dan jadwal shalat akurat.
                </p>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-start gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <Database size={20} />
              </div>
              <div className="w-full">
                <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">Sumber Data API</p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex justify-between items-center">
                    <span>Teks & Terjemah</span>
                    <span className="font-medium text-gray-800 dark:text-gray-300">EQuran.id</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Jadwal Shalat</span>
                    <span className="font-medium text-gray-800 dark:text-gray-300">Aladhan.com</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Tajwid Warna</span>
                    <span className="font-medium text-gray-800 dark:text-gray-300">Quran.com</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-4 flex items-start gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <Shield size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Privasi & Izin</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  Aplikasi ini meminta izin lokasi semata-mata untuk menghitung jadwal shalat yang akurat sesuai dengan daerah Anda. Data lokasi tidak disimpan di server kami.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Pengembang Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">Informasi Pengembang</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-start gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <User size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Dikembangkan Oleh</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  Seorang hamba Allah yang berharap aplikasi ini dapat memberikan manfaat dan menjadi amal jariyah bagi umat Islam.
                </p>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Hubungi Pengembang</p>
              <div className="flex flex-col gap-2">
                <a href="mailto:ismetmasgie@gmail.com" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <Mail size={18} />
                  <span>ismetmasgie@gmail.com</span>
                </a>
                <a href="https://github.com/masgie72" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <Code size={18} />
                  <span>github.com/masgie72</span>
                </a>
                <a href="https://github.com/masgie72" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <Globe size={18} />
                  <span>Kunjungi Website</span>
                </a>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};
