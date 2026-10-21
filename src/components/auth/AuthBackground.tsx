'use client';

import React from 'react';

/**
 * AuthBackground
 * Renders the custom textile atelier flat lay photograph behind Auth pages
 * (Login, Register) using direct CSS background for 100% instant reliability.
 */
export function AuthBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#FAF8F5]"
    >
      <img
        src="/images/auth_bg.png"
        alt=""
        className="h-full w-full object-cover object-right sm:object-center"
      />
      {/* 55% white overlay on mobile so text stays readable, softer veil on desktop */}
      <div className="absolute inset-0 bg-white/55 sm:bg-white/10" />
      <div className="absolute inset-0 hidden sm:block bg-gradient-to-t from-white/20 via-transparent to-white/15" />
      <div className="absolute -top-20 -right-20 h-[480px] w-[480px] rounded-full bg-[#7E153A]/[0.04] blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-[480px] w-[480px] rounded-full bg-[#9B1B4A]/[0.03] blur-3xl" />
    </div>
  );
}
