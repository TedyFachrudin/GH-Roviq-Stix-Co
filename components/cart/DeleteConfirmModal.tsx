'use client';

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const DeleteConfirmModal: React.FC = () => {
  const { deleteConfirmItem, cancelDeleteItem, confirmDeleteItem } = useCart();

  if (!deleteConfirmItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3A302A]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#FAF5EE] border border-[#D8D0C8] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-dropdown text-center space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Warning Icon Badge matching SVG */}
        <div className="w-16 h-16 rounded-full bg-[#FCE4E0] text-[#C0392B] flex items-center justify-center mx-auto">
          <Trash2 size={28} className="stroke-[2.2]" />
        </div>

        <div className="space-y-2">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3A302A]">
            Hapus Dari Keranjang?
          </h3>
          <p className="text-sm text-[#605850] font-sans leading-relaxed">
            Apakah Anda yakin ingin menghapus{' '}
            <span className="font-semibold text-[#3A302A]">
              &ldquo;{deleteConfirmItem.product.name}
              {deleteConfirmItem.selectedOption ? ` (${deleteConfirmItem.selectedOption})` : ''}&rdquo;
            </span>{' '}
            dari daftar pesanan?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={cancelDeleteItem}
            className="flex-1 py-3 px-4 rounded-xl border border-[#D8D0C8] bg-transparent text-[#3A302A] text-sm font-medium hover:bg-[#F6F0E8] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={confirmDeleteItem}
            className="flex-1 py-3 px-4 rounded-xl bg-[#C0392B] text-white text-sm font-medium hover:bg-[#A93226] shadow-sm transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

