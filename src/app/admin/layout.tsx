'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ShieldCheck,
  Truck,
  TrendingUp,
  Settings,
  Bell,
  Search,
  LogOut,
  Scissors,
  Menu,
  X,
} from 'lucide-react';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: ShoppingBag, label: 'Orders Control', href: '/admin/orders' },
  { icon: Users, label: 'Tailor Management', href: '/admin/tailors' },
  { icon: ShieldCheck, label: 'Quality Control', href: '/admin/qc' },
  { icon: Truck, label: 'TCS Delivery Sync', href: '/admin/delivery' },
  { icon: TrendingUp, label: 'Revenue Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'System Settings', href: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live Supabase Realtime alerts for Admin
  const { newOrdersCount, resetNewOrdersCount } = useAdminRealtime();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-[#7E153A] text-white flex-col justify-between fixed h-full z-30 shadow-xl">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold border border-white/20">
                <Scissors size={20} />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                  TailorLink<span className="text-pink-200">.pk</span>
                </h1>
                <span className="inline-block mt-1 text-[9px] uppercase tracking-widest bg-white/15 px-2 py-0.5 rounded-full font-bold text-pink-100">
                  Admin Command
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {ADMIN_NAV.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-[#7E153A] shadow-lg shadow-black/10'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? 'text-[#7E153A]' : 'text-white/70'}
                  />
                  {item.label}
                  {item.label === 'Orders Control' && newOrdersCount > 0 && (
                    <span className="ml-auto bg-white text-[#7E153A] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      +{newOrdersCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Status */}
        <div className="p-4 border-t border-white/10 bg-[#630F2D]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white">
                SA
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">
                  Super Admin
                </p>
                <p className="text-[10px] text-white/70 mt-0.5">
                  admin@tailorlink.pk
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="text-white/70 hover:text-white transition-colors"
              title="Log Out"
            >
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Body */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Operational Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-20 shadow-xs">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Global Search Bar */}
          <div className="relative w-64 sm:w-96 hidden sm:block">
            <input
              type="text"
              placeholder="Search orders, tracking #, tailors, or customers..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#7E153A] focus:bg-white transition-all"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>

          {/* Live Status Indicator & Admin Profile */}
          <div className="flex items-center gap-4">
            {/* Realtime Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>Realtime Control Active</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={resetNewOrdersCount}
              className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {newOrdersCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#7E153A] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {newOrdersCount}
                </span>
              )}
            </button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-xl bg-[#7E153A] text-white font-bold flex items-center justify-center shadow-sm">
                HZ
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-gray-900 leading-none">
                  Huzaifa Babar
                </p>
                <p className="text-[10px] text-[#7E153A] font-semibold mt-0.5">
                  Super Administrator
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex">
            <div className="w-64 bg-[#7E153A] text-white flex flex-col justify-between h-full p-6 shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                  <h2 className="font-extrabold text-base">TailorLink Admin</h2>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <nav className="space-y-2">
                  {ADMIN_NAV.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold hover:bg-white/10"
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Page Body Container */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
