'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Loader2,
  ShieldAlert,
  Ticket,
} from 'lucide-react';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: ShoppingBag, label: 'Orders Control', href: '/admin/orders' },
  { icon: Scissors, label: 'Tailor Management', href: '/admin/tailors' },
  { icon: Users, label: 'Users & Roles', href: '/admin/users' },
  { icon: ShieldCheck, label: 'Quality Control', href: '/admin/qc' },
  { icon: Truck, label: 'TCS Delivery Sync', href: '/admin/delivery' },
  { icon: TrendingUp, label: 'Revenue Analytics', href: '/admin/analytics' },
  { icon: Ticket, label: 'Coupons', href: '/admin/coupons' },
  { icon: Settings, label: 'System Settings', href: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, supabase, loading: authLoading } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<{
    role: string;
    fullName: string;
    email: string;
  } | null>(null);
  const [verifyingRole, setVerifyingRole] = useState(true);

  // Live Supabase Realtime alerts for Admin
  const { newOrdersCount, resetNewOrdersCount } = useAdminRealtime();

  // If on admin login page, render children directly without admin shell
  const isAdminLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isAdminLoginPage) {
      return;
    }

    let isMounted = true;

    async function verifyAdminAccess() {
      if (authLoading) return;

      if (!user) {
        router.push(
          `/admin/login?redirect=${encodeURIComponent(pathname || '/admin/dashboard')}`
        );
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('users')
          .select('role, first_name, last_name, email')
          .eq('id', user.id)
          .single();

        if (!isMounted) return;

        const role =
          profile?.role ||
          (user.app_metadata as { role?: string } | undefined)?.role;

        if (role !== 'admin' && role !== 'super_admin') {
          toast({
            title: 'Access Denied',
            description: 'You do not have administrator permissions.',
            variant: 'destructive',
          });
          router.push('/admin/login?error=forbidden');
          return;
        }

        const firstName =
          profile?.first_name || user.user_metadata?.first_name || '';
        const lastName =
          profile?.last_name || user.user_metadata?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Administrator';

        setAdminProfile({
          role: role === 'super_admin' ? 'Super Admin' : 'Operations Admin',
          fullName,
          email: profile?.email || user.email || 'admin@stitch.pk',
        });
      } catch (err) {
        console.error('Error verifying admin access:', err);
        if (isMounted) {
          router.push('/admin/login?error=forbidden');
        }
      } finally {
        if (isMounted) {
          setVerifyingRole(false);
        }
      }
    }

    verifyAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, pathname, isAdminLoginPage, router, supabase, toast]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logged Out',
        description: 'You have been signed out of Admin Command.',
      });
      router.push('/admin/login');
    } catch (err) {
      router.push('/admin/login');
    }
  };

  // If admin login page, bypass layout wrapper
  if (isAdminLoginPage) {
    return <>{children}</>;
  }

  // Loading state while verifying role
  if (authLoading || verifyingRole) {
    return (
      <div className="min-h-screen bg-[#111315] flex flex-col items-center justify-center text-white font-sans">
        <Loader2 size={36} className="animate-spin text-[#7E153A] mb-3" />
        <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
          Verifying Administrator Clearance...
        </p>
      </div>
    );
  }

  // Not authorized fallback
  if (!adminProfile) {
    return null;
  }

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
                  {adminProfile.role}
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

        {/* Footer Admin Status & Sign Out */}
        <div className="p-4 border-t border-white/10 bg-[#630F2D]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {adminProfile.fullName.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-none truncate">
                  {adminProfile.fullName}
                </p>
                <p className="text-[10px] text-white/70 mt-0.5 truncate max-w-[120px]">
                  {adminProfile.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-white/70 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/10"
              title="Sign Out of Admin Command"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200/80 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-sm font-extrabold text-gray-800 hidden sm:block">
              TailorLink Operations Platform
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetNewOrdersCount}
              className="relative p-2 text-gray-500 hover:text-[#7E153A] hover:bg-red-50 rounded-xl transition-all"
              title="Live Realtime Alerts"
            >
              <Bell size={18} />
              {newOrdersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7E153A] rounded-full ring-2 ring-white" />
              )}
            </button>

            <div className="h-6 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-700 hidden sm:inline">
                Live System Active
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
