'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu as MenuIcon, X, User, ArrowRight, Home, Coffee } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAppUser, AppSignedIn, AppSignedOut, AppUserButton } from '@/lib/auth';
import { isAdminUser } from '@/lib/admin';

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
      name: isAdmin ? 'Admin' : 'Loyalty',
      href: isAdmin ? '/admin' : '/profil',
    },
  ];

  return (
    <>
      {/* Top Header Bar (Ferea Cafe Editorial Style with Dashed Border) */}
      <header className="sticky top-0 z-40 w-full bg-[#F3EFEA]/95 backdrop-blur-md border-b border-dashed border-[#D8D0C8] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
          
          {/* Left Column: Navigation Links (Desktop) & Hamburger (Mobile) */}
          <div className="flex items-center gap-6 w-1/3 justify-start">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#7E4124] hover:text-[#010101] md:hidden transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
            </button>

            {/* Desktop Navigation Links */}
            <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href === '/admin' && pathname.startsWith('/admin'));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-display font-bold uppercase tracking-wider text-xs lg:text-[13px] transition-all select-none ${
                      isActive
                        ? 'text-[#010101] underline underline-offset-8 decoration-2 decoration-[#7E4124]'
                        : 'text-[#7E4124] hover:text-[#010101]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Column: Logo strictly centered with text "Gh Roviq Stix & Co" */}
          <div className="flex items-center justify-center w-1/3 text-center">
            <Link href="/" className="select-none group">
              <span className="font-display font-bold text-lg sm:text-2xl md:text-[26px] tracking-tight text-[#010101] group-hover:text-[#7E4124] transition-colors uppercase whitespace-nowrap">
                Gh Roviq Stix &amp; Co
              </span>
            </Link>
          </div>

          {/* Right Column: ORDER NOW Pill Button + Cart + Auth */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 w-1/3">
            {/* Order Now Pill Button (Matching Ferea Cafe Screenshot) */}
            <Link
              href="/menu"
              className="hidden sm:inline-flex items-center gap-2 pl-4 sm:pl-5 pr-1.5 sm:pr-2 py-1.5 rounded-full border border-[#7E4124] bg-transparent hover:bg-[#7E4124] text-[#7E4124] hover:text-white transition-all text-xs font-bold uppercase tracking-wider group shadow-2xs select-none active:scale-95"
            >
              <span className="font-display tracking-wider">ORDER NOW</span>
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#7E4124] group-hover:bg-white text-white group-hover:text-[#7E4124] flex items-center justify-center transition-all">
                <ArrowRight size={12} className="stroke-[2.5]" />
              </span>
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 rounded-full border border-[#D8D0C8] bg-white/70 hover:bg-white text-[#7E4124] hover:text-[#010101] transition-all active:scale-95 flex items-center justify-center shadow-2xs"
              aria-label="Keranjang"
            >
              <ShoppingBag size={17} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#7E4124] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth / Account */}
            <div className="flex items-center pl-1">
              <AppSignedOut>
                <Link
                  href="/sign-in"
                  className="font-display font-bold text-xs uppercase tracking-wider text-[#7E4124] hover:text-[#010101] transition-colors hidden sm:inline"
                >
                  Masuk
                </Link>
              </AppSignedOut>
              <AppSignedIn>
                <AppUserButton />
              </AppSignedIn>
            </div>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-dashed border-[#D8D0C8] bg-[#F3EFEA] px-6 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block font-display font-bold uppercase tracking-wider text-sm text-[#7E4124] hover:text-[#010101] py-1"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-[#EAE4DA] flex items-center justify-between">
              <Link
                href="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full border border-[#7E4124] text-[#7E4124] text-xs font-bold uppercase tracking-wider"
              >
                <span>ORDER NOW</span>
                <span className="w-5 h-5 rounded-full bg-[#7E4124] text-white flex items-center justify-center">
                  <ArrowRight size={11} />
                </span>
              </Link>
              <AppSignedOut>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display font-bold text-xs uppercase text-[#7E4124]"
                >
                  Masuk Akun
                </Link>
              </AppSignedOut>
            </div>
          </div>
        )}
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
          {/* Rim Light (Glass Edge Bezel Highlight) */}
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

          {/* 4 Equal Hitbox Buttons (Icons Only as requested previously) */}
          <Link
            href="/"
            className="relative z-10 w-[64px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90"
            aria-label="Beranda"
          >
            <Home
              size={20}
              className={`transition-colors duration-200 ${
                activeIndex === 0 ? 'text-white stroke-[2.4]' : 'text-[#605850] stroke-[1.8]'
              }`}
            />
          </Link>

          <Link
            href="/menu"
            className="relative z-10 w-[64px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90"
            aria-label="Menu"
          >
            <Coffee
              size={20}
              className={`transition-colors duration-200 ${
                activeIndex === 1 ? 'text-white stroke-[2.4]' : 'text-[#605850] stroke-[1.8]'
              }`}
            />
          </Link>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="relative z-10 w-[64px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90"
            aria-label="Pesanan"
          >
            <div className="relative">
              <ShoppingBag
                size={20}
                className={`transition-colors duration-200 ${
                  activeIndex === 2 ? 'text-white stroke-[2.4]' : 'text-[#605850] stroke-[1.8]'
                }`}
              />
              {totalItems > 0 && (
                <span
                  className={`absolute -top-1.5 -right-2 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                    activeIndex === 2
                      ? 'bg-white text-[#C2652A]'
                      : 'bg-[#C2652A] text-white'
                  }`}
                >
                  {totalItems}
                </span>
              )}
            </div>
          </button>

          <Link
            href={isAdmin ? '/admin' : '/profil'}
            className="relative z-10 w-[64px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90"
            aria-label={isAdmin ? 'Admin' : 'Member'}
          >
            <User
              size={20}
              className={`transition-colors duration-200 ${
                activeIndex === 3 ? 'text-white stroke-[2.4]' : 'text-[#605850] stroke-[1.8]'
              }`}
            />
          </Link>
        </nav>
      )}
    </>
  );
};
