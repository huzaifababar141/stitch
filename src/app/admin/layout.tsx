'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ShieldCheck,
  Truck,
  TrendingUp,
  Settings,
  Bell,
  LogOut,
  Scissors,
  Menu,
  X,
  Loader2,
  Ticket,
  Boxes,
  Building2,
  MapPin,
} from 'lucide-react';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AdminActorProvider } from '@/components/admin/AdminActorContext';
import type { AdminActorDTO } from '@/lib/admin/types';

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
}

const SUPER_ADMIN_NAV: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Building2, label: 'Tailoring Units', href: '/admin/units' },
  { icon: ShoppingBag, label: 'Orders Control', href: '/admin/orders' },
  { icon: Boxes, label: 'Stock / Inventory', href: '/admin/stock' },
  { icon: Scissors, label: 'Tailor Management', href: '/admin/tailors' },
  { icon: Users, label: 'Users & Roles', href: '/admin/users' },
  { icon: ShieldCheck, label: 'Quality Control', href: '/admin/qc' },
  { icon: Truck, label: 'Courier Delivery Sync', href: '/admin/delivery' },
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, supabase, loading: authLoading } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [actor, setActor] = useState<AdminActorDTO | null>(null);
  const [verifyingRole, setVerifyingRole] = useState(true);
  const [verifyError, setVerifyError] = useState<{
    kind: 'forbidden' | 'server';
    message: string;
  } | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const lastVerifiedUserIdRef = useRef<string | null>(null);

  const { newOrdersCount, resetNewOrdersCount } = useAdminRealtime();
  const isAdminLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Clear cached actor & React Query data whenever entering login page or switching accounts
    if (isAdminLoginPage) {
      if (actor !== null || lastVerifiedUserIdRef.current !== null) {
        setActor(null);
        setVerifyingRole(true);
        lastVerifiedUserIdRef.current = null;
        queryClient.clear();
      }
      setVerifyError(null);
      return;
    }

    let isMounted = true;

    async function verifyAdminAccess() {
      if (authLoading) return;

      if (!user) {
        setActor(null);
        setVerifyError(null);
        lastVerifiedUserIdRef.current = null;
        queryClient.clear();
        router.push(
          `/admin/login?redirect=${encodeURIComponent(pathname || '/admin/dashboard')}`
        );
        return;
      }

      // If the authenticated user changed (e.g. Super Admin -> Unit Admin),
      // immediately clear stale React Query data and re-verify role from server.
      if (lastVerifiedUserIdRef.current !== user.id) {
        setActor(null);
        setVerifyError(null);
        setVerifyingRole(true);
        queryClient.clear();
      } else if (actor) {
        // Already verified for this exact user in this session
        setVerifyingRole(false);
        return;
      }

      try {
        let res = await fetch('/api/admin/me', {
          cache: 'no-store',
          credentials: 'same-origin',
        });

        // One brief retry if SSR auth cookies were still settling right after login
        if (res.status === 401) {
          await new Promise((r) => setTimeout(r, 400));
          res = await fetch('/api/admin/me', {
            cache: 'no-store',
            credentials: 'same-origin',
          });
        }

        const json = await res.json().catch(() => null);

        if (!isMounted) return;

        if (!res.ok || !json?.data) {
          setActor(null);
          lastVerifiedUserIdRef.current = null;

          if (res.status === 401) {
            router.push(
              `/admin/login?redirect=${encodeURIComponent(pathname || '/admin/dashboard')}`
            );
            return;
          }

          if (res.status === 403) {
            const msg =
              json?.error?.message ||
              'You do not have administrator permissions.';
            setVerifyError({ kind: 'forbidden', message: msg });
            toast({
              title: 'Access Denied',
              description: msg,
              variant: 'destructive',
            });
            return;
          }

          const serverMsg =
            json?.error?.message ||
            `Could not verify administrator session (HTTP ${res.status}). Please retry.`;
          setVerifyError({ kind: 'server', message: serverMsg });
          toast({
            title: 'Session Check Failed',
            description: serverMsg,
            variant: 'destructive',
          });
          return;
        }

        lastVerifiedUserIdRef.current = user.id;
        setVerifyError(null);
        setActor(json.data as AdminActorDTO);
      } catch (err) {
        console.error('Error verifying admin access:', err);
        if (isMounted) {
          setActor(null);
          lastVerifiedUserIdRef.current = null;
          setVerifyError({
            kind: 'server',
            message:
              'Network error while verifying administrator session. Please retry.',
          });
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
  }, [
    user,
    authLoading,
    pathname,
    isAdminLoginPage,
    router,
    toast,
    queryClient,
    actor,
    retryTick,
  ]);

  const navItems = useMemo<NavItem[]>(() => {
    if (!actor) return [];
    if (actor.isSuperAdmin) return SUPER_ADMIN_NAV;

    // Unit Admin (Workshop Manager) gets a focused, clean sidebar
    const items: NavItem[] = [
      {
        icon: LayoutDashboard,
        label: 'Unit Dashboard',
        href: '/admin/dashboard',
      },
      { icon: ShoppingBag, label: 'Assigned Orders', href: '/admin/orders' },
      { icon: Scissors, label: 'My Tailors (Darzis)', href: '/admin/tailors' },
    ];
    if (actor.unit?.hasStockAccess) {
      items.push({
        icon: Boxes,
        label: 'Unit Fabric Stock',
        href: '/admin/stock',
      });
    }
    return items;
  }, [actor]);

  const handleSignOut = async () => {
    try {
      setActor(null);
      setVerifyingRole(true);
      lastVerifiedUserIdRef.current = null;
      queryClient.clear();
      await supabase.auth.signOut();
      toast({
        title: 'Logged Out',
        description: 'You have been signed out of Admin Command.',
      });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  if (isAdminLoginPage) {
    return <>{children}</>;
  }

  const isStaleUser = Boolean(user && actor && actor.id !== user.id);

  if (authLoading || verifyingRole || isStaleUser) {
    return (
      <div className="min-h-screen bg-[#111315] flex flex-col items-center justify-center text-white font-sans">
        <Loader2 size={36} className="animate-spin text-[#7E153A] mb-3" />
        <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
          Verifying Administrator Clearance...
        </p>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="min-h-screen bg-[#111315] flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-md bg-[#181B1E] border border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#7E153A]/20 text-[#E11D48] flex items-center justify-center mx-auto">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-lg font-extrabold text-white">
            {verifyError?.kind === 'forbidden'
              ? 'Administrator Access Required'
              : verifyError
                ? 'Unable to Load Admin Portal'
                : 'Redirecting to Admin Login...'}
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            {verifyError?.message ||
              'Please sign in with an authorized Super Admin or Unit Admin account.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {verifyError?.kind === 'server' && (
              <button
                onClick={() => {
                  setVerifyError(null);
                  setVerifyingRole(true);
                  setRetryTick((t) => t + 1);
                }}
                className="px-4 py-2 rounded-xl bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold cursor-pointer"
              >
                Retry Verification
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold cursor-pointer"
            >
              Sign Out & Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roleBadgeLabel = actor.isSuperAdmin
    ? 'Super Admin'
    : actor.unit
      ? 'Unit Admin'
      : 'Operations Admin';

  const renderSidebarContent = (onNavigate?: () => void) => (
    <>
      <div className="overflow-y-auto flex-1">
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
                {roleBadgeLabel}
              </span>
            </div>
          </div>
          {onNavigate && (
            <button
              onClick={onNavigate}
              className="lg:hidden text-white/70 hover:text-white p-1"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Active Unit Banner for Unit Admins */}
        {!actor.isSuperAdmin && actor.unit && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-white/10 border border-white/15">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-pink-200">
              <Building2 size={12} />
              Active Unit
            </div>
            <p className="text-xs font-extrabold text-white mt-0.5 truncate">
              {actor.unit.name}
            </p>
            <p className="text-[10px] text-white/75 flex items-center gap-1 mt-0.5 truncate">
              <MapPin size={10} />
              {actor.unit.location}, {actor.unit.city}
            </p>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
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
                {item.href === '/admin/orders' && newOrdersCount > 0 && (
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
      <div className="p-4 border-t border-white/10 bg-[#630F2D]/50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {actor.fullName.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-none truncate">
                {actor.fullName}
              </p>
              <p className="text-[10px] text-white/70 mt-0.5 truncate max-w-[130px]">
                {actor.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-white/70 hover:text-white transition-colors cursor-pointer p-1.5 rounded-md hover:bg-white/10"
            title="Sign Out of Admin Command"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <AdminActorProvider actor={actor}>
      <div className="min-h-screen bg-[#F8F9FA] flex font-sans">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex w-64 bg-[#7E153A] text-white flex-col justify-between fixed h-full z-30 shadow-xl">
          {renderSidebarContent()}
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative w-64 max-w-[80vw] bg-[#7E153A] text-white flex flex-col justify-between h-full shadow-2xl z-10">
              {renderSidebarContent(() => setMobileMenuOpen(false))}
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Top Navbar */}
          <header className="h-16 bg-white border-b border-gray-200/80 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h2 className="text-sm font-extrabold text-gray-800 truncate">
                {actor.isSuperAdmin
                  ? 'TailorLink HQ — Super Admin Command'
                  : actor.unit
                    ? `${actor.unit.name} — Workshop Portal`
                    : 'TailorLink Operations Platform'}
              </h2>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {!actor.isSuperAdmin && actor.unit && (
                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    actor.unit.hasStockAccess
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  <Boxes size={12} />
                  {actor.unit.hasStockAccess
                    ? 'Stock Access: Enabled'
                    : 'Stitching Only'}
                </span>
              )}

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
                  {actor.isSuperAdmin ? 'Super Admin' : 'Unit Active'}
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
    </AdminActorProvider>
  );
}
