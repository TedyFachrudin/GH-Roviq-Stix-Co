'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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
      {/* ═══════════════════════════════════════════════════════
          TOP NAVBAR — Ferea Editorial Style
          Cream bg, dashed border, centered logo, pill CTA
          Sticky, entrance anim, 1344px max-width, 30px padding
       ═══════════════════════════════════════════════════════ */}
      <header className="navbar-entrance sticky top-0 z-40 w-full bg-[#F3EFEA]/95 backdrop-blur-md border-b border-dashed border-[#D8D0C8]">
        <div className="relative max-w-[1344px] mx-auto px-5 nav-desktop:px-[30px] py-3.5 nav-desktop:py-4 flex items-center justify-between">

          {/* ── Left: Nav Links (desktop) / Hamburger (mobile) ── */}
          <div className="flex items-center gap-6 min-w-0 z-10">
            {/* Hamburger — visible below 810px */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#7E4124] hover:text-[#010101] nav-desktop:hidden transition-colors"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
            >
              {/* Hamburger ↔ X morph */}
              <span className={`absolute w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}`} />
              <span className={`absolute w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`} />
              <span className={`absolute w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'}`} />
            </button>

            {/* Desktop nav links — visible ≥810px */}
            <nav aria-label="Main Navigation" className="hidden nav-desktop:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href === '/admin' && pathname.startsWith('/admin'));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-display font-bold uppercase tracking-wider text-[13px] transition-colors duration-200 select-none relative group ${
                      isActive
                        ? 'text-[#010101]'
                        : 'text-[#7E4124] hover:text-[#010101]'
                    }`}
                  >
                    {link.name}
                    {/* Underline indicator */}
                    <span className={`absolute -bottom-1.5 left-0 h-[2px] bg-[#7E4124] transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── Center: Logo (absolutely centered) ── */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-2 nav-desktop:gap-2.5 select-none group z-20"
          >
            <div className="relative w-6 h-6 nav-desktop:w-7 nav-desktop:h-7 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo-gh-roviq.svg"
                alt="GH ROVIQ Logo"
                width={28}
                height={28}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display font-bold text-xs nav-desktop:text-sm tracking-wider text-[#7E4124] group-hover:text-[#4A2813] transition-colors uppercase whitespace-nowrap">
              Gh Roviq Stix &amp; Co
            </span>
          </Link>

          {/* ── Right: ORDER NOW pill + Cart + Auth ── */}
          <div className="flex items-center justify-end gap-2.5 z-10">
            {/* ORDER NOW pill — Ferea style with arrow circle */}
            <Link
              href="/menu"
              className="hidden nav-desktop:inline-flex items-center gap-2 pl-5 pr-2 py-1.5 rounded-full border border-[#7E4124] bg-transparent hover:bg-[#7E4124] text-[#7E4124] hover:text-white transition-all duration-200 text-xs font-bold uppercase tracking-wider group select-none active:scale-[0.97]"
            >
              <span className="font-display tracking-wider">ORDER NOW</span>
              <span className="w-6 h-6 rounded-full bg-[#7E4124] group-hover:bg-white text-white group-hover:text-[#7E4124] flex items-center justify-center transition-all duration-200">
                <ArrowRight size={12} className="stroke-[2.5]" />
              </span>
            </Link>

            {/* Cart button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 rounded-full border border-[#D8D0C8] bg-white/70 hover:bg-white text-[#7E4124] hover:text-[#010101] transition-all duration-200 active:scale-95 flex items-center justify-center"
              aria-label="Keranjang"
            >
              <ShoppingBag size={17} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#7E4124] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth */}
            <div className="flex items-center pl-1">
              <AppSignedOut>
                <Link
                  href="/sign-in"
                  className="font-display font-bold text-xs uppercase tracking-wider text-[#7E4124] hover:text-[#010101] transition-colors hidden nav-desktop:inline"
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

        {/* ── Mobile Dropdown Panel ── */}
        <div
          className={`nav-desktop:hidden border-t border-dashed border-[#D8D0C8] bg-[#F3EFEA] overflow-hidden transition-[max-height,opacity] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-5 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block font-display font-bold uppercase tracking-wider text-sm text-[#7E4124] hover:text-[#010101] py-1.5 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#EAE4DA] flex items-center justify-between">
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
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          MOBILE BOTTOM NAV — Liquid Glass Pill
          Fixed bottom, icons only, sliding active pill
          Visible < md (768px), hidden on admin pages
       ═══════════════════════════════════════════════════════ */}
      {!pathname.startsWith('/admin') && (
        <nav
          aria-label="Mobile Bottom Navigation"
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
          {/* Rim Light */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow:
                'inset 0px 2px 3px -1px rgba(255, 255, 255, 0.95), inset 0px -2px 3px -1px rgba(255, 255, 255, 0.8), inset 5px 0px 6px -3px rgba(255, 255, 255, 0.85), inset -5px 0px 6px -3px rgba(255, 255, 255, 0.85), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.35), inset 0px 0px 0px 4px rgba(255, 255, 255, 0.08), inset 0px 0px 14px 4px rgba(58, 48, 42, 0.08)',
            }}
          />

          {/* Sliding active pill */}
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
            <div className="absolute left-[6px] bottom-0 w-[18px] h-[18px] rounded-full pointer-events-none" style={{ backgroundColor: '#ffffff', filter: 'blur(7px)', opacity: 0.65 }} />
            <div className="absolute left-[11px] bottom-[2px] w-[6px] h-[6px] rounded-full pointer-events-none" style={{ backgroundColor: '#ffffff', filter: 'blur(1.5px)', opacity: 0.95 }} />
            <div className="absolute right-[8px] top-0 w-[14px] h-[14px] rounded-full pointer-events-none" style={{ backgroundColor: '#ffffff', filter: 'blur(5px)', opacity: 0.55 }} />
            <div className="absolute right-[11px] top-[2px] w-[5px] h-[5px] rounded-full pointer-events-none" style={{ backgroundColor: '#ffffff', filter: 'blur(1.5px)', opacity: 0.9 }} />
          </div>

          {/* Nav buttons */}
          <Link href="/" className="relative z-10 w-[64px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90" aria-label="Beranda">
            <Home size={20} className={`transition-colors duration-200 ${activeIndex === 0 ? 'text-white stroke-[2.4]' : 'text-[#605850] stroke-[1.8]'}`} />
          </Link>
          <Link href="/menu" className="relative z-10 w-[64px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90" aria-label="Menu">
            <Coffee size={20} className={`transition-colors duration-200 ${activeIndex === 1 ? 'text-white stroke-[2.4]' : 'text-[#605850] stroke-[1.8]'}`} />
          </Link>
          <button type="button" onClick={() => setIsDrawerOpen(true)} className="relative z-10 w-[64px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90" aria-label="Pesanan">
            <div className="relative">
              <ShoppingBag size={20} className={`transition-colors duration-200 ${activeIndex === 2 ? 'text-white stroke-[2.4]' : 'text-[#605850] stroke-[1.8]'}`} />
              {totalItems > 0 && (
                <span className={`absolute -top-1.5 -right-2 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs transition-colors ${activeIndex === 2 ? 'bg-white text-[#C2652A]' : 'bg-[#C2652A] text-white'}`}>
                  {totalItems}
                </span>
              )}
            </div>
          </button>
          <Link href={isAdmin ? '/admin' : '/profil'} className="relative z-10 w-[64px] h-[48px] rounded-[24px] flex items-center justify-center transition-all duration-200 active:scale-90" aria-label={isAdmin ? 'Admin' : 'Member'}>
            <User size={20} className={`transition-colors duration-200 ${activeIndex === 3 ? 'text-white stroke-[2.4]' : 'text-[#605850] stroke-[1.8]'}`} />
          </Link>
        </nav>
      )}
    </>
  );
};
