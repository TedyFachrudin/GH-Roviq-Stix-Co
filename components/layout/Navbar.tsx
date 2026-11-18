'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu as MenuIcon, X, User, Home, Coffee } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAppUser, AppSignedIn, AppSignedOut, AppUserButton } from '@/lib/auth';
import { isAdminUser } from '@/lib/admin';
import { BrandLogo } from '@/components/ui/BrandLogo';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { totalItems, setIsDrawerOpen, isDrawerOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAppUser();
  const isAdmin = isAdminUser(user);

  let activeIndex = -1;
  if (isDrawerOpen) {
    activeIndex = 2;
  } else if (pathname === '/') {
    activeIndex = 0;
  } else if (pathname === '/menu') {
    activeIndex = 1;
  } else if (pathname === '/profil' || pathname.startsWith('/sign-in')) {
    activeIndex = 3;
  }

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Menu', href: '/menu' },
    {
      name: isAdmin ? 'Dashboard Admin' : 'Profil & Loyalty',
      href: isAdmin ? '/admin' : '/profil',
    },
  ];

  return (
    <>
      {/* Floating Pill Top Header (Desktop & Mobile) */}
      <header className="sticky top-2 sm:top-4 z-40 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-5xl mx-auto transition-all">
        <div className="rounded-full bg-[#FAF5EE]/85 backdrop-blur-2xl backdrop-saturate-200 border border-white/80 shadow-[0_12px_36px_-6px_rgba(58,48,42,0.14),0_0_0_1px_rgba(255,255,255,0.7)_inset] px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between">
          
          {/* Logo brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandLogo size={34} className="w-[34px] h-[34px]" priority />
            <div className="flex flex-col">
              <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#3A302A] leading-tight">
                GH ROVIQ
              </span>
              <span className="text-[9px] tracking-widest text-[#9A9088] uppercase font-sans">
                Coffee & Kitchen
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Pill Bar */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/40 border border-white/50 backdrop-blur-md shadow-2xs">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href === '/admin' && pathname.startsWith('/admin'));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs tracking-wide transition-all px-4 py-1.5 rounded-full ${
                    isActive
                      ? 'bg-[#C2652A] text-white font-semibold shadow-xs'
                      : 'text-[#605850] hover:text-[#3A302A] hover:bg-white/60 font-medium'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Tools: Auth & Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* User Button / Sign In */}
            <div className="flex items-center">
              <AppSignedOut>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-[#3A302A] hover:text-[#C2652A] px-3.5 py-1.5 rounded-full bg-white/60 hover:bg-white border border-white/80 shadow-2xs transition-all active:scale-95"
                >
                  <User size={13} />
                  <span>Masuk</span>
                </Link>
              </AppSignedOut>
              <AppSignedIn>
                <div className="flex items-center gap-2">
                  <AppUserButton />
                </div>
              </AppSignedIn>
            </div>

            {/* Shopping Cart Pill Button */}
            {pathname !== '/' && (
              <>
                <AppSignedIn>
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="relative p-2 rounded-full bg-white/60 hover:bg-white text-[#3A302A] hover:text-[#C2652A] border border-white/80 shadow-2xs transition-all active:scale-95 flex items-center justify-center"
                    aria-label="Buka Keranjang"
                  >
                    <ShoppingBag size={17} />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#C2652A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-in fade-in zoom-in duration-150">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </AppSignedIn>

                <AppSignedOut>
                  {totalItems > 0 && (
                    <button
                      onClick={() => setIsDrawerOpen(true)}
                      className="relative p-2 rounded-full bg-white/60 hover:bg-white text-[#3A302A] hover:text-[#C2652A] border border-white/80 shadow-2xs transition-all active:scale-95 flex items-center justify-center"
                      aria-label="Buka Keranjang"
                    >
                      <ShoppingBag size={17} />
                      <span className="absolute -top-1 -right-1 bg-[#C2652A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-in fade-in zoom-in duration-150">
                        {totalItems}
                      </span>
                    </button>
                  )}
                </AppSignedOut>
              </>
            )}
          </div>
        </div>
      </header>

    {/* Customer / Member Floating Liquid Glass Nav Pro (Khusus Tampilan Mobile) */}
    {!pathname.startsWith('/admin') && (
      <nav
        aria-label="Liquid Glass Nav Pro"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex md:hidden items-center p-2 rounded-full transition-all duration-300"
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
        <div
          className="absolute top-2 left-2 w-[58px] h-[48px] rounded-[24px] pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden"
          style={{
            transform: activeIndex >= 0 ? `translateX(${activeIndex * 64}px)` : 'translateX(0px)',
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

        {/* Tab 1: Beranda */}
        <Link
          href="/"
          title="Beranda"
          aria-label="Beranda"
          className="relative z-10 w-[58px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90"
        >
          <Home
            size={20}
            className={`transition-all duration-200 ${
              activeIndex === 0
                ? 'text-white stroke-[2.4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] scale-105'
                : 'text-[#605850] hover:text-[#3A302A] stroke-[1.8]'
            }`}
          />
        </Link>

        {/* Tab 2: Menu */}
        <Link
          href="/menu"
          title="Menu"
          aria-label="Menu"
          className="relative z-10 w-[58px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90 ml-[6px]"
        >
          <Coffee
            size={20}
            className={`transition-all duration-200 ${
              activeIndex === 1
                ? 'text-white stroke-[2.4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] scale-105'
                : 'text-[#605850] hover:text-[#3A302A] stroke-[1.8]'
            }`}
          />
        </Link>

        {/* Tab 3: Pesanan / Keranjang */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          title="Pesanan / Keranjang"
          aria-label="Keranjang Belanja"
          className="relative z-10 w-[58px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90 ml-[6px]"
        >
          <div className="relative">
            <ShoppingBag
              size={20}
              className={`transition-all duration-200 ${
                activeIndex === 2
                  ? 'text-white stroke-[2.4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] scale-105'
                  : 'text-[#605850] hover:text-[#3A302A] stroke-[1.8]'
              }`}
            />
            {totalItems > 0 && (
              <span
                className={`absolute -top-1.5 -right-2 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse ${
                  activeIndex === 2 ? 'bg-white text-[#C2652A]' : 'bg-[#C2652A] text-white'
                }`}
              >
                {totalItems}
              </span>
            )}
          </div>
        </button>

        {/* Tab 4: Member / Admin */}
        <Link
          href={isAdmin ? '/admin' : '/profil'}
          title={isAdmin ? 'Admin' : 'Member'}
          aria-label={isAdmin ? 'Admin' : 'Member'}
          className="relative z-10 w-[58px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90 ml-[6px]"
        >
          <User
            size={20}
            className={`transition-all duration-200 ${
              activeIndex === 3
                ? 'text-white stroke-[2.4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] scale-105'
                : 'text-[#605850] hover:text-[#3A302A] stroke-[1.8]'
            }`}
          />
        </Link>
      </nav>
    )}
    </>
  );
};
