'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';

interface HeroBannerProps {
  displayName: string;
  activeOrdersCount: number;
}

export function HeroBanner({
  displayName,
  activeOrdersCount,
}: HeroBannerProps) {
  const countString = `${activeOrdersCount} active ${
    activeOrdersCount === 1 ? 'order' : 'orders'
  }`;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#F8E9E0] via-[#F7ECE4] to-[#F5DDD8] p-4 sm:p-5 sm:pl-8 sm:pr-6 min-h-[130px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 shadow-[0_4px_20px_rgba(122,16,56,0.05)] border border-[#F1E6E1]/70">
      {/* 1. Greeting block */}
      <div className="w-full sm:w-[260px] lg:w-[280px] sm:shrink-0">
        <p className="text-xs sm:text-[14px] text-[#6B6B7B] font-medium leading-tight">
          Welcome back,
        </p>
        <h1 className="text-[20px] sm:text-[24px] lg:text-[27px] font-bold text-[#1A1A2E] tracking-tight mt-0.5 leading-snug">
          {displayName}
        </h1>
        <p className="text-xs sm:text-[13px] text-[#6B6B7B] mt-1 leading-normal">
          You have{' '}
          <strong className="font-bold text-[#7A1038]">{countString}</strong> in
          tailoring production.
        </p>
        <div className="h-[2px] w-[36px] bg-[#7A1038] mt-2 sm:mt-2.5 rounded-full" />
      </div>

      {/* 2. Tagline – grows to fill remaining space */}
      <div className="hidden lg:flex flex-1 items-center justify-center select-none min-w-0 -translate-x-6 xl:-translate-x-10">
        <p className="font-serif italic text-[#1A1A2E] text-[13.5px] xl:text-[15px] leading-snug text-center">
          Traditional Craft
          <br />
          Modern Comfort
        </p>
      </div>

      {/* 3. Suit image – inline flex item with margin right to avoid button overlap */}
      <div
        aria-hidden="true"
        className="hidden lg:block shrink-0 relative h-[130px] w-[160px] xl:w-[185px] pointer-events-none select-none overflow-hidden mr-5 xl:mr-7"
      >
        <Image
          src="/images/dashboard/suit_banner.png"
          alt=""
          fill
          priority
          sizes="185px"
          className="object-contain object-center"
        />
      </div>

      {/* 4. Button – full-width on mobile, auto on tablet/desktop */}
      <Link
        href="/new-order"
        className="w-full sm:w-auto sm:shrink-0 sm:ml-auto"
      >
        <button className="w-full sm:w-auto h-10 px-4 sm:px-5 rounded-[10px] bg-[#7A1038] hover:bg-[#650D2F] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-[#7A1038]/25 transition-all duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap">
          <Plus size={15} className="stroke-[2.5]" />
          <span>Place New Order</span>
        </button>
      </Link>
    </div>
  );
}
