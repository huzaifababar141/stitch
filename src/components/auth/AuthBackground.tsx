'use client';

import React from 'react';

/**
 * AuthBackground
 * Renders luxury, bespoke Pakistani tailoring graphics behind Auth pages
 * (Login, Register) at low opacity (4% - 12%) for a sophisticated boutique atelier atmosphere.
 */
export function AuthBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none"
    >
      {/* ── 1. Soft Base Gradient Canvas ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FCFBFD] via-[#F8F4F9] to-[#F3EBF4]" />

      {/* ── 2. Subtle Boutique Atelier Photo Watermark ── */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-multiply bg-cover bg-center filter grayscale contrast-125"
        style={{ backgroundImage: `url('/login_bg.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/80" />

      {/* ── 3. Ambient Radiant Glow Orbs ── */}
      <div className="absolute -top-24 -right-24 h-[520px] w-[520px] rounded-full bg-[#7E153A]/[0.07] blur-3xl" />
      <div className="absolute -bottom-28 -left-28 h-[540px] w-[540px] rounded-full bg-[#9B1B4A]/[0.06] blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[680px] w-[680px] rounded-full bg-purple-100/30 blur-[120px]" />

      {/* ── 4. Tailor Grid & Basting Stitch Matrix ── */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.035]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="tailor-grid-pattern"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Fine dashed basting grid */}
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#7E153A"
              strokeWidth="0.8"
              strokeDasharray="4 4"
            />
            {/* Cross-stitch intersection point */}
            <path
              d="M 28 30 L 32 30 M 30 28 L 30 32"
              fill="none"
              stroke="#7E153A"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tailor-grid-pattern)" />
      </svg>

      {/* ── 5. Vector Graphics (Tailoring & Craftsmanship Watermarks) ── */}

      {/* Top-Left: Vintage Tailor Shears (Scissors) */}
      <svg
        className="absolute top-8 left-6 sm:top-14 sm:left-14 h-40 w-40 sm:h-56 sm:w-56 text-[#7E153A] opacity-[0.08] transition-transform duration-1000 -rotate-12"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Blade 1 */}
        <path
          d="M35 155 C 45 130, 75 105, 95 95 L 180 30 C 185 27, 182 20, 175 22 L 85 75 C 75 65, 55 55, 30 75 C 10 90, 15 125, 35 155 Z"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Blade 2 */}
        <path
          d="M155 165 C 130 155, 105 125, 95 105 L 30 20 C 27 15, 20 18, 22 25 L 75 115 C 65 125, 55 145, 75 170 C 90 190, 125 185, 155 165 Z"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Pivot Bolt */}
        <circle cx="95" cy="100" r="5" fill="currentColor" />
        <circle
          cx="95"
          cy="100"
          r="8"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Handle loops inner holes */}
        <ellipse
          cx="32"
          cy="85"
          rx="14"
          ry="18"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <ellipse
          cx="85"
          cy="170"
          rx="18"
          ry="14"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      </svg>

      {/* Top-Right: Intricate Paisley (Boteh) Embroidery Motif */}
      <svg
        className="absolute -top-6 right-4 sm:top-8 sm:right-16 h-48 w-48 sm:h-64 sm:w-64 text-[#7E153A] opacity-[0.07] rotate-6"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Paisley Teardrop Curve */}
        <path
          d="M120 220 C 60 220, 30 170, 30 120 C 30 65, 80 30, 140 20 C 180 15, 205 35, 200 65 C 195 90, 160 95, 150 75 C 145 65, 155 50, 140 50 C 110 50, 75 80, 75 125 C 75 160, 95 185, 130 185 C 170 185, 190 145, 185 105"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Inner Jaal Embroidery Flow */}
        <path
          d="M120 195 C 80 195, 55 160, 55 125 C 55 85, 90 60, 135 55"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Floral Rosette within Paisley */}
        <circle
          cx="115"
          cy="130"
          r="14"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="115" cy="130" r="4" fill="currentColor" />
        <path
          d="M115 110 L 115 116 M 115 144 L 115 150 M 95 130 L 101 130 M 129 130 L 135 130 M 101 116 L 105 120 M 125 140 L 129 144 M 101 144 L 105 140 M 125 120 L 129 116"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Curved Vine Leaflettes */}
        <path
          d="M80 145 C 70 140, 65 155, 75 160 C 85 165, 90 150, 80 145 Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M145 155 C 140 165, 155 170, 160 160 C 165 150, 150 145, 145 155 Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M170 85 C 180 80, 185 95, 175 100 C 165 105, 160 90, 170 85 Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>

      {/* Center Left: Floating Needle with Flowing Thread Curve */}
      <svg
        className="absolute top-1/3 -left-6 sm:left-6 h-52 w-52 sm:h-64 sm:w-64 text-[#7E153A] opacity-[0.09] -rotate-45"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Needle body */}
        <path
          d="M30 170 L 165 35 C 168 32, 172 32, 174 35 C 176 37, 176 41, 173 44 L 38 178 C 34 182, 28 182, 25 178 C 22 174, 25 166, 30 170 Z"
          fill="currentColor"
        />
        {/* Needle eye */}
        <ellipse
          cx="163"
          cy="42"
          rx="2"
          ry="5"
          transform="rotate(-45 163 42)"
          fill="#FAF8FA"
        />
        {/* Flowing Hand Stitch Thread Bezier curve */}
        <path
          d="M165 40 C 200 20, 210 90, 170 120 C 130 150, 100 110, 80 140 C 60 170, 40 180, 10 190"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
      </svg>

      {/* Bottom-Left: Bespoke Tailor's Dress Form (Mannequin) */}
      <svg
        className="absolute bottom-6 left-4 sm:bottom-12 sm:left-14 h-48 w-48 sm:h-64 sm:w-64 text-[#7E153A] opacity-[0.075]"
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Finial / Neck Top */}
        <ellipse
          cx="100"
          cy="22"
          rx="9"
          ry="6"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path d="M100 16 L 100 26" stroke="currentColor" strokeWidth="2" />
        <path
          d="M92 28 C 92 28, 100 32, 108 28 L 112 36 L 88 36 Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Torso Form */}
        <path
          d="M88 36 C 75 40, 60 48, 54 62 C 48 76, 52 92, 60 102 C 68 112, 70 120, 68 132 C 66 142, 58 152, 58 160 C 58 168, 80 172, 100 172 C 120 172, 142 168, 142 160 C 142 152, 134 142, 132 132 C 130 120, 132 112, 140 102 C 148 92, 152 76, 146 62 C 140 48, 125 40, 112 36 Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Torso Seam Contour Lines */}
        <path
          d="M100 36 L 100 172"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeDasharray="4 4"
        />
        <path
          d="M60 100 C 80 108, 120 108, 140 100"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M68 132 C 84 138, 116 138, 132 132"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        {/* Wooden Stand & Tripod Base */}
        <path
          d="M100 172 L 100 230"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="100" cy="188" r="5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M100 216 L 70 236 M 100 216 L 130 236 M 100 218 L 100 238"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* Bottom-Right: Curved Tailor's Tape Measure with Tick Marks */}
      <svg
        className="absolute -bottom-8 right-2 sm:bottom-6 sm:right-12 h-56 w-56 sm:h-72 sm:w-72 text-[#7E153A] opacity-[0.08] -rotate-6"
        viewBox="0 0 260 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tape Ribbon Body (Curved Ribbon) */}
        <path
          d="M20 220 C 70 210, 110 170, 140 130 C 170 90, 200 70, 240 60"
          stroke="currentColor"
          strokeWidth="24"
          strokeLinecap="round"
        />
        {/* Tape Inner Channel Highlight */}
        <path
          d="M20 220 C 70 210, 110 170, 140 130 C 170 90, 200 70, 240 60"
          stroke="#FAF8FA"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {/* Brass End Clip */}
        <path
          d="M236 50 L 244 70"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Graduated Tick Marks along Tape Curve */}
        <path
          d="M32 216 L 35 224 M 46 208 L 49 216 M 60 198 L 65 208 M 74 186 L 77 194 M 88 174 L 95 186 M 102 160 L 105 168 M 116 146 L 123 158 M 130 132 L 133 140 M 144 118 L 151 130 M 158 106 L 161 114 M 172 96 L 179 108 M 186 86 L 189 94 M 200 78 L 207 90 M 214 72 L 217 80 M 228 66 L 235 78"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Measuring Tape Number Markers */}
        <circle cx="62" cy="203" r="1.5" fill="currentColor" />
        <circle cx="92" cy="180" r="1.5" fill="currentColor" />
        <circle cx="120" cy="152" r="1.5" fill="currentColor" />
        <circle cx="148" cy="124" r="1.5" fill="currentColor" />
        <circle cx="176" cy="102" r="1.5" fill="currentColor" />
      </svg>

      {/* Floating Bespoke Buttons */}
      <svg
        className="absolute top-28 right-1/4 h-16 w-16 text-[#7E153A] opacity-[0.07] rotate-12 hidden md:block"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="30" cy="30" r="24" stroke="currentColor" strokeWidth="3" />
        <circle
          cx="30"
          cy="30"
          r="18"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="24" cy="24" r="2.5" fill="currentColor" />
        <circle cx="36" cy="24" r="2.5" fill="currentColor" />
        <circle cx="24" cy="36" r="2.5" fill="currentColor" />
        <circle cx="36" cy="36" r="2.5" fill="currentColor" />
        {/* Cross Stitch thread */}
        <path
          d="M24 24 L 36 36 M 36 24 L 24 36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="absolute bottom-36 left-1/4 h-14 w-14 text-[#7E153A] opacity-[0.06] -rotate-12 hidden md:block"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="30"
          cy="30"
          r="22"
          stroke="currentColor"
          strokeWidth="2.8"
        />
        <circle
          cx="30"
          cy="30"
          r="16"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="24" cy="24" r="2.2" fill="currentColor" />
        <circle cx="36" cy="24" r="2.2" fill="currentColor" />
        <circle cx="24" cy="36" r="2.2" fill="currentColor" />
        <circle cx="36" cy="36" r="2.2" fill="currentColor" />
        {/* Parallel Stitch thread */}
        <path
          d="M24 24 L 36 24 M 24 36 L 36 36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Decorative Corner Stitch Frame (Subtle running stitch boundary) */}
      <div className="absolute top-4 left-4 h-24 w-24 border-t-2 border-l-2 border-[#7E153A]/[0.08] border-dashed rounded-tl-2xl pointer-events-none hidden lg:block" />
      <div className="absolute top-4 right-4 h-24 w-24 border-t-2 border-r-2 border-[#7E153A]/[0.08] border-dashed rounded-tr-2xl pointer-events-none hidden lg:block" />
      <div className="absolute bottom-4 left-4 h-24 w-24 border-b-2 border-l-2 border-[#7E153A]/[0.08] border-dashed rounded-bl-2xl pointer-events-none hidden lg:block" />
      <div className="absolute bottom-4 right-4 h-24 w-24 border-b-2 border-r-2 border-[#7E153A]/[0.08] border-dashed rounded-br-2xl pointer-events-none hidden lg:block" />
    </div>
  );
}
