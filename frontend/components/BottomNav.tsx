import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings as SettingsIcon, Bookmark } from 'lucide-react';
import { MosqueIcon, QuranIcon } from './IslamicIcons';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-primary-50 dark:border-primary-900/30 pb-safe z-40 transition-colors duration-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <MosqueIcon size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        
        <Link 
          to="/quran" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/quran') || isActive('/surah') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <QuranIcon size={24} strokeWidth={isActive('/quran') || isActive('/surah') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Quran</span>
        </Link>

        <Link 
          to="/bookmarks"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/bookmarks') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <Bookmark size={24} strokeWidth={isActive('/bookmarks') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Tandai</span>
        </Link>
        
        <Link 
          to="/settings"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/settings') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        >
          <SettingsIcon size={24} strokeWidth={isActive('/settings') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Pengaturan</span>
        </Link>
      </div>
    </div>
  );
};
