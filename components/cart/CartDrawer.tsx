'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    totalItems,
    subtotal,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    requestDeleteItem,
    resetDefaultCart,
  } = useCart();

  if (!isDrawerOpen) return null;

  const tax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + tax;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3A302A]/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF5EE] border-l border-[#D8D0C8] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-[#E8E2D9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={22} className="text-[#C2652A]" />
              <h2 className="font-serif text-xl font-bold text-[#3A302A]">
                Keranjang Belanja
              </h2>
              <span className="text-xs bg-[#F7ECE4] text-[#C2652A] px-2 py-0.5 rounded-full font-medium">
                {totalItems} item
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-[#F6F0E8] text-[#605850] hover:text-[#3A302A] transition-colors"
              aria-label="Tutup keranjang"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F6F0E8] flex items-center justify-center text-[#9A9088]">
                  <ShoppingBag size={28} />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-lg font-semibold text-[#3A302A]">
                    Keranjang Anda Kosong
                  </p>
                  <p className="text-xs text-[#605850] max-w-xs font-sans">
                    Cicipi pilihan kopi kurasi dan sajian artisan hangat kami.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 pt-2">
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-xs uppercase tracking-wider font-semibold text-[#C2652A] border-b border-[#C2652A] pb-0.5 hover:text-[#A95420] transition-colors"
                  >
                    Lihat Menu Sekarang
                  </button>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedOption}`}
                  className="bg-white border border-[#E8E2D9] rounded-xl p-3.5 flex gap-3.5 items-center shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#F6F0E8]">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      unoptimized={Boolean(item.product.image?.startsWith("data:"))}
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-serif text-sm font-bold text-[#3A302A] truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => requestDeleteItem(item)}
                        className="text-[#9A9088] hover:text-[#C0392B] p-1 transition-colors"
                        title="Hapus menu"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {item.selectedOption && (
                      <span className="inline-block text-[10px] text-[#605850] bg-[#F6F0E8] px-2 py-0.5 rounded mt-0.5 font-medium">
                        {item.selectedOption}
                      </span>
                    )}

                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-xs font-semibold text-[#C2652A]">
                        {formatRupiah(item.product.price * item.quantity)}
                      </span>

                      {/* Quantity Controller */}
                      <div className="flex items-center border border-[#D8D0C8] rounded-lg overflow-hidden bg-[#FAF5EE]">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1, item.selectedOption)}
                          className="px-2 py-1 text-[#605850] hover:bg-[#F2ECE4] hover:text-[#3A302A] transition-colors"
                          aria-label="Kurangi"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-[#3A302A] select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1, item.selectedOption)}
                          className="px-2 py-1 text-[#605850] hover:bg-[#F2ECE4] hover:text-[#3A302A] transition-colors"
                          aria-label="Tambah"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-6 bg-[#F6F0E8] border-t border-[#E8E2D9] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#605850]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#3A302A]">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#605850]">
                  <span>Pajak Restoran (10%)</span>
                  <span className="font-medium text-[#3A302A]">{formatRupiah(tax)}</span>
                </div>
                <div className="pt-2 border-t border-[#D8D0C8] flex justify-between text-sm font-bold text-[#3A302A]">
                  <span className="font-serif">Total Bayar</span>
                  <span className="text-[#C2652A] text-base font-sans">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-3.5 px-4 bg-[#C2652A] hover:bg-[#A95420] text-white rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all group"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

