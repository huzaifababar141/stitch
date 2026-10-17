import React from 'react';

export function SidebarPromoCard() {
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden bg-gradient-to-br from-[#FBE6E8] to-[#F7D9DC] border border-[#F2DDD6] shadow-xs select-none">
      <div className="relative z-10">
        <p className="font-serif italic text-[#1A1A2E] text-[15px] leading-[1.25]">
          Stitching
          <br />
          <span className="text-[#1A1A2E]">your style,</span>
          <br />
          <span className="text-[#1A1A2E]">our passion</span>
        </p>

        {/* Small subtle swoosh underline beneath the text */}
        <div className="mt-1 w-14">
          <svg
            viewBox="0 0 56 6"
            fill="none"
            className="w-full h-1.5"
            aria-hidden="true"
          >
            <path
              d="M1 4C14 1.5 35 1.5 55 4"
              stroke="#7A1038"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Needle with looping maroon thread curl at bottom right */}
      <div className="absolute -bottom-1 -right-1 opacity-80 pointer-events-none">
        <svg
          width="68"
          height="56"
          viewBox="0 0 68 56"
          fill="none"
          aria-hidden="true"
        >
          {/* Thread loop */}
          <path
            d="M12 44C22 44 32 50 42 40C50 30 52 16 58 10"
            stroke="#7A1038"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Needle eye and tip */}
          <path
            d="M56 14L60 8L62 13"
            stroke="#7A1038"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="59" cy="9.5" r="1.3" fill="#7A1038" />
        </svg>
      </div>
    </div>
  );
}
