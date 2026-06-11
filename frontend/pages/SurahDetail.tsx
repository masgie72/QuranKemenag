import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, Palette, X, CloudDownload, CheckCircle, Loader2, Search, Bookmark, Share2, FileText } from 'lucide-react';
import { fetchSurahDetail, fetchTajweed, fetchSurahTafsir } from '../services/api';
import { SurahDetail as SurahDetailType, Ayah, SurahTafsir } from '../types';
import { toArabicNumber } from '../utils/formatters';
import { useSettings } from '../contexts/SettingsContext';
import { useBookmark } from '../contexts/BookmarkContext';
import { checkIsSurahDownloaded, downloadSurahData, getCachedAudioUrl } from '../utils/offlineManager';

export const SurahDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [surah, setSurah] = useState<SurahDetailType | null>(null);
  const [tafsir, setTafsir] = useState<SurahTafsir | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahAudio, setCurrentAyahAudio] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Global Settings
  const { 
    showTajweed, toggleTajweed, 
    showTranslation, toggleTranslation, 
    showLatin, toggleLatin, 
    showTafsir, toggleTafsir,
    arabicFontSize, selectedReciter,
    arabicFontFamily, latinFontFamily
  } = useSettings();

  // Bookmarks
  const { isBookmarked, toggleBookmark } = useBookmark();
  
  // Local Tajweed Data state
  const [tajweedTexts, setTajweedTexts] = useState<Record<number, string>>({});
  const [showLegend, setShowLegend] = useState(false);

  // Offline State
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        
        // Reset states
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
        setCurrentAyahAudio(null);
        setTajweedTexts({});
        setTafsir(null);
        setIsDownloaded(false);
        setSearchQuery('');
        
        // Fetch Kemenag Data
        const response = await fetchSurahDetail(parseInt(id));
        setSurah(response.data);
        
        // Don't scroll to top if we have a target ayah
        const params = new URLSearchParams(location.search);
        if (!params.get('ayah')) {
          window.scrollTo(0, 0);
        }

        // Check Offline Status
        const downloaded = await checkIsSurahDownloaded(parseInt(id), selectedReciter);
        setIsDownloaded(downloaded);

        // Fetch Tajweed Data in parallel
        fetchTajweed(parseInt(id)).then(tajweedRes => {
          const map: Record<number, string> = {};
          tajweedRes.verses.forEach(v => {
            const ayahNum = parseInt(v.verse_key.split(':')[1]);
            map[ayahNum] = v.text_uthmani_tajweed;
          });
          setTajweedTexts(map);
        }).catch(err => {
          console.error("Failed to load tajweed data:", err);
        });

        // Fetch Tafsir Data in parallel
        fetchSurahTafsir(parseInt(id)).then(tafsirRes => {
          setTafsir(tafsirRes.data);
        }).catch(err => {
          console.error("Failed to load tafsir data:", err);
        });

      } catch (err: any) {
        setError(err.message || 'Gagal memuat surat. Periksa koneksi internet Anda.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, selectedReciter]);

  // Handle scrolling to specific ayah from bookmarks
  useEffect(() => {
    if (surah && !loading) {
      const params = new URLSearchParams(location.search);
      const targetAyah = params.get('ayah');
      
      if (targetAyah) {
        // Slight delay to ensure rendering is complete
        setTimeout(() => {
          const element = document.getElementById(`ayah-${targetAyah}`);
          if (element) {
            // Calculate offset for sticky header
            const yOffset = -120; 
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            
            window.scrollTo({ top: y, behavior: 'smooth' });
            
            // Highlight effect
            element.classList.add('bg-primary-50', 'dark:bg-primary-900/20', 'transition-colors', 'duration-1000');
            setTimeout(() => {
              element.classList.remove('bg-primary-50', 'dark:bg-primary-900/20');
            }, 2000);
          }
        }, 300);
      }
    }
  }, [surah, loading, location.search]);

  const handleDownload = async () => {
    if (!surah) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Trigger tajweed and tafsir fetch to ensure it's cached
    await fetchTajweed(surah.nomor);
    await fetchSurahTafsir(surah.nomor);
    
    await downloadSurahData(surah, selectedReciter, setDownloadProgress);
    
    setIsDownloading(false);
    setIsDownloaded(true);
  };

  const toggleFullAudio = async () => {
    if (!surah) return;
    
    if (isPlaying && currentAyahAudio === null) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audioUrl = surah.audioFull[selectedReciter] || surah.audioFull['05'];
      const cachedUrl = await getCachedAudioUrl(audioUrl);
      
      audioRef.current = new Audio(cachedUrl);
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
      setIsPlaying(true);
      setCurrentAyahAudio(null);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const playAyahAudio = async (ayahNumber: number, audioUrls: { [key: string]: string }) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    if (isPlaying && currentAyahAudio === ayahNumber) {
      setIsPlaying(false);
      setCurrentAyahAudio(null);
      return;
    }

    const audioUrl = audioUrls[selectedReciter] || audioUrls['05'];
    const cachedUrl = await getCachedAudioUrl(audioUrl);
    
    audioRef.current = new Audio(cachedUrl);
    audioRef.current.play().catch(e => console.error("Audio play failed", e));
    setIsPlaying(true);
    setCurrentAyahAudio(ayahNumber);

    audioRef.current.onended = () => {
      setIsPlaying(false);
      setCurrentAyahAudio(null);
    };
  };

  const handleShareAyah = async (ayah: Ayah) => {
    if (!surah) return;
    
    const shareText = `QS. ${surah.namaLatin} Ayat ${ayah.nomorAyat}\n\n${ayah.teksArab}\n\nArtinya:\n"${ayah.teksIndonesia}"\n\n- Dibagikan dari Quran Kemenag App`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QS. ${surah.namaLatin}: ${ayah.nomorAyat}`,
          text: shareText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard if Web Share API is not supported
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Teks ayat berhasil disalin ke clipboard!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Gagal menyalin teks.');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const getArabicFontSizeClass = (size: number) => {
    switch (size) {
      case 1: return 'text-xl md:text-2xl';
      case 2: return 'text-2xl md:text-3xl';
      case 3: return 'text-3xl md:text-4xl';
      case 4: return 'text-4xl md:text-5xl';
      case 5: return 'text-5xl md:text-6xl';
      default: return 'text-3xl md:text-4xl';
    }
  };

  const fontSizeClass = getArabicFontSizeClass(arabicFontSize);

  // Filter Ayat based on search query
  const filteredAyat = surah?.ayat.filter(ayah => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ayah.teksIndonesia.toLowerCase().includes(query) ||
      ayah.teksLatin.toLowerCase().includes(query) ||
      ayah.nomorAyat.toString() === query
    );
  }) || [];

  // Highlight text helper
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    // Escape special characters for regex
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/60 text-inherit rounded-sm px-0.5">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-500"></div>
      </div>
    );
  }

  if (error || !surah) {
    return (
      <div className="p-4 text-center bg-white dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 dark:text-red-400 mb-4">{error || 'Surat tidak ditemukan'}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium">Kembali</button>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-4xl mx-auto bg-white dark:bg-gray-900 min-h-screen relative transition-colors duration-200">
      {/* Header with Islamic Pattern */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-teal-500 via-emerald-600 to-primary-700 dark:from-gray-900 dark:via-primary-900 dark:to-gray-900 bg-pattern-islamic text-white px-4 py-3 flex items-center justify-between shadow-lg rounded-b-2xl transition-colors duration-200">
        <button onClick={() => navigate('/quran')} className="p-2 -ml-2 text-white/90 hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center flex-1">
          <h1 className={`font-bold text-lg text-white drop-shadow-sm ${latinFontFamily}`}>{surah.namaLatin}</h1>
          <p className={`text-xs text-primary-100 ${latinFontFamily}`}>Ayat {surah.jumlahAyat}</p>
        </div>
        <button 
          onClick={toggleFullAudio}
          className={`p-2 -mr-2 rounded-full transition-colors ${isPlaying && currentAyahAudio === null ? 'text-primary-600 dark:text-primary-400 bg-white' : 'text-white/90 hover:bg-white/20'}`}
          title={isPlaying && currentAyahAudio === null ? "Jeda Audio Surat" : "Putar Audio Surat"}
        >
          {isPlaying && currentAyahAudio === null ? <Pause size={24} /> : <Play size={24} />}
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 flex flex-wrap justify-between items-center border-b border-gray-200 dark:border-gray-800 text-sm gap-2 transition-colors">
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={toggleTajweed} 
            className={`flex items-center gap-1 font-medium transition-colors ${showTajweed ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {showTajweed ? <ToggleRight className="text-primary-600 dark:text-primary-500" size={18} /> : <ToggleLeft className="text-gray-400 dark:text-gray-500" size={18} />}
            Tajwid
          </button>
          <button 
            onClick={toggleLatin} 
            className={`flex items-center gap-1 font-medium transition-colors ${showLatin ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {showLatin ? <ToggleRight className="text-primary-600 dark:text-primary-500" size={18} /> : <ToggleLeft className="text-gray-400 dark:text-gray-500" size={18} />}
            Latin
          </button>
          <button 
            onClick={toggleTranslation} 
            className={`flex items-center gap-1 font-medium transition-colors ${showTranslation ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {showTranslation ? <ToggleRight className="text-primary-600 dark:text-primary-500" size={18} /> : <ToggleLeft className="text-gray-400 dark:text-gray-500" size={18} />}
            Terjemah
          </button>
          <button 
            onClick={toggleTafsir} 
            className={`flex items-center gap-1 font-medium transition-colors ${showTafsir ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {showTafsir ? <ToggleRight className="text-primary-600 dark:text-primary-500" size={18} /> : <ToggleLeft className="text-gray-400 dark:text-gray-500" size={18} />}
            Tafsir
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {showTajweed && (
            <button 
              onClick={() => setShowLegend(!showLegend)} 
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm text-xs transition-colors"
            >
              <Palette size={14} /> Panduan
            </button>
          )}
          <button
            onClick={isDownloaded ? undefined : handleDownload}
            disabled={isDownloading || isDownloaded}
            className={`flex items-center gap-1 px-2 py-1 rounded-md border shadow-sm text-xs font-medium transition-colors ${
              isDownloaded 
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' 
                : 'bg-white border-gray-200 text-gray-600 hover:text-primary-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:text-primary-400'
            }`}
          >
            {isDownloading ? (
              <><Loader2 size={14} className="animate-spin" /> {downloadProgress}%</>
            ) : isDownloaded ? (
              <><CheckCircle size={14} /> Tersimpan</>
            ) : (
              <><CloudDownload size={14} /> Unduh</>
            )}
          </button>
        </div>
      </div>

      {/* Tajweed Legend Modal/Dropdown */}
      {showLegend && showTajweed && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-inner text-sm animate-in slide-in-from-top-2 transition-colors">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-gray-800 dark:text-gray-200">Panduan Warna Tajwid</h4>
            <button onClick={() => setShowLegend(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> Idgham</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#22c55e]"></span> Ikhfa & Iqlab</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span> Mad (Panjang)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ec4899]"></span> Ghunnah</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#06b6d4]"></span> Qalqalah</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#9ca3af]"></span> Tidak Dibaca</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
            * Warna tajwid disesuaikan dengan standar Mushaf Tajwid Kemenag RI.
          </p>
        </div>
      )}

      {/* Surah Info Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-emerald-500 via-primary-600 to-teal-700 dark:from-gray-800 dark:via-primary-900 dark:to-gray-900 bg-pattern-islamic rounded-2xl p-6 text-white text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-8 -mb-8"></div>
          
          <h2 className={`arabic-text ${arabicFontFamily} text-4xl mb-2 drop-shadow-md text-yellow-300`}>{surah.nama}</h2>
          <h3 className={`text-xl font-bold mb-1 ${latinFontFamily}`}>{surah.namaLatin}</h3>
          <p className={`text-primary-100 text-sm mb-4 border-b border-white/20 pb-4 inline-block px-8 ${latinFontFamily}`}>
            {surah.arti}
          </p>
          <div className={`flex justify-center gap-4 text-sm font-medium uppercase tracking-wider text-yellow-100 ${latinFontFamily}`}>
            <span>{surah.tempatTurun}</span>
            <span>•</span>
            <span>{surah.jumlahAyat} Ayat</span>
          </div>
        </div>
      </div>

      {/* Search Bar for Verses */}
      <div className="px-4 mt-2 mb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className={`block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors shadow-sm ${latinFontFamily}`}
            placeholder="Cari terjemahan, latin, atau nomor ayat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Bismillah with Ornaments */}
      {surah.nomor !== 9 && surah.nomor !== 1 && !searchQuery && (
        <div className="py-8 text-center border-b border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-16 bg-pattern-islamic opacity-5 dark:opacity-10 pointer-events-none"></div>
          <p className={`arabic-text ${arabicFontFamily} ${fontSizeClass} text-gray-800 dark:text-gray-200 relative z-10 transition-all duration-300`}>
            <span className="text-primary-500 dark:text-primary-400 mx-2">﴾</span>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            <span className="text-primary-500 dark:text-primary-400 mx-2">﴿</span>
          </p>
        </div>
      )}

      {/* Ayah List */}
      <div className="px-4 mt-2">
        {filteredAyat.length > 0 ? (
          filteredAyat.map((ayah) => {
            const isSaved = isBookmarked(surah.nomor, ayah.nomorAyat);
            const tafsirText = tafsir?.tafsir.find(t => t.ayat === ayah.nomorAyat)?.teks;

            return (
              <div id={`ayah-${ayah.nomorAyat}`} key={ayah.nomorAyat} className="py-6 border-b border-gray-100 dark:border-gray-800 last:border-0 rounded-lg px-2 -mx-2">
                <div className="flex justify-between items-center mb-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg transition-colors">
                  {/* Islamic Vector Ornament for Ayah Number */}
                  <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center text-primary-700 dark:text-primary-400">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="4" y="4" width="16" height="16" rx="1.5" transform="rotate(45 12 12)" className="fill-primary-100 dark:fill-primary-900/30" />
                      <rect x="4" y="4" width="16" height="16" rx="1.5" className="fill-primary-100 dark:fill-primary-900/30" />
                      <circle cx="12" cy="12" r="6" />
                    </svg>
                    <span className={`relative z-10 font-bold text-xl arabic-text ${arabicFontFamily} leading-none mt-1`}>{toArabicNumber(ayah.nomorAyat)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShareAyah(ayah)}
                      className="p-2 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="Bagikan Ayat"
                    >
                      <Share2 size={18} />
                    </button>
                    <button
                      onClick={() => toggleBookmark({ surahId: surah.nomor, ayahId: ayah.nomorAyat, surahName: surah.namaLatin })}
                      className={`p-2 rounded-full transition-colors ${isSaved ? 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/50' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                      title={isSaved ? "Hapus Tanda" : "Tandai Ayat"}
                    >
                      <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => playAyahAudio(ayah.nomorAyat, ayah.audio)}
                      className={`p-2 rounded-full transition-colors ${isPlaying && currentAyahAudio === ayah.nomorAyat ? 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/50' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      {isPlaying && currentAyahAudio === ayah.nomorAyat ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="text-right mb-8 mt-6">
                  {showTajweed && tajweedTexts[ayah.nomorAyat] ? (
                    <p 
                      className={`arabic-text ${arabicFontFamily} ${fontSizeClass} text-gray-900 dark:text-gray-100 leading-loose transition-all duration-300`} 
                      dir="rtl"
                      dangerouslySetInnerHTML={{ __html: `${tajweedTexts[ayah.nomorAyat]} <span class="text-primary-600 dark:text-primary-500 mx-1">﴿${toArabicNumber(ayah.nomorAyat)}﴾</span>` }}
                    />
                  ) : (
                    <p className={`arabic-text ${arabicFontFamily} ${fontSizeClass} text-gray-900 dark:text-gray-100 leading-loose transition-all duration-300`} dir="rtl">
                      {ayah.teksArab} <span className="text-primary-600 dark:text-primary-500 mx-1">﴿{toArabicNumber(ayah.nomorAyat)}﴾</span>
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  {showLatin && (
                    <p className={`text-primary-700 dark:text-primary-400 font-medium text-sm leading-relaxed ${latinFontFamily}`}>
                      {highlightText(ayah.teksLatin, searchQuery)}
                    </p>
                  )}
                  {showTranslation && (
                    <p className={`text-gray-700 dark:text-gray-300 text-sm leading-relaxed ${latinFontFamily}`}>
                      <span className="font-bold text-primary-600 dark:text-primary-400 mr-1.5">{ayah.nomorAyat}.</span>
                      {highlightText(ayah.teksIndonesia, searchQuery)}
                    </p>
                  )}
                  {showTafsir && tafsirText && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                      <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
                        <FileText size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Tafsir Kemenag</span>
                      </div>
                      <p className={`text-gray-700 dark:text-gray-300 text-sm leading-relaxed ${latinFontFamily}`}>
                        {tafsirText}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            Tidak ada ayat yang cocok dengan pencarian "{searchQuery}".
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80 mt-8 rounded-t-2xl border-t border-gray-200 dark:border-gray-800 transition-colors">
        {surah.suratSebelumnya ? (
          <Link 
            to={`/surah/${surah.suratSebelumnya.nomor}`}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ChevronLeft size={20} />
            <div className={`text-left ${latinFontFamily}`}>
              <span className="block text-xs text-gray-400 dark:text-gray-500">Sebelumnya</span>
              {surah.suratSebelumnya.namaLatin}
            </div>
          </Link>
        ) : <div></div>}

        {surah.suratSelanjutnya ? (
          <Link 
            to={`/surah/${surah.suratSelanjutnya.nomor}`}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-right"
          >
            <div className={latinFontFamily}>
              <span className="block text-xs text-gray-400 dark:text-gray-500">Selanjutnya</span>
              {surah.suratSelanjutnya.namaLatin}
            </div>
            <ChevronRight size={20} />
          </Link>
        ) : <div></div>}
      </div>
    </div>
  );
};
