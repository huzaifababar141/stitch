'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  ClipboardCheck,
  History,
  LogOut,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function QCLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: 'Inspection Queue', href: '/qc/dashboard', icon: ClipboardCheck },
    { label: 'Audit History', href: '/qc/history', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/qc/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-gray-900 text-base tracking-tight leading-none block">
                  TailorLink<span className="text-purple-700">.pk</span>
                </span>
                <span className="text-[10px] font-bold text-purple-700 tracking-wider uppercase">
                  Quality Assurance Lab
                </span>
              </div>
            </Link>
          </div>

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
                      ? 'bg-purple-50 text-purple-700 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-gray-900 leading-none">
                {user?.user_metadata?.first_name ||
                  user?.email?.split('@')[0] ||
                  'QC Inspector'}
              </span>
              <span className="text-[10px] font-semibold text-purple-600 mt-0.5 flex items-center gap-1">
                <ShieldCheck size={11} /> Certified QC Officer
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        <p>TailorLink Quality Assurance & Compliance Station</p>
      </footer>
    </div>
  );
}
