'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Ruler,
  Palette,
  MapPin,
  CreditCard,
  Heart,
  Star,
  HelpCircle,
  Settings,
  Gift,
  Bell,
  ShoppingCart,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetch('/api/users/profile')
        .then((res) => res.json())
        .then((data) => setProfile(data.data || data))
        .catch(() => {});
    }
  }, [user]);

  const userName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : user?.user_metadata?.first_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
      : user?.email?.split('@')[0] || 'Customer';

  const userInitial = userName.charAt(0).toUpperCase();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: ShoppingBag, label: 'My Orders', href: '/orders' },
    { icon: Ruler, label: 'Measurements', href: '/measurements' },
    { icon: Palette, label: 'My Designs', href: '/designs' },
    { icon: MapPin, label: 'Address Book', href: '/address' },
    { icon: CreditCard, label: 'Payments', href: '/payments' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: Star, label: 'Reviews', href: '/reviews' },
  ];

  const secondaryNavItems = [
    { icon: HelpCircle, label: 'Help & Support', href: '/help' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between flex-shrink-0 fixed h-full z-40 overflow-y-auto">
        <div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="text-[#7E153A]">
                <svg
                  width="24"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20" />
                  <path d="M8 6h8" />
                  <path d="M12 22l-4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-none">
                  TailorLink<span className="text-[#7E153A]">.pk</span>
                </h1>
                <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">
                  You Link it, We Stitch it
                </p>
              </div>
            </div>

            <Link href="/new-order">
              <button className="w-full bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#7E153A]/20 hover:shadow-lg hover:shadow-[#7E153A]/30 mb-6 active:scale-[0.98]">
                <span className="text-lg leading-none font-bold">+</span> New
                Order
              </button>
            </Link>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-[#7E153A] to-[#911642] text-white shadow-md shadow-[#7E153A]/25'
                        : 'text-gray-600 hover:text-[#7E153A] hover:bg-red-50/70 font-medium'
                    }`}
                  >
                    <item.icon
                      size={18}
                      className={`transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-500 group-hover:text-[#7E153A]'
                      }`}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            <nav className="space-y-1.5 mb-6 border-t border-gray-100 pt-6">
              {secondaryNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#7E153A] to-[#911642] text-white shadow-md shadow-[#7E153A]/25'
                        : 'text-gray-600 hover:text-[#7E153A] hover:bg-red-50/70 font-medium'
                    }`}
                  >
                    <item.icon
                      size={18}
                      className={`transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-500 group-hover:text-[#7E153A]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-red-600 hover:bg-red-50/80 rounded-xl transition-all text-sm font-medium text-left cursor-pointer mt-1"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>

            <div className="bg-red-50 rounded-2xl p-4 relative overflow-hidden border border-red-100/50">
              <div className="relative z-10">
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  Refer & Earn
                </h4>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  Invite your friends and earn exciting rewards.
                </p>
                <Link href="/referral">
                  <button className="bg-[#7E153A] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#630f2d] transition-colors shadow-sm">
                    Invite Now
                  </button>
                </Link>
              </div>
              <Gift
                size={48}
                className="absolute -bottom-2 -right-2 text-[#7E153A] opacity-20 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex-1" id="header-stepper"></div>

          <div className="flex items-center gap-6">
            <Link
              href="/orders"
              className="relative text-gray-500 hover:text-gray-900"
            >
              <ShoppingCart size={20} />
            </Link>
            <button className="relative text-gray-500 hover:text-gray-900">
              <Bell size={20} />
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-[#7E153A] text-white font-bold flex items-center justify-center overflow-hidden relative shadow-sm">
                {profile?.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt={userName}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-none mb-1">
                  {userName}
                </p>
                <p className="text-[10px] text-gray-500 font-medium capitalize">
                  {profile?.role || 'Customer'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
