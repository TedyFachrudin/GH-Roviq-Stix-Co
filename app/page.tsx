'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  Coffee,
  Sparkles,
  Award,
  Clock,
  Heart,
  Plus,
  Edit2,
  CheckCircle2,
  Flame,
  Star,
} from 'lucide-react';
import { Product } from '@/types';
import { getStoredProducts, syncCatalogWithCloud, saveStoredProducts } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/lib/admin';
import { EditProductModal } from '@/components/admin/EditProductModal';
import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const { addItem, setIsDrawerOpen } = useCart();
  const { isAdmin } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  useEffect(() => {
    const syncProducts = () => {
      setProducts(getStoredProducts());
    };
    syncProducts();

    // Cross-device cloud sync (guest, member, admin)
    syncCatalogWithCloud().then((cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setProducts(cloudItems);
      }
    });

    // Realtime Supabase updates across all devices
    const channel = supabase
      .channel('gh_catalog_home')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: 'customer_name=eq.__CATALOG_SYNC__',
        },
        (payload) => {
          try {
            const raw = (payload.new as any)?.delivery_address;
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                saveStoredProducts(parsed, false);
                setProducts(parsed);
              }
            }
          } catch (e) {
            console.error('Realtime sync parse err:', e);
          }
        }
      )
      .subscribe();

    window.addEventListener('gh_products_updated', syncProducts);
    window.addEventListener('storage', syncProducts);
    window.addEventListener('focus', syncProducts);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('gh_products_updated', syncProducts);
      window.removeEventListener('storage', syncProducts);
      window.removeEventListener('focus', syncProducts);
    };
  }, []);

  const featuredProducts =
    products.filter((p) => p.badge === 'Terlaris' || p.badge).length > 0
      ? products.filter((p) => p.badge === 'Terlaris' || p.badge).slice(0, 8)
      : products.slice(0, 8);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-20 sm:space-y-28 md:space-y-36 pb-20">
      
      {/* 1. HERO SECTION (Ferea Signature Integrated Side-by-Side 3D Hero) */}
      <section
        className="relative pt-6 sm:pt-10 md:pt-14 pb-12 sm:pb-20 overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            
            {/* Left Column: Typography, Narrative & Actions */}
            <div className="lg:col-span-7 xl:col-span-7 z-20 space-y-6 sm:space-y-8">
              
              {/* Animated Floating Vinyl Sticker (Overlapping FRESHLY) */}
              <div className="relative z-30 mb-[-22px] sm:mb-[-34px] md:mb-[-42px] w-fit">
                <div className="animate-sticker-swing select-none cursor-pointer">
                  <div className="relative w-[130px] sm:w-[165px] md:w-[195px] aspect-[862/693] filter drop-shadow-[0_10px_20px_rgba(58,32,16,0.25)] hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/images/hero-sticker-stayawake.png"
                      alt="Stay Awake - GH ROVIQ CO. Sticker"
                      fill
                      priority
                      className="object-contain"
                      sizes="(max-width: 640px) 130px, (max-width: 768px) 165px, 195px"
                    />
                  </div>
                </div>
              </div>

              {/* Giant Display Headlines (Ferea Style) */}
              <div className="space-y-0 select-none">
                <h1 className="font-display font-bold uppercase tracking-tighter text-[#010101] leading-[0.85] text-[64px] sm:text-[96px] md:text-[116px] lg:text-[110px] xl:text-[132px]">
                  FRESHLY
                </h1>
                <h2 className="font-display font-bold uppercase tracking-tighter text-[#7E4124] leading-[0.85] text-[64px] sm:text-[96px] md:text-[116px] lg:text-[110px] xl:text-[132px]">
                  BREWED
                </h2>
              </div>

              {/* Subtitle Narrative */}
              <p className="text-sm sm:text-base text-[#7A7269] leading-relaxed font-sans font-light max-w-lg">
                Specialty coffee, and artisan kitchen made to brighten every day. Enjoy curated single origin, seasonal drinks & warm hospitality.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/menu"
                  className="px-8 py-3.5 rounded-full bg-[#010101] hover:bg-[#7E4124] text-white text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 active:scale-95 group"
                >
                  <span>Order Now</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/profil"
                  className="px-7 py-3.5 rounded-full bg-white/70 hover:bg-white border border-[#D8D0C8] text-[#010101] text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-2xs"
                >
                  <Award size={15} className="text-[#7E4124]" />
                  <span>Member & Loyalty Stamp</span>
                </Link>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-6 sm:gap-8 pt-4 border-t border-[#EAE4DA] max-w-md text-[#010101]">
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-bold text-3xl sm:text-4xl">10</span>
                  <span className="text-[11px] text-[#7A7269] uppercase font-sans tracking-wide leading-tight">
                    Stamps<br />Free Coffee
                  </span>
                </div>
                <div className="w-px h-8 bg-[#D8D0C8]" />
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-bold text-3xl sm:text-4xl text-[#7E4124]">4.9★</span>
                  <span className="text-[11px] text-[#7A7269] uppercase font-sans tracking-wide leading-tight">
                    Customer<br />Rating
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Seamless 3D Cup + Splash Parallax (No Card, Large & Tilted) */}
            <div className="lg:col-span-5 xl:col-span-5 relative z-10 flex items-center justify-center min-h-[400px] sm:min-h-[520px] lg:min-h-[580px] xl:min-h-[640px] select-none py-6 lg:py-0">

              {/* Rotating Circular Sticker Badge (Floating Top Right) */}
              <div className="hidden sm:flex absolute -top-4 right-2 lg:-top-6 lg:-right-4 z-30 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#010101]/90 backdrop-blur-md border border-white/20 text-[#F3EFEA] items-center justify-center shadow-2xl select-none">
                <svg
                  className="w-full h-full animate-spin-slow p-1.5"
                  viewBox="0 0 100 100"
                  overflow="visible"
                >
                  <path
                    id="badgeCircle"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text className="text-[9.5px] font-bold uppercase tracking-[2.6px] fill-[#F3EFEA]">
                    <textPath href="#badgeCircle">
                      • GH ROVIQ • 100% ARABICA • EST. 2026
                    </textPath>
                  </text>
                </svg>
                <Coffee size={20} className="absolute text-[#DD9F57]" />
              </div>

              {/* 3D Coffee Splash Layer (Behind Cup, Large & Flowing) */}
              <div
                className="absolute z-10 w-[380px] sm:w-[500px] md:w-[560px] lg:w-[580px] xl:w-[650px] aspect-square pointer-events-none select-none"
                style={{
                  transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px) rotate(-8deg) scale(1.05)`,
                  transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              >
                <Image
                  src="/images/hero-splash-ghroviq.png"
                  alt="3D Coffee Splash and Beans"
                  fill
                  priority
                  className="object-contain filter drop-shadow-[0_24px_45px_rgba(126,65,36,0.3)]"
                  sizes="(max-width: 768px) 380px, (max-width: 1200px) 560px, 650px"
                />
              </div>

              {/* 3D GH ROVIQ Paper Cup Layer (Front & Center, Tilted slightly & Large) */}
              <div
                className="relative z-20 w-[210px] sm:w-[270px] md:w-[300px] lg:w-[310px] xl:w-[340px] aspect-[441/712] pointer-events-none select-none"
                style={{
                  transform: `perspective(1000px) rotateX(${mousePos.y * -16}deg) rotateY(${mousePos.x * 16}deg) rotateZ(-16deg) scale(${1 + Math.abs(mousePos.x) * 0.03})`,
                  filter: 'drop-shadow(-32px 48px 36px rgba(58, 32, 16, 0.44)) drop-shadow(0 14px 22px rgba(0,0,0,0.18))',
                  transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              >
                <Image
                  src="/images/hero-cup-ghroviq-cropped.png"
                  alt="GH ROVIQ STIX & CO 3D Artisan Coffee Cup"
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 768px) 210px, (max-width: 1200px) 300px, 340px"
                />
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 2. INFINITE RUNNING TICKER MARQUEE (Ferea Style) */}
      <section className="bg-[#010101] text-[#F3EFEA] py-3.5 sm:py-4 overflow-hidden border-y border-[#010101] select-none shadow-sm">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-6 text-xs sm:text-sm font-display font-bold uppercase tracking-[0.2em]">
          <span>FRESHLY BREWED</span>
          <span className="text-[#DD9F57]">•</span>
          <span>SPECIALTY ARABICA</span>
          <span className="text-[#DD9F57]">•</span>
          <span>ARTISAN KITCHEN</span>
          <span className="text-[#DD9F57]">•</span>
          <span>WARM HOSPITALITY</span>
          <span className="text-[#DD9F57]">•</span>
          <span>SINGLE ORIGIN</span>
          <span className="text-[#DD9F57]">•</span>
          <span>DAILY MOMENTS</span>
          <span className="text-[#DD9F57]">•</span>
          <span>SOURDOUGH BITES</span>
          <span className="text-[#DD9F57]">•</span>
          <span>CRAFTED WITH CARE</span>
          <span className="text-[#DD9F57]">•</span>
          {/* Duplicate set for seamless continuous loop */}
          <span>FRESHLY BREWED</span>
          <span className="text-[#DD9F57]">•</span>
          <span>SPECIALTY ARABICA</span>
          <span className="text-[#DD9F57]">•</span>
          <span>ARTISAN KITCHEN</span>
          <span className="text-[#DD9F57]">•</span>
          <span>WARM HOSPITALITY</span>
          <span className="text-[#DD9F57]">•</span>
          <span>SINGLE ORIGIN</span>
          <span className="text-[#DD9F57]">•</span>
          <span>DAILY MOMENTS</span>
          <span className="text-[#DD9F57]">•</span>
          <span>SOURDOUGH BITES</span>
          <span className="text-[#DD9F57]">•</span>
          <span>CRAFTED WITH CARE</span>
          <span className="text-[#DD9F57]">•</span>
        </div>
      </section>

      {/* 3. ABOUT US SECTION ("MORE THAN COFFEE, IT'S DAILY MOMENT") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left: Editorial Copy */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-bold tracking-widest text-[#7E4124] uppercase font-sans">
              [ ABOUT GH ROVIQ ]
            </span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tighter text-[#010101] leading-[0.95]">
              MORE THAN COFFEE, <br />
              <span className="text-[#7E4124]">IT’S A DAILY MOMENT.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#7A7269] leading-relaxed font-sans font-light">
              Di GH ROVIQ, kami percaya secangkir kopi terbaik tercipta dari ketelitian proses dan ketulusan dalam setiap sentuhan. Diseduh dari biji arabika terbaik Nusantara, bersanding dengan sajian dapur hangat yang diolah secara jujur dan bersahaja.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#EAE4DA]">
              <div className="p-4 rounded-2xl bg-white border border-[#E7DFD3] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E4124]">
                  Koleksi Stamp
                </span>
                <p className="font-display font-bold text-xl text-[#010101]">10 STAMP = 1 GRATIS</p>
                <p className="text-[11px] text-[#7A7269] font-light">Otomatis sync ke kartu profil digital.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E7DFD3] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E4124]">
                  Kualitas Seduh
                </span>
                <p className="font-display font-bold text-xl text-[#010101]">100% ARABIKA</p>
                <p className="text-[11px] text-[#7A7269] font-light">Single origin & house blend segar.</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#010101] hover:text-[#7E4124] transition-colors group"
              >
                <span>Pelajari Koleksi Menu Kami</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform text-[#7E4124]" />
              </Link>
            </div>
          </div>

          {/* Right: 3-Photo Bento Strip */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden border border-[#D8D0C8] shadow-md bg-[#EAE4DA]">
              <Image
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
                alt="Barista menyeduh kopi V60"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="space-y-4 flex flex-col justify-between">
              <div className="relative aspect-square rounded-[24px] overflow-hidden border border-[#D8D0C8] shadow-md bg-[#EAE4DA]">
                <Image
                  src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop"
                  alt="Biji kopi arabika sangrai segar"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative aspect-square rounded-[24px] overflow-hidden border border-[#D8D0C8] shadow-md bg-[#EAE4DA]">
                <Image
                  src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop"
                  alt="Pastry hangat dapur artisan"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FEATURED MENU SHOWCASE ("MADE WITH CARE, SERVED WITH HEART") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 border-b border-[#EAE4DA] pb-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#7E4124] uppercase font-sans">
              [ DRINKS & ARTISAN BITES ]
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-tighter text-[#010101] mt-1 leading-[0.95]">
              MADE WITH CARE, <span className="text-[#7E4124]">SERVED WITH HEART.</span>
            </h2>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#010101] hover:bg-[#7E4124] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 self-start md:self-auto"
          >
            <span>Buka Semua Menu</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Product Cards Grid (Ferea Style) */}
        {featuredProducts.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-[#E7DFD3] p-10 sm:p-16 text-center max-w-xl mx-auto space-y-5 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#F3EFEA] border border-[#E7DFD3] flex items-center justify-center text-[#7E4124] mx-auto shadow-inner">
              <Coffee size={28} className="stroke-[1.75]" />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFEA] border border-[#E7DFD3] text-[#7E4124] text-[10px] font-bold uppercase tracking-widest">
                <Sparkles size={11} />
                <span>Katalog Kosong</span>
              </span>
              <h3 className="font-display font-bold text-2xl text-[#010101] uppercase tracking-tight">
                Menu Terlaris Sedang Dipersiapkan
              </h3>
              <p className="text-xs sm:text-sm text-[#7A7269] max-w-md mx-auto leading-relaxed font-light font-sans">
                Saat ini belum ada produk dalam katalog. Anda dapat menambahkan menu melalui Portal Admin.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#010101] text-white text-xs font-semibold uppercase tracking-wider transition-all hover:bg-[#7E4124]"
              >
                <span>Lihat Katalog Lengkap</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-[26px] border border-[#E7DFD3] p-4 flex flex-col justify-between hover:border-[#7E4124] transition-all duration-300 hover:shadow-card hover:-translate-y-1"
              >
                {/* Product Image Box */}
                <div className="relative aspect-square w-full rounded-[20px] overflow-hidden bg-[#F3EFEA] mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized={Boolean(product.image?.startsWith('data:'))}
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-[#010101]/85 backdrop-blur-sm text-white text-[9.5px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-white/20">
                      {product.badge}
                    </span>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-[#010101] shadow-xs">
                    ★ {product.rating || 4.9}
                  </div>
                </div>

                {/* Info & Add Action */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E4124]">
                      {product.category}
                    </span>
                    <h3 className="font-display font-bold text-lg text-[#010101] uppercase tracking-tight line-clamp-1 group-hover:text-[#7E4124] transition-colors mt-0.5">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#7A7269] line-clamp-2 leading-relaxed font-light mt-1 font-sans">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F3EFEA] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#7A7269] block font-sans">Harga</span>
                      <span className="font-display font-bold text-base text-[#010101]">
                        {formatRupiah(product.price)}
                      </span>
                    </div>

                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsEditModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-full bg-[#EAE4DA] hover:bg-[#7E4124] text-[#010101] hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1 active:scale-95"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          addItem(product);
                          setIsDrawerOpen(true);
                        }}
                        className="px-4 py-2 rounded-full bg-[#010101] hover:bg-[#7E4124] text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-2xs group-hover:bg-[#7E4124]"
                      >
                        <Plus size={13} className="stroke-[3]" />
                        <span>Order</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. WHY CHOOSE US (3 Bento Feature Cards from Ferea) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-[11px] font-bold tracking-widest text-[#7E4124] uppercase font-sans">
            [ WHY CHOOSE US ]
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-tighter text-[#010101] leading-[0.95]">
            CRAFTED FOR YOUR <br />
            <span className="text-[#7E4124]">EVERYDAY RITUAL.</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7269] leading-relaxed font-sans font-light">
            Dari biji kopi pilihan hingga hidangan hangat yang jujur, kami merawat setiap detail dengan kualitas dan ketulusan hati.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white p-7 sm:p-8 rounded-[28px] border border-[#E7DFD3] space-y-5 hover:border-[#7E4124] transition-all hover:shadow-card hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-3xl text-[#7E4124]">01</span>
              <div className="w-10 h-10 rounded-full bg-[#F3EFEA] text-[#7E4124] flex items-center justify-center">
                <Coffee size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl uppercase tracking-tight text-[#010101]">
                Brewed with Intention
              </h3>
              <p className="text-xs sm:text-sm text-[#7A7269] leading-relaxed font-sans font-light">
                Hanya biji arabika single origin dan house blend terbaik yang dipanggang segar. Diseduh dengan kalibrasi harian rasio gramatur serta suhu presisi.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 sm:p-8 rounded-[28px] border border-[#E7DFD3] space-y-5 hover:border-[#7E4124] transition-all hover:shadow-card hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-3xl text-[#7E4124]">02</span>
              <div className="w-10 h-10 rounded-full bg-[#F3EFEA] text-[#7E4124] flex items-center justify-center">
                <Flame size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl uppercase tracking-tight text-[#010101]">
                Honest Kitchen Comfort
              </h3>
              <p className="text-xs sm:text-sm text-[#7A7269] leading-relaxed font-sans font-light">
                Sajian pendamping diolah segar dari dapur artisan: roti sourdough, pastry renyah, dan comfort food hangat tanpa kompromi bahan instan.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 sm:p-8 rounded-[28px] border border-[#E7DFD3] space-y-5 hover:border-[#7E4124] transition-all hover:shadow-card hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-3xl text-[#7E4124]">03</span>
              <div className="w-10 h-10 rounded-full bg-[#F3EFEA] text-[#7E4124] flex items-center justify-center">
                <Award size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl uppercase tracking-tight text-[#010101]">
                Warm Ambience & Rewards
              </h3>
              <p className="text-xs sm:text-sm text-[#7A7269] leading-relaxed font-sans font-light">
                Ruang teduh untuk rehat dan berbincang santai, dilengkapi kartu stamp loyalitas digital untuk menikmati hadiah seduhan gratis di setiap kunjungan.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. AMBIENCE & SPACE ("OUR PLACE") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] sm:rounded-[44px] bg-[#EAE4DA] border border-[#D8D0C8] p-6 sm:p-12 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-[#7E4124] uppercase font-sans">
                [ SANCTUARY FOR YOUR ROUTINE ]
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-tighter text-[#010101] mt-1 leading-[0.95]">
                OUR COZY CORNER.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7269] max-w-sm font-sans font-light">
              Nikmati aroma biji sangrai, alunan musik tenang, dan ruang duduk nyaman untuk bekerja atau rehat sejenak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative aspect-[4/3] rounded-[22px] overflow-hidden shadow-xs">
              <Image
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop"
                alt="Suasana kedai GH ROVIQ"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-[22px] overflow-hidden shadow-xs">
              <Image
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop"
                alt="Meja seduh dan barista corner"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-[22px] overflow-hidden shadow-xs">
              <Image
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
                alt="Secangkir kopi espresso hangat"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. DIGITAL LOYALTY CARD BANNER (Ferea Dark Statement Card) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] sm:rounded-[44px] bg-[#010101] text-[#F3EFEA] p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl border border-white/10">
          
          {/* Ambient Glow */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#7E4124]/30 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-[#DD9F57] text-xs font-bold uppercase tracking-wider font-sans">
              <Award size={14} />
              <span>GH ROVIQ Digital Stamp</span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.92] text-white">
              KUMPULKAN 10 STAMP, <br />
              <span className="text-[#DD9F57]">NIKMATI 1 KOPI GRATIS.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#A89F95] leading-relaxed font-sans font-light max-w-lg">
              Setiap kali memesan secangkir kopi, admin kasir kami dapat menambahkan stamp digital ke profil akun member Anda. Tanpa kartu fisik yang mudah hilang.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/profil"
                className="px-7 py-3.5 rounded-full bg-[#DD9F57] hover:bg-[#c88d49] text-[#010101] text-xs font-bold uppercase tracking-wider text-center transition-all active:scale-95"
              >
                Cek Kartu Loyalty Saya
              </Link>
              <Link
                href="/sign-up"
                className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider text-center transition-all active:scale-95"
              >
                Daftar Sebagai Member
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Product & Stock Modal for Admin */}
      <EditProductModal
        isOpen={isEditModalOpen}
        product={editingProduct}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
      />

    </div>
  );
}

