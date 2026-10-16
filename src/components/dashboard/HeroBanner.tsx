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
    <div className="rounded-2xl bg-gradient-to-r from-[#F8E9E0] via-[#F7ECE4] to-[#F5DDD8] pl-6 sm:pl-8 pr-5 sm:pr-6 py-5 min-h-[130px] flex items-center gap-4 xl:gap-6 shadow-[0_4px_20px_rgba(122,16,56,0.05)] border border-[#F1E6E1]/70">
      {/* 1. Greeting block */}
      <div className="shrink-0 w-[240px] sm:w-[280px]">
        <p className="text-[14px] text-[#6B6B7B] font-medium leading-tight">
          Welcome back,
        </p>
        <h1 className="text-[24px] sm:text-[27px] font-bold text-[#1A1A2E] tracking-tight mt-0.5 leading-snug">
          {displayName}
        </h1>
        <p className="text-[13px] text-[#6B6B7B] mt-1 leading-normal">
          You have{' '}
          <strong className="font-bold text-[#7A1038]">{countString}</strong> in
          tailoring production.
        </p>
        <div className="h-[2px] w-[36px] bg-[#7A1038] mt-2.5 rounded-full" />
      </div>

      {/* 2. Tagline – grows to fill remaining space */}
      <div className="hidden lg:flex flex-1 items-center justify-center select-none min-w-0">
        <p className="font-serif italic text-[#1A1A2E] text-[17px] xl:text-[19px] leading-snug text-center">
          Traditional Craft
          <br />
          Modern Comfort
        </p>
      </div>

      {/* 3. Suit image – inline flex item, clips to banner height via overflow-hidden wrapper */}
      <div
        aria-hidden="true"
        className="hidden lg:block shrink-0 relative h-[130px] w-[160px] xl:w-[185px] pointer-events-none select-none overflow-hidden"
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

      {/* 4. Button */}
      <Link href="/new-order" className="shrink-0">
        <button className="h-10 px-4 xl:px-5 rounded-[10px] bg-[#7A1038] hover:bg-[#650D2F] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-sm shadow-[#7A1038]/25 transition-all duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap">
          <Plus size={15} className="stroke-[2.5]" />
          <span>Place New Order</span>
        </button>
      </Link>
    </div>
  );
}
