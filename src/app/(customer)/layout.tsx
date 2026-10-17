'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Ruler,
  // Palette,
  MapPin,
  CreditCard,
  Star,
  HelpCircle,
  Settings,
  Gift,
  Bell,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  User,
  Boxes,
  Globe,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { LogoNeedle } from '@/components/illustrations/LogoNeedle';
import { SidebarPromoCard } from '@/components/illustrations/SidebarPromoCard';

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
    { icon: Boxes, label: 'Our Stock', href: '/stock' },
    { icon: ShoppingBag, label: 'My Orders', href: '/orders' },
    { icon: Ruler, label: 'Measurements', href: '/measurements' },
    { icon: MapPin, label: 'Address Book', href: '/address' },
    { icon: CreditCard, label: 'Payments', href: '/payments' },
    { icon: Star, label: 'Reviews', href: '/reviews' },
  ];

  const secondaryNavItems = [
    { icon: Globe, label: 'Main Website', href: '/' },
    { icon: HelpCircle, label: 'Help & Support', href: '/help' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const bottomNavItems = [
    { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
    { icon: Boxes, label: 'Stock', href: '/stock' },
    { icon: Plus, label: 'New Order', href: '/new-order', isFab: true },
    { icon: ShoppingBag, label: 'Orders', href: '/orders' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full min-h-full justify-between p-4 sm:p-5">
      <div>
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="text-[#7A1038] shrink-0">
              <LogoNeedle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold tracking-tight text-[#1A1A2E] leading-none">
                TailorLink<span className="text-[#7A1038]">.pk</span>
              </h1>
              <p className="text-[7.5px] text-[#A0A0AD] font-semibold uppercase tracking-[0.2em] mt-1">
                Your Style · Our Stitch
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
          <button className="w-full bg-[#7A1038] hover:bg-[#650D2F] text-white rounded-[10px] py-2.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm mb-6 active:scale-[0.98] cursor-pointer">
            <Plus size={16} className="stroke-[2.5]" /> New Order
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-xs sm:text-sm transition-all duration-150 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1038]/40 ${
                  isActive
                    ? 'bg-[#F9E4E6] text-[#7A1038] font-bold'
                    : 'text-gray-600 hover:text-[#7A1038] hover:bg-[#FDF2F4] font-medium'
                }`}
              >
                <item.icon
                  size={17}
                  className={`shrink-0 ${
                    isActive ? 'text-[#7A1038]' : 'text-gray-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto pt-4 space-y-4">
        <nav className="space-y-1 border-t border-gray-100 pt-3">
          {secondaryNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-[10px] text-xs sm:text-sm transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1038]/40 ${
                  isActive
                    ? 'bg-[#F9E4E6] text-[#7A1038] font-bold'
                    : 'text-gray-600 hover:text-[#7A1038] hover:bg-[#FDF2F4] font-medium'
                }`}
              >
                <item.icon
                  size={17}
                  className={`shrink-0 ${
                    isActive ? 'text-[#7A1038]' : 'text-gray-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-[#7A1038] hover:bg-red-50/80 rounded-[10px] transition-all text-xs sm:text-sm font-medium text-left cursor-pointer outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1038]/40"
          >
            <LogOut size={17} className="shrink-0" />
            Logout
          </button>
        </nav>

        {/* Bottom Sidebar Promo Card pinned to bottom */}
        <SidebarPromoCard />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FBF7F4] font-sans w-full max-w-full overflow-x-hidden">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-[250px] bg-white border-r border-[#F1E6E1] flex-col justify-between flex-shrink-0 fixed h-full z-40 overflow-y-auto">
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
      <div className="flex-1 ml-0 md:ml-[250px] flex flex-col min-h-screen min-w-0 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#F1E6E1] flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 min-w-0 w-full max-w-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-black/5 focus:outline-none shrink-0 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-1.5 min-w-0 md:hidden">
              <span className="font-bold text-gray-900 text-sm tracking-tight truncate">
                TailorLink<span className="text-[#7E153A]">.pk</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              className="relative text-gray-600 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-black/5 cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
            </button>

            <Link
              href="/orders"
              className="relative text-gray-600 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-black/5"
              title="Shopping Cart / Orders"
            >
              <ShoppingCart size={18} />
            </Link>

            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-200/80">
              <Link href="/settings" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-[#7E153A] text-white font-bold flex items-center justify-center overflow-hidden relative shadow-xs shrink-0 text-xs">
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
                <div className="hidden sm:flex items-center gap-1.5 text-left">
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-none mb-0.5 group-hover:text-[#7E153A] transition-colors">
                      {userName}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium capitalize">
                      {profile?.role || 'Customer'}
                    </p>
                  </div>
                  <ChevronDown
                    size={14}
                    className="text-gray-400 group-hover:text-gray-600 transition-colors ml-0.5"
                  />
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
