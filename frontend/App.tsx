import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { QuranList } from './pages/QuranList';
import { SurahDetail } from './pages/SurahDetail';
import { Settings } from './pages/Settings';
import { Qibla } from './pages/Qibla';
import { Bookmarks } from './pages/Bookmarks';
import { BottomNav } from './components/BottomNav';
import { AdzanManager } from './components/AdzanManager';
import { SplashScreen } from './components/SplashScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { PrayerTimesProvider } from './contexts/PrayerTimesContext';
import { BookmarkProvider } from './contexts/BookmarkContext';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Show splash for 2 seconds, then start fading
    const timer1 = setTimeout(() => {
      setIsFading(true);
    }, 2000);

    // Remove from DOM after fade transition (500ms)
    const timer2 = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <ThemeProvider>
      <SettingsProvider>
        <PrayerTimesProvider>
          <BookmarkProvider>
            {showSplash && <SplashScreen isFading={isFading} />}
            <Router>
              <div className="min-h-screen font-sans text-gray-900 dark:text-gray-100 selection:bg-primary-200 selection:text-primary-900 dark:selection:bg-primary-900 dark:selection:text-primary-100 transition-colors duration-200">
                <main className="mx-auto max-w-md bg-white dark:bg-gray-900 min-h-screen shadow-xl relative transition-colors duration-200">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/quran" element={<QuranList />} />
                    <Route path="/surah/:id" element={<SurahDetail />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/qibla" element={<Qibla />} />
                  </Routes>
                  <AdzanManager />
                  <BottomNav />
                </main>
              </div>
            </Router>
          </BookmarkProvider>
        </PrayerTimesProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
