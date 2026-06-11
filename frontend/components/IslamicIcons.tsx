import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const MosqueIcon: React.FC<IconProps> = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 8A4 4 0 0 0 8 12v9h8v-9a4 4 0 0 0-4-4z" />
    <path d="M12 8v-4" />
    <path d="M12 4l-1 2h2z" />
    <path d="M4 21v-9a2 2 0 0 1 2-2h0" />
    <path d="M20 21v-9a2 2 0 0 0-2-2h0" />
    <path d="M4 10V6l-1 2h2z" />
    <path d="M20 10V6l-1 2h2z" />
    <path d="M2 21h20" />
  </svg>
);

export const QuranIcon: React.FC<IconProps> = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H12" />
    <path d="M20 19.5v-15A2.5 2.5 0 0 0 17.5 2H12" />
    <path d="M12 2v20" />
    <path d="M4 19.5a2.5 2.5 0 0 1 2.5-2.5H12" />
    <path d="M20 19.5a2.5 2.5 0 0 0-2.5-2.5H12" />
    <path d="M8 7h2" />
    <path d="M8 11h2" />
    <path d="M14 7h2" />
    <path d="M14 11h2" />
  </svg>
);

export const KaabaIcon: React.FC<IconProps> = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
    <path d="M3 7l9 5 9-5" />
    <path d="M12 12v10" />
    <path d="M3 10l9 5 9-5" />
    <path d="M3 12l9 5 9-5" />
  </svg>
);

export const CrescentStarIcon: React.FC<IconProps> = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    <path d="M18 8l-1-1-1 1 1 1z" />
  </svg>
);
