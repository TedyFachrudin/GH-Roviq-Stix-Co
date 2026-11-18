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

  return (
    <>
      <header className="sticky top-2 sm:top-4 z-40 max-w-7xl mx-auto px-3 sm:px-6 transition-all">
        <div className="rounded-2xl sm:rounded-full bg-[#FAF5EE]/85 backdrop-blur-xl backdrop-saturate-180 border border-white/70 shadow-[0_10px_35px_-5px_rgba(58,48,42,0.10),0_0_0_1px_rgba(255,255,255,0.6)_inset] px-4 sm:px-8 py-3 flex items-center justify-between">
          
          {/* Logo brand matching SVGs */}
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo size={38} className="w-[38px] h-[38px]" priority />
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#3A302A]">
                GH ROVIQ
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest text-[#9A9088] uppercase font-sans">
                Coffee & Kitchen
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/40 border border-white/50 backdrop-blur-md shadow-2xs">
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
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* User Button / Sign In */}
            <div className="hidden sm:flex items-center">
              <AppSignedOut>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-[#3A302A] hover:text-[#C2652A] px-3.5 py-1.5 rounded-full bg-white/50 hover:bg-white border border-white/70 shadow-2xs transition-all"
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
              <>
                {/* When User is Logged In: Show shopping cart button */}
                <AppSignedIn>
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="relative p-2.5 rounded-full bg-white/50 hover:bg-white text-[#3A302A] hover:text-[#C2652A] border border-white/70 shadow-2xs transition-all"
                    aria-label="Buka Keranjang"
                  >
                    <ShoppingBag size={18} />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#C2652A] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-in fade-in zoom-in duration-150">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </AppSignedIn>

                {/* When User is NOT Logged In: Only show button if user actively added items */}
                <AppSignedOut>
                  {totalItems > 0 && (
                    <button
                      onClick={() => setIsDrawerOpen(true)}
                      className="relative p-2.5 rounded-full bg-white/50 hover:bg-white text-[#3A302A] hover:text-[#C2652A] border border-white/70 shadow-2xs transition-all"
                      aria-label="Buka Keranjang"
                    >
                      <ShoppingBag size={18} />
                      <span className="absolute -top-1 -right-1 bg-[#C2652A] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-in fade-in zoom-in duration-150">
                        {totalItems}
                      </span>
                    </button>
                  )}
                </AppSignedOut>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#3A302A] hover:bg-white/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF5EE] border-b border-[#E8E2D9] px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === '/admin' && pathname.startsWith('/admin'));
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-base font-medium rounded-md px-3 transition-colors ${
                  isActive
                    ? 'text-[#C2652A] bg-[#F7ECE4]'
                    : 'text-[#3A302A] hover:bg-[#F6F0E8]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          <div className="pt-3 border-t border-[#E8E2D9] flex items-center justify-between px-3">
            <AppSignedOut>
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-[#C2652A] text-white rounded-md text-sm font-medium tracking-wide"
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
    </header>

    {/* Customer / Member Floating Liquid Glass Navigation Dock (Tampil di Mobile & Browser Desktop) */}
    {!pathname.startsWith('/admin') && (
      <nav
        aria-label="Liquid Glass Navigation Dock"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 
          w-[calc(100%-1.5rem)] max-w-sm sm:max-w-md md:max-w-fit
          rounded-full 
          bg-[#FAF5EE]/85 
          backdrop-blur-2xl backdrop-saturate-200 
          border border-white/80 
          shadow-[0_16px_40px_-8px_rgba(58,48,42,0.18),0_0_0_1px_rgba(255,255,255,0.7)_inset] 
          p-1.5 sm:p-2 flex items-center justify-around md:justify-center md:gap-2 
          transition-all duration-300"
      >
        <Link
          href="/"
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
            pathname === '/'
              ? 'bg-[#C2652A] text-white shadow-md shadow-[#C2652A]/25'
              : 'text-[#605850] hover:text-[#3A302A] hover:bg-white/50'
          }`}
        >
          <Home size={18} className={pathname === '/' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
          <span className={pathname === '/' ? 'inline' : 'hidden sm:inline'}>Beranda</span>
        </Link>

        <Link
          href="/menu"
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
            pathname === '/menu'
              ? 'bg-[#C2652A] text-white shadow-md shadow-[#C2652A]/25'
              : 'text-[#605850] hover:text-[#3A302A] hover:bg-white/50'
          }`}
        >
          <Coffee size={18} className={pathname === '/menu' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
          <span className={pathname === '/menu' ? 'inline' : 'hidden sm:inline'}>Menu</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold tracking-wide text-[#605850] hover:text-[#3A302A] hover:bg-white/50 transition-all duration-200 active:scale-95 relative"
          aria-label="Keranjang Belanja"
        >
          <div className="relative">
            <ShoppingBag size={18} className="stroke-[1.8]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#C2652A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-xs">
                {totalItems}
              </span>
            )}
          </div>
          <span className="hidden sm:inline">Pesanan</span>
          {totalItems > 0 && (
            <span className="text-[11px] font-bold text-[#C2652A] sm:hidden">({totalItems})</span>
          )}
        </button>

        <Link
          href={isAdmin ? '/admin' : '/profil'}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
            pathname === '/profil' || pathname.startsWith('/sign-in')
              ? 'bg-[#C2652A] text-white shadow-md shadow-[#C2652A]/25'
              : 'text-[#605850] hover:text-[#3A302A] hover:bg-white/50'
          }`}
        >
          <User
            size={18}
            className={
              pathname === '/profil' || pathname.startsWith('/sign-in')
                ? 'stroke-[2.5]'
                : 'stroke-[1.8]'
            }
          />
          <span
            className={
              pathname === '/profil' || pathname.startsWith('/sign-in')
                ? 'inline'
                : 'hidden sm:inline'
            }
          >
            {isAdmin ? 'Admin' : 'Member'}
          </span>
        </Link>
      </nav>
    )}
    </>
  );
};
