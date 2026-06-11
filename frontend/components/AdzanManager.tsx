import React, { useEffect, useState, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';
import { useSettings } from '../contexts/SettingsContext';

const ADZAN_AUDIO_URL = 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg'; 

export const AdzanManager: React.FC = () => {
  const { prayerData } = usePrayerTimes();
  const prayerTimes = prayerData?.data.timings || null;
  const { isAdzanEnabled } = useSettings();
  
  const [lastPlayedPrayer, setLastPlayedPrayer] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(ADZAN_AUDIO_URL);
    audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
      }
    };
  }, []);

  useEffect(() => {
    if (!isAdzanEnabled || !prayerTimes) return;

    const checkTime = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const prayersToAlert = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

      for (const prayer of prayersToAlert) {
        const time = prayerTimes[prayer];
        if (time) {
          const prayerTimeStr = time.substring(0, 5); 
          
          if (currentTimeStr === prayerTimeStr && lastPlayedPrayer !== prayer) {
            playAdzan(prayer);
            break;
          }
        }
      }
    };

    const intervalId = setInterval(checkTime, 30000);
    checkTime();

    return () => clearInterval(intervalId);
  }, [isAdzanEnabled, prayerTimes, lastPlayedPrayer]);

  const playAdzan = (prayerName: string) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setLastPlayedPrayer(prayerName);
        if (Notification.permission === 'granted') {
          new Notification(`Waktu Shalat ${prayerName}`, {
            body: `Telah masuk waktu shalat ${prayerName} untuk wilayah Anda.`,
            icon: 'https://picsum.photos/100'
          });
        }
      }).catch(err => {
        console.error("Failed to play adzan audio:", err);
      });
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Hanya tampilkan tombol melayang jika adzan sedang berbunyi (untuk mematikannya)
  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
      <button 
        onClick={stopAudio}
        className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse"
      >
        <Volume2 size={20} />
        <span>Hentikan Suara</span>
      </button>
    </div>
  );
};
