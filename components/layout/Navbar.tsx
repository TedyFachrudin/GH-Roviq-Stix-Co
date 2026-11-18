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

    {/* Customer / Member Floating Liquid Glass Navigation Dock (Tampil di Mobile & Browser Desktop) */}
    {!pathname.startsWith('/admin') && (
      <nav
        aria-label="Liquid Glass Navigation Dock"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 
          w-fit max-w-[calc(100%-1.5rem)]
          rounded-full 
          bg-[#FAF5EE]/90 
          backdrop-blur-2xl backdrop-saturate-200 
          border border-white/80 
          shadow-[0_16px_40px_-8px_rgba(58,48,42,0.18),0_0_0_1px_rgba(255,255,255,0.7)_inset] 
          p-1.5 sm:p-2 flex items-center justify-center gap-1 sm:gap-2 
          transition-all duration-300"
      >
        <Link
          href="/"
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 whitespace-nowrap ${
            pathname === '/'
              ? 'bg-[#C2652A] text-white shadow-md shadow-[#C2652A]/25'
              : 'text-[#605850] hover:text-[#3A302A] hover:bg-white/50'
          }`}
        >
          <Home size={17} className={pathname === '/' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
          <span>Beranda</span>
        </Link>

        <Link
          href="/menu"
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 whitespace-nowrap ${
            pathname === '/menu'
              ? 'bg-[#C2652A] text-white shadow-md shadow-[#C2652A]/25'
              : 'text-[#605850] hover:text-[#3A302A] hover:bg-white/50'
          }`}
        >
          <Coffee size={17} className={pathname === '/menu' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
          <span>Menu</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold tracking-wide text-[#605850] hover:text-[#3A302A] hover:bg-white/50 transition-all duration-200 active:scale-95 relative whitespace-nowrap"
          aria-label="Keranjang Belanja"
        >
          <div className="relative">
            <ShoppingBag size={17} className="stroke-[1.8]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#C2652A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-xs">
                {totalItems}
              </span>
            )}
          </div>
          <span>Pesanan</span>
        </button>

        <Link
          href={isAdmin ? '/admin' : '/profil'}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 whitespace-nowrap ${
            pathname === '/profil' || pathname.startsWith('/sign-in')
              ? 'bg-[#C2652A] text-white shadow-md shadow-[#C2652A]/25'
              : 'text-[#605850] hover:text-[#3A302A] hover:bg-white/50'
          }`}
        >
          <User
            size={17}
            className={
              pathname === '/profil' || pathname.startsWith('/sign-in')
                ? 'stroke-[2.5]'
                : 'stroke-[1.8]'
            }
          />
          <span>{isAdmin ? 'Admin' : 'Member'}</span>
        </Link>
      </nav>
    )}
    </>
  );
};
