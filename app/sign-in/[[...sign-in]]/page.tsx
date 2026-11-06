'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AppSignInForm } from '@/lib/auth';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function SignInPage() {
  const [activeTab, setActiveTab] = useState<'Member' | 'Tamu'>('Member');

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand header matching Login Masuk.svg */}
        <div className="text-center space-y-3">
          <BrandLogo size={64} className="w-16 h-16 mx-auto shadow-sm" priority />
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#3A302A] block">
              GH ROVIQ
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#9A9088] font-sans">
              Artisan Coffee & Kitchen
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#3A302A] pt-1">
            Masuk ke Akun
          </h2>
        </div>

        {/* Tab switcher: Tamu vs Member matching SVG */}
        <div className="flex bg-[#F2ECE4] p-1 rounded-xl border border-[#D8D0C8] max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('Member')}
            className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'Member'
                ? 'bg-[#C2652A] text-white shadow-xs'
                : 'text-[#605850] hover:text-[#3A302A]'
            }`}
          >
            Member
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Tamu')}
            className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'Tamu'
                ? 'bg-[#C2652A] text-white shadow-xs'
                : 'text-[#605850] hover:text-[#3A302A]'
            }`}
          >
            Tamu
          </button>
        </div>

        {/* Conditional rendering based on active tab */}
        {activeTab === 'Tamu' ? (
          <div className="bg-white border border-[#D8D0C8] rounded-2xl p-6 sm:p-8 space-y-5 text-center shadow-subtle animate-in fade-in duration-200">
            <h3 className="font-serif text-lg font-bold text-[#3A302A]">
              Lanjut Sebagai Tamu
            </h3>
            <p className="text-xs text-[#605850] leading-relaxed">
              Anda dapat langsung memesan menu favorit kami tanpa login. Namun, riwayat pesanan dan stamp loyalty digital tidak akan tersimpan.
            </p>
            <div className="pt-2 space-y-3">
              <Link
                href="/menu"
                className="w-full py-3.5 px-4 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>Mulai Pesan Sekarang</span>
                <ArrowRight size={15} />
              </Link>
              <button
                type="button"
                onClick={() => setActiveTab('Member')}
                className="text-xs text-[#C2652A] underline font-medium hover:text-[#A95420]"
              >
                Atau masuk sebagai member untuk dapat stamp
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center animate-in fade-in duration-200">
            <AppSignInForm />
          </div>
        )}

      </div>
    </div>
  );
}
