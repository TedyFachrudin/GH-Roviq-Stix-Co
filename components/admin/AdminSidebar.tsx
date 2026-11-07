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
    <aside className="w-full lg:w-72 bg-[#F6F0E8] border-b lg:border-b-0 lg:border-r border-[#E8E2D9] flex flex-col justify-between shrink-0 min-h-screen">
      {/* Top Brand & Nav Section */}
      <div className="p-6 space-y-8">
        
        {/* Logo and Brand matching SVGs */}
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

      {/* Bottom Profile & Logout Card matching SVG (x:24, y:726.5, w:240, h:56.5, fill: #F2ECE4) */}
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
  );
}

