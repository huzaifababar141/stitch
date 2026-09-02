'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Scissors,
  LayoutDashboard,
  PackageCheck,
  Award,
  LogOut,
  Bell,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function TailorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    {
      label: 'Workshop Dashboard',
      href: '/tailor/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Stitching Queue',
      href: '/tailor/dashboard#queue',
      icon: PackageCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F9] text-gray-900 font-sans flex flex-col">
      {/* Workshop Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <Link href="/tailor/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#7E153A] text-white flex items-center justify-center shadow-xs">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-gray-900 text-base tracking-tight leading-none block">
                  TailorLink<span className="text-[#7E153A]">.pk</span>
                </span>
                <span className="text-[10px] font-bold text-[#7E153A] tracking-wider uppercase">
                  Workshop Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-red-50 text-[#7E153A] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Master Profile & Signout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-gray-900 leading-none">
                {user?.user_metadata?.first_name
                  ? `Ustad ${user.user_metadata.first_name}`
                  : user?.email?.split('@')[0] || 'Master Tailor'}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active on Duty
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer Notice */}
      <footer className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        <p>TailorLink Workshop Management System · Internal Use Only</p>
      </footer>
    </div>
  );
}
