'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu as MenuIcon, X, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { AppSignedIn, AppSignedOut, AppUserButton } from '@/lib/auth';
import { BrandLogo } from '@/components/ui/BrandLogo';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { totalItems, setIsDrawerOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'Profil & Loyalty', href: '/profil' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF5EE]/95 backdrop-blur-md border-b border-[#E8E2D9] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo brand matching SVGs */}
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo size={42} className="w-[42px] h-[42px]" priority />
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#3A302A]">
                GH ROVIQ
              </span>
              <span className="text-[10px] tracking-widest text-[#9A9088] uppercase font-sans">
                Coffee & Kitchen
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors ${
                    isActive
                      ? 'text-[#C2652A] font-medium border-b-2 border-[#C2652A] pb-1'
                      : 'text-[#605850] hover:text-[#3A302A]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Tools: Auth & Cart */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* User Button / Sign In */}
            <div className="hidden sm:flex items-center">
              <AppSignedOut>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-[#3A302A] hover:text-[#C2652A] px-3 py-1.5 rounded-full border border-[#D8D0C8] hover:border-[#C2652A] transition-all"
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
                    className="relative p-2.5 rounded-full bg-[#F6F0E8] text-[#3A302A] hover:bg-[#F2ECE4] hover:text-[#C2652A] border border-[#E8E2D9] transition-all"
                    aria-label="Buka Keranjang"
                  >
                    <ShoppingBag size={20} />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#C2652A] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-in fade-in zoom-in duration-150">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </AppSignedIn>

                {/* When User is NOT Logged In: Only show button if user actively added items (never show dummy/starter data) */}
                <AppSignedOut>
                  {totalItems > 0 && (
                    <button
                      onClick={() => setIsDrawerOpen(true)}
                      className="relative p-2.5 rounded-full bg-[#F6F0E8] text-[#3A302A] hover:bg-[#F2ECE4] hover:text-[#C2652A] border border-[#E8E2D9] transition-all"
                      aria-label="Buka Keranjang"
                    >
                      <ShoppingBag size={20} />
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
              className="md:hidden p-2.5 rounded-md text-[#3A302A] hover:bg-[#F6F0E8] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF5EE] border-b border-[#E8E2D9] px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
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
  );
};
