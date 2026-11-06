'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Coffee, Clock, Receipt, Award } from 'lucide-react';
import { OrderDetails } from '@/types';

interface OrderSuccessModalProps {
  order: OrderDetails | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3A302A]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#FAF5EE] border border-[#D8D0C8] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-dropdown space-y-6 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Success check badge */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#F7ECE4] text-[#C2652A] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={36} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#3A302A]">
              Pesanan Berhasil Diterima!
            </h3>
            <p className="text-sm text-[#605850] mt-1 font-sans">
              Barista kami sedang menyiapkan pesanan kurasi terbaik untuk Anda.
            </p>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-[#E8E2D9] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F6F0E8]">
            <div>
              <span className="text-[11px] text-[#9A9088] uppercase tracking-wider font-semibold">
                Nomor Antrean
              </span>
              <div className="font-serif text-2xl font-bold text-[#C2652A]">
                {order.queueNumber}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#9A9088] uppercase tracking-wider font-semibold">
                ID Pesanan
              </span>
              <div className="font-mono text-sm font-semibold text-[#3A302A]">
                {order.id}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[#9A9088] flex items-center gap-1">
                <Coffee size={13} /> Jenis Layanan
              </span>
              <p className="font-semibold text-[#3A302A]">
                {order.orderType} {order.tableNumber ? `(Meja ${order.tableNumber})` : ''}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[#9A9088] flex items-center gap-1">
                <Clock size={13} /> Estimasi Seduh
              </span>
              <p className="font-semibold text-[#3A302A]">10 - 15 Menit</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#9A9088] flex items-center gap-1">
                <Receipt size={13} /> Pembayaran
              </span>
              <p className="font-semibold text-[#3A302A]">{order.paymentMethod}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#9A9088]">Total Pembayaran</span>
              <p className="font-bold text-[#C2652A] text-sm">
                {formatRupiah(order.total)}
              </p>
            </div>
          </div>

          {/* Loyalty Stamp Reward Announcement */}
          <div className="bg-[#FAF5EE] rounded-lg p-3 border border-[#E8E2D9] flex items-center gap-3 text-xs text-[#3A302A]">
            <Award size={20} className="text-[#C2652A] flex-shrink-0" />
            <div>
              <span className="font-bold text-[#C2652A]">+1 Stamp Loyalty</span> berhasil ditambahkan ke kartu member digital Anda!
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/profil"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-[#D8D0C8] bg-transparent text-[#3A302A] text-xs uppercase tracking-wider font-semibold text-center hover:bg-[#F6F0E8] transition-colors"
          >
            Cek Kartu Stamp
          </Link>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs uppercase tracking-wider font-semibold text-center shadow-sm transition-colors"
          >
            Pesan Menu Lain
          </button>
        </div>
      </div>
    </div>
  );
};

