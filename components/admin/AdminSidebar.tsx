'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Package,
  ClipboardList,
  TrendingUp,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Users,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/admin';
import { getStoredOrders } from '@/lib/store';

interface AdminSidebarProps {
  onOpenRevenueModal?: () => void;
}

export function AdminSidebar({ onOpenRevenueModal }: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, logout } = useAdminAuth();
  const [pendingOrdersCount, setPendingOrdersCount] = React.useState(0);

  React.useEffect(() => {
    const updateCount = () => {
      const orders = getStoredOrders();
      const waiting = orders.filter((o) => o.status === 'Menunggu').length;
      setPendingOrdersCount(waiting);
    };

    updateCount();
    window.addEventListener('gh_orders_updated', updateCount);
    window.addEventListener('storage', updateCount);

    return () => {
      window.removeEventListener('gh_orders_updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const navItems = [
    {
      label: 'Katalog & Stok',
      href: '/admin',
      active: pathname === '/admin' || pathname === '/admin/katalog',
      icon: Package,
    },
    {
      label: 'Pesanan Masuk',
      href: '/admin/pesanan',
      active: pathname === '/admin/pesanan',
      icon: ClipboardList,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined,
    },
    {
      label: 'Laporan Omset',
      href: '/admin/omset',
      active: pathname === '/admin/omset',
      icon: TrendingUp,
    },
    {
      label: 'Anggota Member',
      href: '/admin/member',
      active: pathname === '/admin/member',
      icon: Users,
    },
  ];

  return (
    <>
      {/* Mobile Top Header (< lg): Compact, no huge gap */}
      <header className="w-full lg:hidden bg-[#F6F0E8] border-b border-[#E8E2D9] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#D8D0C8] p-1 flex items-center justify-center shadow-xs">
            <Image
              src="/logo-gh-roviq.svg"
              alt="GH ROVIQ Logo"
              width={22}
              height={22}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-base font-bold tracking-tight text-[#3A302A]">
                GH ROVIQ
              </span>
              <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#C2652A] text-white font-semibold">
                Admin
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="px-2.5 py-1.5 rounded-lg bg-[#FAF5EE] text-[#605850] hover:text-[#3A302A] border border-[#E8E2D9] text-[11px] font-semibold flex items-center gap-1.5"
            title="Lihat Tampilan Toko"
          >
            <ExternalLink size={12} className="text-[#9A9088]" />
            <span>Toko</span>
          </Link>

          <button
            onClick={handleLogout}
            title="Keluar dari akun Admin"
            className="p-1.5 rounded-lg text-[#9A9088] hover:text-red-600 hover:bg-white border border-transparent hover:border-red-200 transition-all"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar (>= lg) */}
      <aside className="hidden lg:flex w-72 bg-[#F6F0E8] border-r border-[#E8E2D9] flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Top Brand & Nav Section */}
        <div className="p-6 space-y-8">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF5EE] border border-[#D8D0C8] p-1.5 flex items-center justify-center shadow-xs">
              <Image
                src="/logo-gh-roviq.svg"
                alt="GH ROVIQ Logo"
                width={26}
                height={26}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-tight text-[#3A302A]">
                  GH ROVIQ
                </span>
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C2652A] text-white font-semibold">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-[#9A9088] font-sans">
                Artisan Management Suite
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A9088] px-3 pb-1">
              Menu Utama
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    item.active
                      ? 'bg-[#C2652A] text-white shadow-sm'
                      : 'text-[#605850] hover:text-[#3A302A] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={item.active ? 'text-white' : 'text-[#C2652A]'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.active
                          ? 'bg-white text-[#C2652A]'
                          : 'bg-[#C2652A] text-white animate-pulse'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Link to Customer Storefront */}
          <div className="pt-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-[#605850] hover:text-[#3A302A] bg-[#FAF5EE] border border-[#E8E2D9] hover:border-[#D8D0C8] transition-all"
            >
              <span className="flex items-center gap-2">
                <ExternalLink size={13} className="text-[#9A9088]" />
                <span>Lihat Tampilan Toko</span>
              </span>
              <ChevronRight size={14} className="text-[#9A9088]" />
            </Link>
          </div>
        </div>

        {/* Bottom Profile & Logout Card */}
        <div className="p-4 border-t border-[#E8E2D9]">
          <div className="p-3 rounded-xl bg-[#F2ECE4] border border-[#E8E2D9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#3A302A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {adminUser?.username?.[0]?.toUpperCase() || 'R'}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs text-[#3A302A] truncate">
                    {adminUser?.username || 'Roviq'}
                  </span>
                  <ShieldCheck size={12} className="text-[#C2652A] shrink-0" />
                </div>
                <p className="text-[10px] text-[#9A9088] truncate">Developer / Admin</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar dari akun Admin"
              className="p-1.5 rounded-lg text-[#9A9088] hover:text-[#C2652A] hover:bg-[#FAF5EE] transition-all"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Floating Liquid Glass Nav Pro: Menu Utama Admin (Khusus Mobile) */}
      <nav
        aria-label="Liquid Glass Nav Pro Admin"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex lg:hidden items-center p-2 rounded-full transition-all duration-300"
        style={{
          width: '272px',
          height: '64px',
          backdropFilter: 'blur(16px) saturate(180%) brightness(1.05)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%) brightness(1.05)',
          backgroundColor: 'rgba(250, 245, 238, 0.78)',
          boxShadow:
            '0px 20px 48px -10px rgba(58, 48, 42, 0.22), 0px 6px 16px -2px rgba(58, 48, 42, 0.12), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.65)',
        }}
      >
        {/* Rim Light (Glass Edge Bezel Highlight from Framer Liquid Glass Nav Pro) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow:
              'inset 0px 2px 3px -1px rgba(255, 255, 255, 0.95), inset 0px -2px 3px -1px rgba(255, 255, 255, 0.8), inset 5px 0px 6px -3px rgba(255, 255, 255, 0.85), inset -5px 0px 6px -3px rgba(255, 255, 255, 0.85), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.35), inset 0px 0px 0px 4px rgba(255, 255, 255, 0.08), inset 0px 0px 14px 4px rgba(58, 48, 42, 0.08)',
          }}
        />

        {/* Sliding Liquid Pill Highlight with Corner Spark Halos */}
        {(() => {
          const activeIndex = navItems.findIndex((i) => i.active);
          return (
            <div
              className="absolute top-2 left-2 w-[58px] h-[48px] rounded-[24px] pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden"
              style={{
                transform:
                  activeIndex >= 0 ? `translateX(${activeIndex * 64}px)` : 'translateX(0px)',
                opacity: activeIndex >= 0 ? 1 : 0,
                background: 'linear-gradient(180deg, #D97736 0%, #C2652A 55%, #A9521E 100%)',
                boxShadow:
                  'inset 0px 1.5px 1.5px 0px rgba(255, 255, 255, 0.95), inset 0px -1px 1px 0px rgba(255, 255, 255, 0.4), inset 3px 0px 4px -2px rgba(255, 255, 255, 0.65), inset -3px 0px 4px -2px rgba(255, 255, 255, 0.65), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.25), 0px 8px 20px -3px rgba(194, 101, 42, 0.5)',
              }}
            >
              {/* Spark BL Halo */}
              <div
                className="absolute left-[6px] bottom-0 w-[18px] h-[18px] rounded-full pointer-events-none"
                style={{
                  backgroundColor: '#ffffff',
                  filter: 'blur(7px)',
                  WebkitFilter: 'blur(7px)',
                  opacity: 0.65,
                }}
              />
              {/* Spark BL Core */}
              <div
                className="absolute left-[11px] bottom-[2px] w-[6px] h-[6px] rounded-full pointer-events-none"
                style={{
                  backgroundColor: '#ffffff',
                  filter: 'blur(1.5px)',
                  WebkitFilter: 'blur(1.5px)',
                  opacity: 0.95,
                }}
              />
              {/* Spark TR Halo */}
              <div
                className="absolute right-[8px] top-0 w-[14px] h-[14px] rounded-full pointer-events-none"
                style={{
                  backgroundColor: '#ffffff',
                  filter: 'blur(5px)',
                  WebkitFilter: 'blur(5px)',
                  opacity: 0.55,
                }}
              />
              {/* Spark TR Core */}
              <div
                className="absolute right-[11px] top-[2px] w-[5px] h-[5px] rounded-full pointer-events-none"
                style={{
                  backgroundColor: '#ffffff',
                  filter: 'blur(1.5px)',
                  WebkitFilter: 'blur(1.5px)',
                  opacity: 0.9,
                }}
              />
            </div>
          );
        })()}

        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={`relative z-10 w-[58px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90 ${
                idx > 0 ? 'ml-[6px]' : ''
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-all duration-200 ${
                    item.active
                      ? 'text-white stroke-[2.4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] scale-105'
                      : 'text-[#605850] hover:text-[#3A302A] stroke-[1.8]'
                  }`}
                />
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse ${
                      item.active ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

