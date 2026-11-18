'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Menu as MenuIcon, X, User, Home, Coffee } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAppUser, AppSignedIn, AppSignedOut, AppUserButton } from '@/lib/auth';
import { isAdminUser } from '@/lib/admin';
import { BrandLogo } from '@/components/ui/BrandLogo';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, setIsDrawerOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAppUser();
  const isAdmin = isAdminUser(user);

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Menu', href: '/menu' },
    {
      name: isAdmin ? 'Dashboard Admin' : 'Profil & Loyalty',
      href: isAdmin ? '/admin' : '/profil',
    },
  ];

  // Hitung indeks desktop active (0: Beranda, 1: Menu, 2: Profil/Admin)
  const desktopActiveIndex = React.useMemo(() => {
    if (pathname === '/') return 0;
    if (pathname === '/menu') return 1;
    if (pathname === '/admin' || pathname === '/profil' || pathname.startsWith('/admin') || pathname.startsWith('/sign-in')) return 2;
    return 0;
  }, [pathname]);

  // Hitung indeks tab mobile (0: Beranda, 1: Menu, 2: Pesanan, 3: Member/Admin)
  const getMobileIndexFromPath = () => {
    if (pathname === '/') return 0;
    if (pathname === '/menu') return 1;
    if (pathname === '/profil' || pathname.startsWith('/sign-in') || pathname.startsWith('/admin')) return 3;
    return 0;
  };

  const [activeMobileTab, setActiveMobileTab] = useState<number>(getMobileIndexFromPath);
  const [isDragging, setIsDragging] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveMobileTab(getMobileIndexFromPath());
  }, [pathname]);

  // Animasi drag / geser interaktif liquid di mobile
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!mobileNavRef.current) return;
    const rect = mobileNavRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const tabWidth = rect.width / 4;
    const nextIdx = Math.max(0, Math.min(3, Math.floor(touchX / tabWidth)));
    setActiveMobileTab(nextIdx);
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Navigasi ke rute sesuai tab setelah drag dilepas
    if (activeMobileTab === 0 && pathname !== '/') router.push('/');
    else if (activeMobileTab === 1 && pathname !== '/menu') router.push('/menu');
    else if (activeMobileTab === 2) setIsDrawerOpen(true);
    else if (activeMobileTab === 3) {
      const dest = isAdmin ? '/admin' : '/profil';
      if (pathname !== dest) router.push(dest);
    }
  };

  return (
    <>
      {/* Desktop & Mobile Top Header: Bening Crystal Glassmorphism */}
      <header className="sticky top-0 sm:top-3 z-40 sm:max-w-7xl sm:mx-auto sm:px-6 lg:px-8 transition-all duration-300">
        <div className="relative sm:rounded-full bg-white/20 backdrop-blur-2xl border-b sm:border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              
              {/* Logo brand */}
              <Link href="/" className="flex items-center gap-3 group">
                <BrandLogo size={42} className="w-[42px] h-[42px]" priority />
                <div className="flex flex-col">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#3A302A]">
                    GH ROVIQ
                  </span>
                  <span className="text-[10px] tracking-widest text-[#9A9088] font-sans uppercase font-semibold">
                    Coffee & Kitchen
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation: Bening Floating Glass Capsule dengan Liquid Indicator */}
              <nav className="hidden md:flex items-center p-1.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 shadow-inner relative">
                {/* Liquid sliding pill indicator desktop */}
                <div
                  className="absolute top-1.5 bottom-1.5 rounded-full bg-white/50 backdrop-blur-md border border-white/70 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
                  style={{
                    left: `calc(${(desktopActiveIndex * 100) / navLinks.length}% + 4px)`,
                    width: `calc(${100 / navLinks.length}% - 8px)`,
                  }}
                />

                {navLinks.map((link, idx) => {
                  const isActive = desktopActiveIndex === idx;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`relative z-10 text-xs font-semibold px-5 py-2 rounded-full transition-colors duration-200 ${
                        isActive ? 'text-[#3A302A]' : 'text-[#605850] hover:text-[#3A302A]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Action Tools: Auth & Cart */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* User Button / Sign In */}
                <div className="hidden sm:flex items-center">
                  <AppSignedOut>
                    <Link
                      href="/sign-in"
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#3A302A] hover:text-[#C2652A] px-4 py-2 rounded-full bg-white/30 hover:bg-white/50 border border-white/40 shadow-xs transition-all"
                    >
                      <User size={14} />
                      <span>Masuk</span>
                    </Link>
                  </AppSignedOut>
                  <AppSignedIn>
                    <div className="flex items-center gap-2">
                      <AppUserButton />
                    </div>
                  </AppSignedIn>
                </div>

                {/* Shopping Cart Button */}
                {pathname !== '/' && (
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="relative p-2.5 rounded-full bg-white/30 text-[#3A302A] hover:bg-white/50 border border-white/40 shadow-xs transition-all active:scale-95"
                    aria-label="Buka Keranjang"
                  >
                    <ShoppingBag size={20} />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#C2652A] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in fade-in zoom-in duration-150">
                        {totalItems}
                      </span>
                    )}
                  </button>
                )}

                {/* Mobile Hamburger Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2.5 rounded-2xl text-[#3A302A] hover:bg-white/40 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Drawer Menu (Bening Frosted Glass) */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white/30 backdrop-blur-2xl border-t border-white/30 px-4 pt-3 pb-6 space-y-2 sm:rounded-b-3xl">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href === '/admin' && pathname.startsWith('/admin'));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2.5 text-sm font-semibold rounded-2xl px-4 transition-all ${
                      isActive
                        ? 'bg-white/50 text-[#3A302A] shadow-xs'
                        : 'text-[#605850] hover:bg-white/30'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="pt-3 border-t border-white/30 flex items-center justify-between px-2">
                <AppSignedOut>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 bg-[#C2652A] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm"
                  >
                    Masuk / Daftar Akun
                  </Link>
                </AppSignedOut>
                <AppSignedIn>
                  <div className="flex items-center gap-3 py-1">
                    <AppUserButton />
                    <span className="text-sm font-medium text-[#3A302A]">Akun Saya</span>
                  </div>
                </AppSignedIn>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Customer / Member Mobile Bottom Navigation Bar: Bening Floating Liquid Dock */}
      {!pathname.startsWith('/admin') && (
        <nav
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto md:hidden select-none"
          aria-label="Navigasi Bawah"
        >
          {/* Container Kaca Bening */}
          <div
            ref={mobileNavRef}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_12px_40px_0_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.6)] px-2 py-2 flex items-center justify-around overflow-hidden"
          >
            {/* Animasi Liquid Pill Perpindahan / Drag Indicator */}
            <div
              className={`absolute top-1.5 bottom-1.5 rounded-2xl bg-white/50 backdrop-blur-md border border-white/70 shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isDragging ? 'scale-x-105 scale-y-95 opacity-90' : 'scale-100 opacity-100'
              }`}
              style={{
                left: `calc(${activeMobileTab * 25}% + 4px)`,
                width: 'calc(25% - 8px)',
              }}
            >
              {/* Pantulan air / liquid specular highlight */}
              <div className="absolute top-1 left-2 right-2 h-1 rounded-full bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
            </div>

            {/* Tab 1: Beranda */}
            <Link
              href="/"
              onClick={() => setActiveMobileTab(0)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 relative z-10 ${
                activeMobileTab === 0 ? 'text-[#3A302A] font-bold' : 'text-[#605850] hover:text-[#3A302A]'
              }`}
            >
              <Home size={19} className={activeMobileTab === 0 ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">Beranda</span>
            </Link>

            {/* Tab 2: Menu */}
            <Link
              href="/menu"
              onClick={() => setActiveMobileTab(1)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 relative z-10 ${
                activeMobileTab === 1 ? 'text-[#3A302A] font-bold' : 'text-[#605850] hover:text-[#3A302A]'
              }`}
            >
              <Coffee size={19} className={activeMobileTab === 1 ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">Menu</span>
            </Link>

            {/* Tab 3: Pesanan / Keranjang */}
            <button
              type="button"
              onClick={() => {
                setActiveMobileTab(2);
                setIsDrawerOpen(true);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 relative z-10 ${
                activeMobileTab === 2 ? 'text-[#3A302A] font-bold' : 'text-[#605850] hover:text-[#3A302A]'
              }`}
              aria-label="Keranjang Belanja"
            >
              <div className="relative">
                <ShoppingBag size={19} className={activeMobileTab === 2 ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#C2652A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-in fade-in zoom-in duration-150">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-tight">Pesanan</span>
            </button>

            {/* Tab 4: Member / Admin */}
            <Link
              href={isAdmin ? '/admin' : '/profil'}
              onClick={() => setActiveMobileTab(3)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 relative z-10 ${
                activeMobileTab === 3 ? 'text-[#3A302A] font-bold' : 'text-[#605850] hover:text-[#3A302A]'
              }`}
            >
              <User size={19} className={activeMobileTab === 3 ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
};
