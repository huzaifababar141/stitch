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
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/auth_bg.png')",
        backgroundColor: '#FAF8F5',
      }}
    >
      {/* Gentle center focus veil to keep form card crisp while leaving brass shears, spools, and fabrics visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/15" />
      <div className="absolute -top-20 -right-20 h-[480px] w-[480px] rounded-full bg-[#7E153A]/[0.04] blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-[480px] w-[480px] rounded-full bg-[#9B1B4A]/[0.03] blur-3xl" />
    </div>
  );
}
