import React from 'react';
import { MosqueIcon } from './IslamicIcons';

interface SplashScreenProps {
  isFading: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isFading }) => {
  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-teal-500 via-emerald-600 to-primary-700 transition-opacity duration-500 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern-islamic opacity-30"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm mb-6 shadow-2xl border border-white/20 animate-pulse">
          <MosqueIcon size={64} className="text-yellow-300 drop-shadow-lg" />
        </div>
        <h1 className="text-3xl font-bold text-white drop-shadow-md mb-2 tracking-wide">Quran Kemenag</h1>
        <p className="text-primary-100 text-sm tracking-widest uppercase font-medium">Digital & Jadwal Shalat</p>
      </div>

      {/* Loader */}
      <div className="absolute bottom-16 relative z-10">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};
