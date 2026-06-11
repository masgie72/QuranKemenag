import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BookmarkItem {
  surahId: number;
  ayahId: number;
  surahName: string;
}

interface BookmarkContextType {
  bookmarks: BookmarkItem[];
  toggleBookmark: (item: BookmarkItem) => void;
  isBookmarked: (surahId: number, ayahId: number) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const BOOKMARKS_KEY = 'quran_bookmarks';

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = window.localStorage.getItem(BOOKMARKS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to load bookmarks', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Failed to save bookmarks', e);
    }
  }, [bookmarks]);

  const toggleBookmark = (item: BookmarkItem) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.surahId === item.surahId && b.ayahId === item.ayahId);
      if (exists) {
        return prev.filter((b) => !(b.surahId === item.surahId && b.ayahId === item.ayahId));
      } else {
        // Add to beginning of list
        return [item, ...prev];
      }
    });
  };

  const isBookmarked = (surahId: number, ayahId: number) => {
    return bookmarks.some((b) => b.surahId === surahId && b.ayahId === ayahId);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmark = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
};
