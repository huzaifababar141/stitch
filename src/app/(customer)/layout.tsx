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
  Menu,
  X,
  Plus,
  User,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetch('/api/users/profile')
        .then((res) => res.json())
        .then((data) => setProfile(data.data || data))
        .catch(() => {});
    }
  }, [user]);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  const bottomNavItems = [
    { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
    { icon: ShoppingBag, label: 'Orders', href: '/orders' },
    { icon: Plus, label: 'New Order', href: '/new-order', isFab: true },
    { icon: Ruler, label: 'Sizes', href: '/measurements' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2">
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
          </Link>
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <Link href="/new-order">
          <button className="w-full bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#7E153A]/20 hover:shadow-lg hover:shadow-[#7E153A]/30 mb-6 active:scale-[0.98] cursor-pointer">
            <span className="text-lg leading-none font-bold">+</span> New Order
          </button>
        </Link>

        <nav className="space-y-1">
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
        <nav className="space-y-1 mb-6 border-t border-gray-100 pt-4">
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
              Invite your friends and earn tailoring credits.
            </p>
            <Link href="/referral">
              <button className="bg-[#7E153A] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#630f2d] transition-colors shadow-sm cursor-pointer">
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
  );

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans w-full max-w-full overflow-x-hidden">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col justify-between flex-shrink-0 fixed h-full z-40 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Slide-over Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen min-w-0 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <header className="h-14 sm:h-16 md:h-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-w-0 w-full max-w-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 focus:outline-none shrink-0 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-gray-900 text-sm tracking-tight truncate">
                TailorLink<span className="text-[#7E153A]">.pk</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            <Link
              href="/wishlist"
              className="hidden sm:flex relative text-gray-500 hover:text-[#7E153A] transition-colors p-1.5 rounded-lg hover:bg-gray-50"
              title="Saved Suit Wishlist"
            >
              <Heart size={18} />
            </Link>
            <Link
              href="/orders"
              className="relative text-gray-500 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-gray-50"
              title="My Orders"
            >
              <ShoppingCart size={18} />
            </Link>
            <button
              className="relative text-gray-500 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="flex items-center gap-2 pl-1.5 sm:pl-3 border-l border-gray-200">
              <Link href="/settings" className="flex items-center gap-2 group">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#7E153A] text-white font-bold flex items-center justify-center overflow-hidden relative shadow-xs group-hover:ring-2 group-hover:ring-[#7E153A]/30 transition-all shrink-0">
                  {profile?.profileImageUrl ? (
                    <img
                      src={profile.profileImageUrl}
                      alt={userName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-xs">{userInitial}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-900 leading-none mb-0.5 group-hover:text-[#7E153A] transition-colors">
                    {userName}
                  </p>
                  <p className="text-[9px] text-gray-500 font-medium capitalize">
                    {profile?.role || 'Customer'}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 min-w-0 w-full max-w-full">
          {children}
        </main>

        {/* Mobile Sticky Bottom Navigation Bar (<768px) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-3 z-40 flex items-center justify-around shadow-lg">
          {bottomNavItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            if (item.isFab) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="-mt-5 bg-gradient-to-r from-[#7E153A] to-[#911642] text-white p-3 rounded-full shadow-lg shadow-[#7E153A]/40 flex flex-col items-center justify-center active:scale-95 transition-transform"
                >
                  <Plus size={22} className="stroke-[3]" />
                </Link>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-[#7E153A] font-bold'
                    : 'text-gray-500 hover:text-gray-900 font-medium'
                }`}
              >
                <item.icon
                  size={20}
                  className={isActive ? 'text-[#7E153A]' : 'text-gray-500'}
                />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
