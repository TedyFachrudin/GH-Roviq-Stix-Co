'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Coffee, Sparkles, Award, Clock, Heart, Plus } from 'lucide-react';
import { PRODUCTS } from '@/lib/products-data';
import { useCart } from '@/context/CartContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselCounter,
} from '@/components/ui/carousel';

export default function HomePage() {
  const { addItem, setIsDrawerOpen } = useCart();
  const featuredProducts = PRODUCTS.slice(0, 8);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-24 md:space-y-32">
      
      {/* Hero Section matching Landing Page.svg */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Tagline */}
            <div className="lg:col-span-7 space-y-6 md:space-y-8">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F6F0E8] border border-[#E8E2D9] text-[#C2652A] text-xs font-medium tracking-wider uppercase">
                <Sparkles size={13} />
                <span>GH Roviq Stix & Co.</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3A302A] leading-[1.15] tracking-tight">
                Inhale the smoke, brew your coffee, and go about your day
              </h1>

              <p className="text-base sm:text-lg text-[#605850] max-w-xl leading-relaxed font-sans font-light">
                Setiap cangkir kopi diseduh dari biji arabika terbaik Nusantara, bersanding dengan sajian dapur hangat yang diolah secara jujur dan bersahaja.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/menu"
                  className="px-8 py-4 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all group"
                >
                  <span>Eksplorasi Menu</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/profil"
                  className="px-8 py-4 rounded-xl bg-[#F6F0E8] hover:bg-[#F2ECE4] border border-[#D8D0C8] text-[#3A302A] text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all"
                >
                  <Award size={18} className="text-[#C2652A]" />
                  <span>Member & Loyalty Stamp</span>
                </Link>
              </div>

              {/* Small metrics row */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#E8E2D9] max-w-lg">
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3A302A]">10</div>
                  <div className="text-xs text-[#9A9088] uppercase tracking-wider mt-0.5">Stamp Gratis Kopi</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3A302A]">4.9★</div>
                  <div className="text-xs text-[#9A9088] uppercase tracking-wider mt-0.5">Ulasan Pelanggan</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Hero Photo */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-[#D8D0C8] shadow-2xl bg-[#F6F0E8]">
                  <Image
                    src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1000&auto=format&fit=crop"
                    alt="Barista menyeduh kopi di GH ROVIQ"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3A302A]/70 via-transparent to-transparent" />
                  
                  {/* Floating caption badge on image */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#FAF5EE]/95 backdrop-blur-md border border-[#E8E2D9] text-[#3A302A] shadow-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#C2652A] uppercase tracking-wider font-bold">
                          Seduhan Spesial Hari Ini
                        </span>
                        <h4 className="font-serif text-base font-bold text-[#3A302A] mt-0.5">
                          Signature Aren Latte
                        </h4>
                      </div>
                      <span className="text-sm font-bold text-[#3A302A] bg-[#F6F0E8] px-2.5 py-1 rounded-lg">
                        Rp 25.000
                      </span>
                    </div>
                  </div>
                </div>

                {/* Overlapping Stamp Card snippet */}
                <div className="hidden sm:flex absolute -bottom-8 -left-8 p-4 rounded-2xl bg-[#3A302A] text-[#FAF5EE] border border-[#4E423A] shadow-xl items-center gap-3 max-w-xs animate-in fade-in duration-500">
                  <div className="w-10 h-10 rounded-full bg-[#C2652A] text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Loyalty Card Aktif</p>
                    <p className="text-[#D8D0C8] text-[11px]">Kumpulkan 10 stamp untuk 1 kopi gratis.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Philosophy & Craftsmanship Section */}
      <section className="bg-[#F6F0E8] py-20 border-y border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-semibold tracking-widest text-[#C2652A] uppercase">
              Filosofi GH ROVIQ
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A302A]">
              Dibuat Dengan Waktu, Disajikan Dengan Hati.
            </h2>
            <p className="text-[#605850] text-sm leading-relaxed font-sans">
              Kami percaya bahwa secangkir kopi terbaik tercipta dari ketelitian proses dan ketulusan dalam setiap sentuhan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-[#FAF5EE] p-8 rounded-2xl border border-[#D8D0C8] space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-[#F7ECE4] text-[#C2652A] flex items-center justify-center">
                <Coffee size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#3A302A]">
                Kurasi Biji Kopi
              </h3>
              <p className="text-sm text-[#605850] leading-relaxed">
                Hanya menggunakan biji arabika single origin dan house blend nusantara yang dipanggang segar setiap minggu untuk menjaga profil rasa optimal.
              </p>
            </div>

            <div className="bg-[#FAF5EE] p-8 rounded-2xl border border-[#D8D0C8] space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-[#F7ECE4] text-[#C2652A] flex items-center justify-center">
                <Clock size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#3A302A]">
                Presisi Setiap Seduhan
              </h3>
              <p className="text-sm text-[#605850] leading-relaxed">
                Tiap racikan ditakar dan diekstraksi dengan suhu serta rasio gramatur yang terkalibrasi harian, menghadirkan konsistensi rasa di tiap kunjungan.
              </p>
            </div>

            <div className="bg-[#FAF5EE] p-8 rounded-2xl border border-[#D8D0C8] space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-[#F7ECE4] text-[#C2652A] flex items-center justify-center">
                <Heart size={24} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#3A302A]">
                Dapur Bersahaja
              </h3>
              <p className="text-sm text-[#605850] leading-relaxed">
                Sajian pendamping dibuat segar dari bahan alami: roti sourdough artisan, pastry renyah, dan comfort food hangat tanpa perasa buatan.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Menu Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest text-[#C2652A] uppercase">
              Kurasi Menu Pilihan
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A302A] mt-1">
              Menu Terlaris Musim Ini
            </h2>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#C2652A] hover:text-[#A95420] transition-colors"
          >
            <span>Lihat Semua Menu</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <Carousel className="w-full">
          <CarouselContent className="-ml-4 pb-2">
            {featuredProducts.map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="h-full group bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden flex flex-col justify-between hover:border-[#C2652A] transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                  {/* Product Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[#F6F0E8]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-[#FAF5EE]/90 backdrop-blur-sm text-[#C2652A] text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[#D8D0C8]">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-[#9A9088]">
                        <span>{product.category}</span>
                        <span>★ {product.rating}</span>
                      </div>
                      <h3 className="font-serif text-base font-bold text-[#3A302A] line-clamp-1 group-hover:text-[#C2652A] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#605850] line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F6F0E8] flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#3A302A]">
                        {formatRupiah(product.price)}
                      </span>
                      <button
                        onClick={() => {
                          addItem(product);
                          setIsDrawerOpen(true);
                        }}
                        className="p-2 rounded-lg bg-[#FAF5EE] hover:bg-[#C2652A] text-[#3A302A] hover:text-white border border-[#D8D0C8] hover:border-[#C2652A] transition-all flex items-center gap-1.5 text-xs font-medium active:scale-95"
                        aria-label={`Tambah ${product.name} ke keranjang`}
                      >
                        <Plus size={14} />
                        <span>Pesan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 px-1">
            <CarouselDots />
            <CarouselCounter />
          </div>
        </Carousel>
      </section>

      {/* Member & Digital Loyalty Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#3A302A] text-[#FAF5EE] p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none">
            <div className="w-full h-full font-serif text-[180px] font-bold flex items-center justify-center">
              GH
            </div>
          </div>

          <div className="max-w-xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FAF5EE] text-xs font-semibold uppercase tracking-wider">
              <Award size={14} className="text-[#C2652A]" />
              <span>Program Loyalitas GH ROVIQ</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Kumpulkan 10 Stamp, Nikmati 1 Kopi Pilihan Gratis.
            </h2>

            <p className="text-[#D8D0C8] text-sm sm:text-base leading-relaxed font-sans font-light">
              Daftar sebagai member dalam hitungan detik. Cukup scan QR code di kasir setiap kali bertransaksi untuk mengumpulkan stamp digital Anda.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Link
                href="/profil"
                className="px-6 py-3.5 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs uppercase tracking-wider font-semibold text-center transition-colors"
              >
                Lihat Loyalty Card Saya
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs uppercase tracking-wider font-semibold text-center transition-colors"
              >
                Daftar Akun Member
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

