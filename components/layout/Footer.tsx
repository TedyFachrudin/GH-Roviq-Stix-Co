import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ArrowUpRight, Instagram, MapPin, Clock, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#010101] text-[#F3EFEA] mt-24 border-t border-white/10 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#7E4124]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1344px] mx-auto px-5 nav-desktop:px-[30px] pt-16 sm:pt-20 pb-28 md:pb-16 relative z-10">
        
        {/* Giant Ferea-Style Header Banner */}
        <div className="border-b border-white/10 pb-12 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] font-semibold tracking-widest text-[#DD9F57] uppercase font-sans">
              [ SPECIALTY COFFEE & ARTISAN KITCHEN ]
            </span>
            <h2 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl tracking-tighter uppercase text-white mt-2 leading-[0.95]">
              GH ROVIQ <span className="text-[#DD9F57]">STIX & CO.</span>
            </h2>
          </div>
          <p className="text-sm text-[#A89F95] max-w-sm leading-relaxed font-sans font-light">
            Ruang teduh untuk merayakan seduhan kopi kurasi, sajian hangat bersahaja, dan percakapan bermakna di setiap waktu.
          </p>
        </div>

        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo size={36} className="w-9 h-9" />
              <span className="font-display font-bold text-xl tracking-wide text-white uppercase">
                GH ROVIQ
              </span>
            </div>
            <p className="text-[#A89F95] text-xs leading-relaxed font-sans font-light">
              Menghadirkan keaslian biji arabika Nusantara dan dapur artisan tanpa kompromi.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#DD9F57] font-medium pt-1">
              <MapPin size={13} />
              <span>Bandung, Jawa Barat • Indonesia</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm tracking-widest text-white uppercase">
              Eksplorasi
            </h4>
            <ul className="space-y-2 text-xs text-[#A89F95] font-sans">
              <li>
                <Link href="/" className="hover:text-[#DD9F57] transition-colors flex items-center gap-1 group">
                  <span>Beranda</span>
                  <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#DD9F57] transition-colors flex items-center gap-1 group">
                  <span>Daftar Menu</span>
                  <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/profil" className="hover:text-[#DD9F57] transition-colors flex items-center gap-1 group">
                  <span>Member & Stamp Loyalitas</span>
                  <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[#DD9F57] transition-colors flex items-center gap-1 group">
                  <span>Pesanan & Pembayaran</span>
                  <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Jam Operasional */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm tracking-widest text-white uppercase flex items-center gap-1.5">
              <Clock size={13} className="text-[#DD9F57]" />
              <span>Jam Seduh</span>
            </h4>
            <div className="text-xs text-[#A89F95] space-y-1.5 font-sans">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span>Senin – Jumat</span>
                <span className="font-semibold text-white">08:00 – 22:00</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span>Sabtu – Minggu</span>
                <span className="font-semibold text-[#DD9F57]">07:00 – 23:00</span>
              </div>
            </div>
          </div>

          {/* Socials & Contact */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm tracking-widest text-white uppercase">
              Terhubung
            </h4>
            <p className="text-xs text-[#A89F95] leading-relaxed">
              Ikuti cerita pemanggangan biji kopi, rilis menu musiman, dan agenda seduh terbaru.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#DD9F57] hover:text-[#010101] text-white flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram size={14} />
              </a>
              <Link
                href="/menu"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-[#010101] text-xs font-semibold tracking-wide transition-all"
              >
                <span>Pesan Sekarang</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="border-t border-white/10 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A7269]">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>© {new Date().getFullYear()} GH ROVIQ Coffee & Kitchen. Seluruh Hak Cipta Dilindungi.</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] font-bold text-[#DD9F57] uppercase tracking-wider">
              18+ Dewasa — Produk Stix/Rokok
            </span>
          </div>
          <p className="mt-2 sm:mt-0 font-display uppercase tracking-widest text-[11px] text-[#A89F95]">
            Artisan Coffee • Crafted Daily
          </p>
        </div>
      </div>
    </footer>
  );
};

