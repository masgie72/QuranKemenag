import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, BookOpen } from 'lucide-react';
import { useBookmark } from '../contexts/BookmarkContext';

export const Bookmarks: React.FC = () => {
  const { bookmarks, toggleBookmark } = useBookmark();

  return (
    <div className="pb-24 max-w-3xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header with Islamic Pattern */}
      <div className="bg-gradient-to-r from-teal-500 via-emerald-600 to-primary-700 dark:from-gray-900 dark:via-primary-900 dark:to-gray-900 bg-pattern-islamic sticky top-0 z-10 px-4 py-5 shadow-lg rounded-b-2xl transition-colors duration-200">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-sm">
          <Bookmark size={26} className="text-yellow-300 fill-yellow-300" /> Ayat Ditandai
        </h1>
      </div>

      <div className="px-4 mt-6">
        {bookmarks.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <Bookmark size={32} />
            </div>
            <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">Belum ada ayat yang ditandai</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[250px]">
              Tandai ayat saat membaca Al-Quran untuk menyimpannya di sini.
            </p>
            <Link 
              to="/quran" 
              className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <BookOpen size={18} /> Baca Quran
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div 
                key={`${bookmark.surahId}-${bookmark.ayahId}`}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group transition-colors"
              >
                <Link 
                  to={`/surah/${bookmark.surahId}?ayah=${bookmark.ayahId}`}
                  className="flex-1 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm relative group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                    <div className="absolute inset-0 border-2 border-primary-200 dark:border-primary-800 rounded-full rotate-45"></div>
                    <span className="relative z-10">{bookmark.surahId}:{bookmark.ayahId}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {bookmark.surahName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ayat ke-{bookmark.ayahId}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => toggleBookmark(bookmark)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Hapus Tanda"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
