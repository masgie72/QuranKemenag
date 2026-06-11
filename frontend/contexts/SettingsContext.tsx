import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  showTajweed: boolean;
  toggleTajweed: () => void;
  showTranslation: boolean;
  toggleTranslation: () => void;
  showLatin: boolean;
  toggleLatin: () => void;
  showTafsir: boolean;
  toggleTafsir: () => void;
  isAdzanEnabled: boolean;
  toggleAdzan: () => void;
  arabicFontSize: number;
  setArabicFontSize: (size: number) => void;
  selectedReciter: string;
  setSelectedReciter: (id: string) => void;
  arabicFontFamily: string;
  setArabicFontFamily: (font: string) => void;
  latinFontFamily: string;
  setLatinFontFamily: (font: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper functions for safe localStorage access
const getSavedValue = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    if (item !== null) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.warn(`Error reading localStorage item ${key}`, error);
  }
  return defaultValue;
};

const setSavedValue = <T,>(key: string, value: T) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage item ${key}`, error);
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state safely from localStorage
  const [showTajweed, setShowTajweed] = useState<boolean>(() => getSavedValue('showTajweed', false));
  const [showTranslation, setShowTranslation] = useState<boolean>(() => getSavedValue('showTranslation', true));
  const [showLatin, setShowLatin] = useState<boolean>(() => getSavedValue('showLatin', true));
  const [showTafsir, setShowTafsir] = useState<boolean>(() => getSavedValue('showTafsir', false));
  const [isAdzanEnabled, setIsAdzanEnabled] = useState<boolean>(() => getSavedValue('isAdzanEnabled', false));
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => getSavedValue('arabicFontSize', 3));
  const [selectedReciter, setSelectedReciter] = useState<string>(() => getSavedValue('selectedReciter', '05'));
  const [arabicFontFamily, setArabicFontFamily] = useState<string>(() => getSavedValue('arabicFontFamily', 'font-arabic'));
  const [latinFontFamily, setLatinFontFamily] = useState<string>(() => getSavedValue('latinFontFamily', 'font-sans'));

  // Save to localStorage whenever state changes
  useEffect(() => setSavedValue('showTajweed', showTajweed), [showTajweed]);
  useEffect(() => setSavedValue('showTranslation', showTranslation), [showTranslation]);
  useEffect(() => setSavedValue('showLatin', showLatin), [showLatin]);
  useEffect(() => setSavedValue('showTafsir', showTafsir), [showTafsir]);
  useEffect(() => setSavedValue('isAdzanEnabled', isAdzanEnabled), [isAdzanEnabled]);
  useEffect(() => setSavedValue('arabicFontSize', arabicFontSize), [arabicFontSize]);
  useEffect(() => setSavedValue('selectedReciter', selectedReciter), [selectedReciter]);
  useEffect(() => setSavedValue('arabicFontFamily', arabicFontFamily), [arabicFontFamily]);
  useEffect(() => setSavedValue('latinFontFamily', latinFontFamily), [latinFontFamily]);

  const toggleTajweed = () => setShowTajweed((prev) => !prev);
  const toggleTranslation = () => setShowTranslation((prev) => !prev);
  const toggleLatin = () => setShowLatin((prev) => !prev);
  const toggleTafsir = () => setShowTafsir((prev) => !prev);
  const toggleAdzan = () => {
    setIsAdzanEnabled((prev) => {
      const newState = !prev;
      if (newState && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      return newState;
    });
  };

  return (
    <SettingsContext.Provider value={{ 
      showTajweed, toggleTajweed, 
      showTranslation, toggleTranslation, 
      showLatin, toggleLatin,
      showTafsir, toggleTafsir,
      isAdzanEnabled, toggleAdzan,
      arabicFontSize, setArabicFontSize,
      selectedReciter, setSelectedReciter,
      arabicFontFamily, setArabicFontFamily,
      latinFontFamily, setLatinFontFamily
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
