import React from 'react';

interface DeeMakerLogoProps {
  size?: number | string;
  className?: string;
}

export const DeeMakerLogo: React.FC<DeeMakerLogoProps> = ({ size = 36, className = '' }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      className={`shrink-0 overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id="dee-maker-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb"/>
          <stop offset="55%" stopColor="#3b5bfd"/>
          <stop offset="100%" stopColor="#4338ca"/>
        </linearGradient>
        <linearGradient id="dee-maker-shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35"/>
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="188" height="188" rx="44" fill="url(#dee-maker-bg)" />
      <rect x="6" y="6" width="188" height="188" rx="44" fill="url(#dee-maker-shine)" />
      <g fill="#ffffff">
        <rect x="54" y="50" width="22" height="100" rx="10"/>
        <path d="M65 50 h20 a50 50 0 0 1 0 100 h-20 z" fill="none" stroke="#ffffff" strokeWidth="22" strokeLinejoin="round"/>
      </g>
      <g fill="#ffd166">
        <rect x="140" y="108" width="14" height="26" rx="5"/>
        <rect x="160" y="90" width="14" height="44" rx="5"/>
      </g>
      <circle cx="150" cy="150" r="7" fill="#ffffff"/>
    </svg>
  );
};
