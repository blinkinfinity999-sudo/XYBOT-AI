import React, { useState } from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  isPremium?: boolean;
  animate?: boolean;
}

export const XYBotLogo: React.FC<LogoProps> = ({
  size = 36,
  className = '',
  isPremium = false,
  animate = true,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      id="xybot_logo_container"
      className={`relative flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Dynamic Ambient Glow Field */}
      <div
        className={`absolute inset-0 rounded-2xl blur-md transition-all duration-500 pointer-events-none ${
          isPremium
            ? 'bg-gradient-to-tr from-amber-500/60 via-yellow-400/50 to-amber-200/40'
            : 'bg-gradient-to-tr from-[#00f2ff]/60 via-[#7000ff]/50 to-[#ff007a]/40'
        } ${animate ? 'animate-pulse' : ''}`}
      />

      {!imageError ? (
        <div
          className="relative z-10 w-full h-full rounded-2xl overflow-hidden flex items-center justify-center bg-black/90 border border-white/10 shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-transform hover:scale-105"
        >
          <img
            src={`${(import.meta as any).env.BASE_URL || '/'}xybot-logo.png`}
            alt="XYBOT AI"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_0_18px_rgba(0,242,255,0.7)]"
        >
          <defs>
            <linearGradient id="cyberHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2ff" />
              <stop offset="45%" stopColor="#7000ff" />
              <stop offset="100%" stopColor="#ff007a" />
            </linearGradient>
            <linearGradient id="goldHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
          <polygon
            points="60,8 108,34 108,86 60,112 12,86 12,34"
            stroke={isPremium ? 'url(#goldHexGrad)' : 'url(#cyberHexGrad)'}
            strokeWidth="4"
            fill="#060813"
            fillOpacity="0.94"
            strokeLinejoin="round"
          />
          <text
            x="60"
            y="70"
            textAnchor="middle"
            fill="#00f2ff"
            fontSize="32"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            XY
          </text>
        </svg>
      )}
    </div>
  );
};

// Backward compatibility alias
export const AetherLogo = XYBotLogo;
