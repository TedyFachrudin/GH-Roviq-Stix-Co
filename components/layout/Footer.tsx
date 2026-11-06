import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F6F0E8] border-t border-[#E8E2D9] text-[#3A302A] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <BrandLogo size={36} className="w-9 h-9" />
              <span className="font-serif text-2xl font-bold tracking-tight text-[#3A302A]">
                GH ROVIQ
              </span>
            </div>
            <p className="text-[#605850] text-sm leading-relaxed max-w-md font-sans">
              Ruang teduh untuk merayakan seduhan kopi kurasi, sajian hangat artisan, dan percakapan bermakna. Menggabungkan kesederhanaan minimalis dengan kehangatan cita rasa.
            </p>
            <div className="pt-2 text-xs text-[#9A9088] tracking-wider uppercase font-medium">
              Bandung, Jawa Barat • Indonesia
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#3A302A] tracking-wide">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm text-[#605850]">
              <li>
                <Link href="/" className="hover:text-[#C2652A] transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#C2652A] transition-colors">
                  Daftar Menu
                </Link>
              </li>
              <li>
                <Link href="/profil" className="hover:text-[#C2652A] transition-colors">
                  Member & Loyalty Stamp
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[#C2652A] transition-colors">
                  Pesanan Saya
                </Link>
              </li>

            </ul>
          </div>

          {/* Jam Operasional */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#3A302A] tracking-wide">
              Jam Seduh
            </h4>
            <div className="text-sm text-[#605850] space-y-1 font-sans">
              <p>Senin – Jumat</p>
              <p className="font-medium text-[#3A302A]">08:00 – 22:00 WIB</p>
              <div className="pt-2"></div>
              <p>Sabtu – Minggu</p>
              <p className="font-medium text-[#3A302A]">07:00 – 23:00 WIB</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E8E2D9] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9A9088]">
          <p>© {new Date().getFullYear()} GH ROVIQ Coffee & Kitchen. Seluruh Hak Cipta Dilindungi.</p>
          <p className="mt-2 sm:mt-0 italic font-serif">Minimalist Artisan Experience</p>
        </div>
      </div>
    </footer>
  );
};

