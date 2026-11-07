'use client';

import React from 'react';
import Image from 'next/image';
import { Coffee, Gift, QrCode, Sparkles, Check } from 'lucide-react';
import { MemberProfile } from '@/types';

interface LoyaltyCardProps {
  member: MemberProfile;
}

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({ member }) => {
  const totalSlots = 10;
  const stamps = member.stamps;

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Physical-style Digital Membership Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3A302A] via-[#2B231E] to-[#201A16] text-[#FAF5EE] p-6 sm:p-8 shadow-2xl border border-[#4E423A]">
        
        {/* Subtle decorative watermark using official logo */}
        <div className="absolute right-2 -bottom-8 w-52 h-52 opacity-[0.07] select-none pointer-events-none">
          <Image src="/logo-gh-roviq.svg" alt="" width={208} height={208} className="w-full h-full object-contain invert" />
        </div>

        {/* Card Header */}
        <div className="flex items-start justify-between relative z-10 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 p-1 flex items-center justify-center border border-white/15">
                <Image src="/logo-gh-roviq.svg" alt="GH ROVIQ" width={26} height={26} className="w-full h-full object-contain invert brightness-150" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#FAF5EE]">
                GH ROVIQ
              </span>
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#C2652A] text-white font-semibold">
                Member Digital
              </span>
            </div>
            <p className="text-xs text-[#D8D0C8] font-sans mt-0.5 tracking-wide">
              Kartu Loyalitas Digital GH ROVIQ
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#9A9088] uppercase tracking-wider block">
              Poin Aktif
            </span>
            <span className="text-lg font-bold text-[#C2652A] flex items-center gap-1 justify-end">
              <Sparkles size={14} />
              {member.points} pts
            </span>
          </div>
        </div>

        {/* Member Identity & QR barcode */}
        <div className="py-5 flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs text-[#9A9088] uppercase tracking-wider">Nama Anggota</p>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#FAF5EE] tracking-wide mt-0.5">
              {member.name}
            </h3>
            <p className="font-mono text-xs text-[#D8D0C8] mt-0.5">
              {member.id.startsWith('ID:') ? member.id : `ID: ${member.id}`}
            </p>
          </div>

          {/* QR Code trigger/visual */}
          <div className="bg-white p-2 rounded-xl flex flex-col items-center shadow-md">
            <QrCode size={48} className="text-[#3A302A]" />
            <span className="text-[8px] font-mono text-[#3A302A] font-semibold mt-1 uppercase">
              Scan Kasir
            </span>
          </div>
        </div>

        {/* 10-Stamp Grid matching SVG */}
        <div className="pt-4 relative z-10">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-[#D8D0C8] font-medium">
              Koleksi Stamp Seduh ({stamps}/{totalSlots})
            </span>
            <span className="text-[#C2652A] text-[11px] font-semibold">
              {totalSlots - stamps === 0
                ? 'Siap Klaim Reward!'
                : `${totalSlots - stamps} stamp lagi menuju reward`}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
            {Array.from({ length: totalSlots }).map((_, idx) => {
              const stampNumber = idx + 1;
              const isChecked = stampNumber <= stamps;
              const isRewardSlot = stampNumber === totalSlots;

              return (
                <div
                  key={stampNumber}
                  className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
                    isChecked
                      ? 'bg-[#C2652A] text-white shadow-md border border-[#E07E44]'
                      : isRewardSlot
                      ? 'bg-white/10 border-2 border-dashed border-[#C2652A] text-[#C2652A]'
                      : 'bg-white/5 border border-white/10 text-white/30'
                  }`}
                >
                  {isChecked ? (
                    <div className="flex flex-col items-center">
                      <Coffee size={18} className="stroke-[2.2]" />
                      <span className="text-[8px] font-bold mt-0.5">✓</span>
                    </div>
                  ) : isRewardSlot ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <Gift size={20} className="text-[#C2652A]" />
                      <span className="text-[8px] font-bold uppercase mt-0.5 text-[#C2652A]">
                        FREE
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-medium">{stampNumber}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-[#D8D0C8] leading-relaxed flex items-center gap-2">
            <Gift size={16} className="text-[#C2652A] flex-shrink-0" />
            <span>
              Kumpulkan 10 stamp untuk mendapatkan <strong>1 Kopi Kurasi Gratis</strong>{' '}
              pada kunjungan berikutnya.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

