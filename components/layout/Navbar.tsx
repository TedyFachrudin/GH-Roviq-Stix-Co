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
      {/* Desktop & Mobile Top Header: Glassmorphism Floating Bar with Frosted Glass & Ambient Glow */}
      <header className="sticky top-0 sm:top-3 z-40 sm:max-w-7xl sm:mx-auto sm:px-6 lg:px-8 transition-all duration-300">
        <div className="relative sm:rounded-3xl bg-white/70 backdrop-blur-2xl border-b sm:border border-white/60 shadow-[0_8px_32px_0_rgba(168,85,247,0.15),0_2px_12px_0_rgba(236,72,153,0.15)] ring-1 ring-purple-500/15">
          {/* Ambient soft glowing light behind glass */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/20 via-fuchsia-500/20 to-purple-600/20 sm:rounded-3xl blur-md -z-10 pointer-events-none opacity-80" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              
              {/* Logo brand with subtle neon glow */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 blur-xs opacity-50 group-hover:opacity-100 transition-opacity" />
                  <BrandLogo size={42} className="relative w-[42px] h-[42px]" priority />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-[#3A302A] via-[#581C87] to-[#A21CAF] bg-clip-text text-transparent">
                    GH ROVIQ
                  </span>
                  <span className="text-[10px] tracking-widest text-purple-700 font-sans uppercase font-semibold">
                    Coffee & Kitchen
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation: Glass Floating Capsule */}
              <nav className="hidden md:flex items-center space-x-1.5 p-1.5 rounded-full bg-white/40 border border-white/60 backdrop-blur-md shadow-inner">
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href === '/admin' && pathname.startsWith('/admin'));
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white shadow-[0_4px_14px_rgba(219,39,119,0.4)]'
                          : 'text-[#605850] hover:text-[#7E22CE] hover:bg-white/60'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Action Tools: Auth & Cart with glowing accents */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* User Button / Sign In */}
                <div className="hidden sm:flex items-center">
                  <AppSignedOut>
                    <Link
                      href="/sign-in"
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-purple-900 hover:text-white px-4 py-2 rounded-full bg-white/60 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 border border-purple-200/60 shadow-xs transition-all hover:shadow-[0_4px_12px_rgba(219,39,119,0.3)]"
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
                    <button
                      onClick={() => setIsDrawerOpen(true)}
                      className="relative p-2.5 rounded-full bg-white/60 text-purple-950 hover:text-white hover:bg-gradient-to-tr hover:from-pink-500 hover:to-purple-600 border border-white/70 shadow-xs hover:shadow-[0_4px_16px_rgba(219,39,119,0.35)] transition-all"
                      aria-label="Buka Keranjang"
                    >
                      <ShoppingBag size={20} />
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.7)] animate-pulse">
                          {totalItems}
                        </span>
                      )}
                    </button>
                  </>
                )}

                {/* Mobile Hamburger Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2.5 rounded-2xl text-purple-950 hover:bg-white/60 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Drawer Menu (Frosted Glass) */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white/85 backdrop-blur-2xl border-t border-purple-100/60 px-4 pt-3 pb-6 space-y-2.5 sm:rounded-b-3xl">
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
                        ? 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white shadow-[0_4px_14px_rgba(219,39,119,0.35)]'
                        : 'text-[#3A302A] hover:bg-white/60'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="pt-3 border-t border-purple-100/60 flex items-center justify-between px-2">
                <AppSignedOut>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-[0_4px_14px_rgba(219,39,119,0.35)]"
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

      {/* Customer / Member Mobile Bottom Navigation Bar: Floating Glassmorphism Dock */}
      {!pathname.startsWith('/admin') && (
        <nav className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto md:hidden">
          {/* Ambient soft glowing light behind dock */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-pink-500/35 via-fuchsia-500/35 to-purple-600/35 blur-xl opacity-90 pointer-events-none -z-10" />

          {/* Frosted glass container with layered depth */}
          <div className="relative rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/70 shadow-[0_12px_40px_0_rgba(168,85,247,0.35),0_2px_10px_0_rgba(236,72,153,0.25)] px-3 py-2 flex items-center justify-around ring-1 ring-white/60">
            <Link
              href="/"
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 relative ${
                pathname === '/'
                  ? 'bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-600 text-white shadow-[0_4px_16px_rgba(219,39,119,0.45)]'
                  : 'text-neutral-600 hover:text-purple-600 hover:bg-white/30'
              }`}
            >
              <Home size={19} className={pathname === '/' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">Beranda</span>
            </Link>

            <Link
              href="/menu"
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 relative ${
                pathname === '/menu'
                  ? 'bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-600 text-white shadow-[0_4px_16px_rgba(219,39,119,0.45)]'
                  : 'text-neutral-600 hover:text-purple-600 hover:bg-white/30'
              }`}
            >
              <Coffee size={19} className={pathname === '/menu' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">Menu</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 text-neutral-600 hover:text-purple-600 hover:bg-white/30 relative"
              aria-label="Keranjang Belanja"
            >
              <div className="relative">
                <ShoppingBag size={19} className="stroke-[1.8]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-tight">Pesanan</span>
            </button>

            <Link
              href={isAdmin ? '/admin' : '/profil'}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 relative ${
                pathname === '/profil' || pathname.startsWith('/sign-in')
                  ? 'bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-600 text-white shadow-[0_4px_16px_rgba(219,39,119,0.45)]'
                  : 'text-neutral-600 hover:text-purple-600 hover:bg-white/30'
              }`}
            >
              <User size={19} className={pathname === '/profil' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
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
