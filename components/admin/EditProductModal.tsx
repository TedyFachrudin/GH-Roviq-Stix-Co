'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Product, CategoryType } from '@/types';
import {
  addProduct,
  updateProduct,
  isProductAvailable,
  setProductAvailability,
} from '@/lib/store';

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved?: (product: Product) => void;
}

export function EditProductModal({
  isOpen,
  product,
  onClose,
  onSaved,
}: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Kopi' as CategoryType,
    price: '' as string | number,
    description: '',
    image: '',
    badge: '',
    hasHot: false,
    hasCold: false,
    isAvailable: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name || '',
          category: product.category || 'Kopi',
          price: product.price ?? '',
          description: product.description || '',
          image: product.image || '',
          badge: product.badge || '',
          hasHot: Boolean(product.temperatureOptions?.includes('Panas')),
          hasCold: Boolean(product.temperatureOptions?.includes('Dingin')),
          isAvailable: isProductAvailable(product.id),
        });
      } else {
        setFormData({
          name: '',
          category: 'Kopi',
          price: '',
          description: '',
          image: '',
          badge: '',
          hasHot: false,
          hasCold: false,
          isAvailable: true,
        });
      }
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file maksimal 3MB. Silakan pilih foto lain.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setFormData((prev) => ({ ...prev, image: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price === '') {
      alert('Nama produk dan harga wajib diisi');
      return;
    }

    const tempOptions: ('Panas' | 'Dingin')[] = [];
    if (formData.hasHot) tempOptions.push('Panas');
    if (formData.hasCold) tempOptions.push('Dingin');

    const numPrice = Number(formData.price) || 0;

    if (product) {
      const updated = updateProduct(product.id, {
        name: formData.name.trim(),
        category: formData.category,
        price: numPrice,
        description: formData.description.trim(),
        image: formData.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800',
        badge: formData.badge.trim() || undefined,
        temperatureOptions: tempOptions.length > 0 ? tempOptions : undefined,
      });

      setProductAvailability(product.id, formData.isAvailable);

      if (updated && onSaved) onSaved(updated);
    } else {
      const newProduct: Product = {
        id: `gh-custom-${Date.now()}`,
        name: formData.name.trim(),
        category: formData.category,
        price: numPrice,
        description: formData.description.trim(),
        image: formData.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800',
        badge: formData.badge.trim() || undefined,
        temperatureOptions: tempOptions.length > 0 ? tempOptions : undefined,
        rating: 5.0,
      };
      addProduct(newProduct);
      setProductAvailability(newProduct.id, formData.isAvailable);
      if (onSaved) onSaved(newProduct);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FAF5EE] rounded-3xl border border-[#D8D0C8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header matching SVG */}
        <div className="px-6 py-5 bg-[#F6F0E8] border-b border-[#E8E2D9] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C2652A]">
              Katalog Form
            </span>
            <h3 className="font-serif text-xl font-bold text-[#3A302A]">
              {product ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#9A9088] hover:text-[#3A302A] hover:bg-white transition-all"
            aria-label="Tutup form"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Nama Produk * */}
          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-[#3A302A] block">
              Nama Produk *
            </label>
            <input
              type="text"
              required
              placeholder="Misal: Signature Aren Latte"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8D0C8] text-sm text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
            />
          </div>

          {/* Kategori & Harga */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-[#3A302A] block">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8D0C8] text-xs text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
              >
                <option value="Kopi">Kopi</option>
                <option value="Makanan">Makanan</option>
                <option value="Camilan">Camilan</option>
                <option value="Minuman">Minuman</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-[#3A302A] block">
                Harga (Rp) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="Misal: 25.000"
                value={
                  formData.price === ''
                    ? ''
                    : new Intl.NumberFormat('id-ID').format(Number(formData.price))
                }
                onChange={(e) => {
                  const rawDigits = e.target.value.replace(/\D/g, '');
                  setFormData({
                    ...formData,
                    price: rawDigits === '' ? '' : Number(rawDigits),
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8D0C8] text-sm text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
              />
            </div>
          </div>

          {/* Deskripsi Menu */}
          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-[#3A302A] block">
              Deskripsi Menu
            </label>
            <textarea
              rows={2}
              placeholder="Ceritakan cita rasa, bahan baku dan keistimewaan sajian..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8D0C8] text-xs text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
            />
          </div>

          {/* Foto Produk */}
          <div className="space-y-2">
            <label className="font-semibold uppercase tracking-wider text-[#3A302A] block">
              Foto Produk
            </label>

            {formData.image ? (
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#ECE6DC] border border-[#D8D0C8] group">
                <img
                  src={formData.image}
                  alt="Pratinjau foto produk"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label className="px-3.5 py-1.5 rounded-xl bg-white text-[#3A302A] font-semibold text-xs cursor-pointer hover:bg-[#FAF5EE] transition-colors shadow-sm flex items-center gap-1.5">
                    <Upload size={13} />
                    <span>Ganti Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#D8D0C8] hover:border-[#C2652A] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white hover:bg-[#FAF5EE] transition-all group">
                <div className="w-10 h-10 rounded-full bg-[#F6F0E8] group-hover:bg-[#F2ECE4] text-[#C2652A] flex items-center justify-center transition-colors">
                  <Upload size={18} />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-xs text-[#3A302A] group-hover:text-[#C2652A] transition-colors block">
                    Klik untuk upload foto dari perangkat
                  </span>
                  <span className="text-[10px] text-[#9A9088]">
                    Mendukung JPG, PNG, WEBP (Maks. 3MB)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Badge & Temperature options */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-[#3A302A] block">
                Badge (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Terlaris / Baru"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8D0C8] text-xs text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-[#3A302A] block">
                Opsi Suhu
              </label>
              <div className="flex items-center gap-3 pt-1.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#3A302A]">
                  <input
                    type="checkbox"
                    checked={formData.hasHot}
                    onChange={(e) => setFormData({ ...formData, hasHot: e.target.checked })}
                    className="accent-[#C2652A] w-3.5 h-3.5"
                  />
                  <span>Panas</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#3A302A]">
                  <input
                    type="checkbox"
                    checked={formData.hasCold}
                    onChange={(e) => setFormData({ ...formData, hasCold: e.target.checked })}
                    className="accent-[#C2652A] w-3.5 h-3.5"
                  />
                  <span>Dingin</span>
                </label>
              </div>
            </div>
          </div>

          {/* Status Ketersediaan Stok */}
          <div className="p-3 rounded-xl bg-[#F6F0E8] border border-[#E8E2D9] flex items-center justify-between">
            <div>
              <span className="font-semibold uppercase tracking-wider text-[#3A302A] text-[11px] block">
                Status Ketersediaan Stok
              </span>
              <span className="text-[10px] text-[#605850]">
                {formData.isAvailable ? 'Menu dapat dipesan pelanggan' : 'Menu ditandai habis (stok kosong)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isAvailable: !prev.isAvailable }))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all border ${
                formData.isAvailable
                  ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32] hover:bg-[#C8E6C9]'
                  : 'bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828] hover:bg-[#FFCDD2]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  formData.isAvailable ? 'bg-[#2E7D32]' : 'bg-[#C62828]'
                }`}
              />
              <span>{formData.isAvailable ? 'Tersedia' : 'Stok Habis'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#E8E2D9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#605850] hover:text-[#3A302A] hover:bg-white transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs font-semibold tracking-wide shadow-md transition-all active:scale-95"
            >
              {product ? 'Simpan Perubahan' : 'Tambahkan ke Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
