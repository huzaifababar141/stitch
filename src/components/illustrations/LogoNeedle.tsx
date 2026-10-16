import React from 'react';

export function LogoNeedle({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Looping graceful maroon thread curl */}
      <path
        d="M6 7.5C4 10 4 13.5 7 16C10 18.5 14.5 17 17.5 13.5C20.5 10 19.5 5.5 16.5 5.5C13.5 5.5 11.5 8 13.5 12C15.5 16 21 23 25.5 27.5"
        stroke="#7A1038"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Needle shaft through the loop */}
      <path
        d="M22 24L27 29"
        stroke="#7A1038"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Needle eye dot */}
      <circle cx="7" cy="9.5" r="1.3" fill="#7A1038" />
    </svg>
  );
}
