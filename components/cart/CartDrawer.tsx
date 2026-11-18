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
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#010101]/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F3EFEA] border-l border-[#D8D0C8] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-[#EAE4DA] flex items-center justify-between bg-white/50 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={20} className="text-[#7E4124]" />
              <h2 className="font-display font-bold text-xl uppercase tracking-tight text-[#010101]">
                Keranjang Belanja
              </h2>
              <span className="text-[11px] bg-[#EAE4DA] text-[#010101] px-2.5 py-0.5 rounded-full font-bold">
                {totalItems} item
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-[#EAE4DA] text-[#7A7269] hover:text-[#010101] transition-colors"
              aria-label="Tutup keranjang"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EAE4DA] flex items-center justify-center text-[#7A7269]">
                  <ShoppingBag size={26} />
                </div>
                <div className="space-y-1">
                  <p className="font-display font-bold text-xl uppercase tracking-tight text-[#010101]">
                    Keranjang Kosong
                  </p>
                  <p className="text-xs text-[#7A7269] max-w-xs font-light">
                    Cicipi pilihan kopi kurasi dan sajian artisan hangat kami.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-xs uppercase tracking-wider font-bold text-[#7E4124] border-b border-[#7E4124] pb-0.5 hover:text-[#010101] transition-colors"
                  >
                    Lihat Menu Sekarang →
                  </button>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedOption}`}
                  className="bg-white border border-[#D8D0C8] rounded-[20px] p-3.5 flex gap-3.5 items-center shadow-2xs"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#EAE4DA]">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      unoptimized={Boolean(item.product.image?.startsWith('data:'))}
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-display font-bold text-base uppercase tracking-tight text-[#010101] truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => requestDeleteItem(item)}
                        className="text-[#7A7269] hover:text-[#C0392B] p-1 transition-colors"
                        title="Hapus menu"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {item.selectedOption && (
                      <span className="inline-block text-[10px] text-[#7A7269] bg-[#F3EFEA] border border-[#D8D0C8] px-2 py-0.5 rounded-full mt-0.5 font-medium">
                        {item.selectedOption}
                      </span>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-display font-bold text-sm text-[#7E4124]">
                        {formatRupiah(item.product.price * item.quantity)}
                      </span>

                      {/* Quantity Controller */}
                      <div className="flex items-center border border-[#D8D0C8] rounded-full overflow-hidden bg-[#F3EFEA]">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1, item.selectedOption)}
                          className="px-2.5 py-1 text-[#7A7269] hover:bg-[#EAE4DA] hover:text-[#010101] transition-colors"
                          aria-label="Kurangi"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#010101] select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1, item.selectedOption)}
                          className="px-2.5 py-1 text-[#7A7269] hover:bg-[#EAE4DA] hover:text-[#010101] transition-colors"
                          aria-label="Tambah"
                        >
                          <Plus size={11} />
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
            <div className="p-6 bg-white/80 backdrop-blur-md border-t border-[#EAE4DA] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#7A7269]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#010101]">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#7A7269]">
                  <span>Pajak Restoran (10%)</span>
                  <span className="font-semibold text-[#010101]">{formatRupiah(tax)}</span>
                </div>
                <div className="pt-2 border-t border-[#EAE4DA] flex justify-between items-center text-sm font-bold text-[#010101]">
                  <span className="font-display uppercase tracking-tight text-base">Total Bayar</span>
                  <span className="font-display font-bold text-xl text-[#7E4124]">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-3.5 px-4 bg-[#010101] hover:bg-[#7E4124] text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all duration-200 active:scale-95 group"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
