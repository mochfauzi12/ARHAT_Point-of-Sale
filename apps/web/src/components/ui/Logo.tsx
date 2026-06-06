import React from 'react';

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  showText?: boolean;
}

export function Logo({ className = '', width = 48, height = 48, showText = false }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.05))' }}
      >
        <defs>
          <linearGradient id="arrowGradient" x1="50" y1="90" x2="105" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0E8A94" />
            <stop offset="0.5" stopColor="#F39C12" />
            <stop offset="1" stopColor="#D35400" />
          </linearGradient>
          <linearGradient id="cartGradient" x1="15" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1ABC9C" />
            <stop offset="1" stopColor="#0B5A63" />
          </linearGradient>
        </defs>

        {/* Wheels */}
        <circle cx="55" cy="100" r="8" fill="#0B5A63" />
        <circle cx="85" cy="100" r="8" fill="#0B5A63" />
        <circle cx="55" cy="100" r="3" fill="white" />
        <circle cx="85" cy="100" r="3" fill="white" />

        {/* Cart Body Base & Handle */}
        <path 
          d="M20 30 L35 30 L48 85 L90 85 C96 85 100 81 100 75" 
          stroke="url(#cartGradient)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Cart Top Line */}
        <path 
          d="M40 45 L80 45" 
          stroke="#0E8A94" 
          strokeWidth="5" 
          strokeLinecap="round" 
        />

        {/* Smiley Face */}
        <path d="M55 58 Q58 53 61 58" stroke="#0E8A94" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M71 58 Q74 53 77 58" stroke="#0E8A94" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M58 68 Q66 76 74 68" stroke="#0E8A94" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Upward Arrow / Front Sweep */}
        <path 
          d="M48 92 C 75 92, 95 60, 105 25" 
          stroke="url(#arrowGradient)" 
          strokeWidth="8" 
          strokeLinecap="round" 
          fill="none" 
        />
        <path 
          d="M88 28 L108 20 L105 42" 
          stroke="#D35400" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none" 
        />
      </svg>
      
      {showText && (
        <div className="mt-3 text-center">
          <div className="text-[#0B5A63] font-black tracking-tighter leading-none" style={{ fontSize: typeof width === 'number' ? width * 0.45 : '2rem', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
            TRANSAKSI KITA
          </div>
          <div className="text-gray-500 font-medium mt-1 tracking-wide uppercase" style={{ fontSize: typeof width === 'number' ? width * 0.12 : '0.6rem' }}>
            Seamless Payments. Effortless Management.
          </div>
        </div>
      )}
    </div>
  );
}
