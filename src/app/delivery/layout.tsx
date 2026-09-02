'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Truck,
  PackageCheck,
  Navigation,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-gray-900 font-sans flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/delivery/dashboard"
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-gray-900 text-base tracking-tight leading-none block">
                  TailorLink<span className="text-emerald-700">.pk</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">
                  Courier Delivery Portal
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-gray-900 leading-none">
                {user?.user_metadata?.first_name ||
                  user?.email?.split('@')[0] ||
                  'Delivery Rider'}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{' '}
                On Route
              </span>
            </div>

            <button
              onClick={() => signOut()}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        <p>TailorLink Courier Logistics & TCS Dispatch Fleet</p>
      </footer>
    </div>
  );
}
