import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, MapPin } from 'lucide-react';
import { calculateQibla } from '../utils/qibla';
import { KaabaIcon } from '../components/IslamicIcons';

export const Qibla: React.FC = () => {
  const navigate = useNavigate();
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(true);

  const handleOrientation = useCallback((event: DeviceOrientationEvent | any) => {
    let newHeading = null;

    // iOS devices
    if (event.webkitCompassHeading !== undefined) {
      newHeading = event.webkitCompassHeading;
    } 
    // Android devices (using absolute orientation)
    else if (event.alpha !== null) {
      // alpha is counter-clockwise from North, we need clockwise heading
      newHeading = 360 - event.alpha;
    }

    if (newHeading !== null) {
      setHeading(newHeading);
      setIsCalibrating(false);
    }
  }, []);

  const startCompass = useCallback(() => {
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any);
    } else {
      window.addEventListener('deviceorientation', handleOrientation as any);
    }
  }, [handleOrientation]);

  const stopCompass = useCallback(() => {
    window.removeEventListener('deviceorientationabsolute', handleOrientation as any);
    window.removeEventListener('deviceorientation', handleOrientation as any);
  }, [handleOrientation]);

  useEffect(() => {
    // 1. Get Location for Qibla Angle
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const angle = calculateQibla(pos.coords.latitude, pos.coords.longitude);
          setQiblaAngle(angle);
        },
        (err) => {
          setError('Gagal mendapatkan lokasi. Pastikan GPS aktif untuk menghitung arah kiblat.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError('Geolokasi tidak didukung di perangkat ini.');
    }

    // 2. Setup Compass
    // Check if iOS 13+ permission is needed
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setNeedsPermission(true);
    } else {
      startCompass();
    }

    return () => stopCompass();
  }, [startCompass, stopCompass]);

  const requestPermission = async () => {
    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission();
      if (permission === 'granted') {
        setNeedsPermission(false);
        startCompass();
      } else {
        setError('Izin sensor kompas ditolak. Tidak dapat menampilkan arah.');
      }
    } catch (err) {
      setError('Gagal meminta izin sensor kompas.');
    }
  };

  // Calculate rotations
  // Dial rotates opposite to heading so North is always "up" relative to the real world
  const dialRotation = heading !== null ? -heading : 0;
  // Qibla arrow rotates to the Qibla angle relative to North
  const arrowRotation = qiblaAngle !== null ? qiblaAngle : 0;

  // Check if device is pointing at Qibla (within 5 degrees)
  const isFacingQibla = heading !== null && qiblaAngle !== null && 
    Math.abs((heading - qiblaAngle + 540) % 360 - 180) < 5;

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      {/* Header with Islamic Pattern */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-teal-500 via-emerald-600 to-primary-700 dark:from-gray-900 dark:via-primary-900 dark:to-gray-900 bg-pattern-islamic text-white px-4 py-4 flex items-center shadow-lg rounded-b-2xl transition-colors duration-200">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-white/90 hover:bg-white/20 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-xl text-white ml-2 flex items-center gap-2 drop-shadow-sm">
          <KaabaIcon size={24} className="text-yellow-300" /> Arah Kiblat
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-center flex flex-col items-center gap-3 border border-red-100 dark:border-red-800/30">
            <AlertCircle size={32} />
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-900/50 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : needsPermission ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <KaabaIcon size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Akses Kompas Diperlukan</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Untuk menunjukkan arah kiblat, aplikasi membutuhkan akses ke sensor gerak dan orientasi perangkat Anda.
            </p>
            <button 
              onClick={requestPermission}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-all active:scale-95"
            >
              Berikan Izin
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            
            {/* Status Text */}
            <div className="mb-10 text-center h-16">
              {qiblaAngle === null ? (
                <p className="text-gray-500 dark:text-gray-400 animate-pulse flex items-center justify-center gap-2">
                  <MapPin size={16} /> Mencari lokasi...
                </p>
              ) : isCalibrating ? (
                <p className="text-orange-500 dark:text-orange-400 animate-pulse">
                  Mengkalibrasi kompas... Putar perangkat Anda membentuk angka 8.
                </p>
              ) : isFacingQibla ? (
                <div className="text-primary-600 dark:text-primary-400 font-bold text-xl animate-bounce">
                  Anda menghadap Kiblat!
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-300">
                  <p className="text-sm">Arah Kiblat</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(qiblaAngle)}°</p>
                </div>
              )}
            </div>

            {/* Compass UI */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80">
              {/* Outer Ring (Fixed) */}
              <div className={`absolute inset-0 rounded-full border-8 transition-colors duration-500 ${isFacingQibla ? 'border-primary-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'border-gray-200 dark:border-gray-700 shadow-inner'}`}></div>
              
              {/* Inner Dial (Rotates to keep North up) */}
              <div 
                className="absolute inset-4 rounded-full border-2 border-gray-100 dark:border-gray-800 transition-transform duration-100 ease-out bg-white dark:bg-gray-900 shadow-sm"
                style={{ transform: `rotate(${dialRotation}deg)` }}
              >
                {/* Cardinal Points */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-red-500">U</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-gray-400">S</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-gray-400">T</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-gray-400">B</div>

                {/* Qibla Arrow (Rotates relative to North) */}
                {qiblaAngle !== null && (
                  <div 
                    className="absolute inset-0 transition-transform duration-500 ease-out"
                    style={{ transform: `rotate(${arrowRotation}deg)` }}
                  >
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      {/* Arrow Head */}
                      <div className={`w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[24px] transition-colors duration-300 ${isFacingQibla ? 'border-b-primary-500' : 'border-b-primary-600 dark:border-b-primary-500'}`}></div>
                      {/* Arrow Body */}
                      <div className={`w-2 h-24 rounded-b-full transition-colors duration-300 ${isFacingQibla ? 'bg-primary-500' : 'bg-primary-600 dark:bg-primary-500'}`}></div>
                      {/* Kaaba Icon / Dot */}
                      <div className="w-6 h-6 bg-black border-2 border-yellow-500 mt-1 rounded-sm flex items-center justify-center shadow-md">
                        <div className="w-full h-[2px] bg-yellow-500 mt-[-8px]"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Center Dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 dark:bg-gray-200 rounded-full shadow-md z-10 border-2 border-white dark:border-gray-900"></div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
