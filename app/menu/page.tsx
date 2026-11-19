'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search, Plus, Coffee, Sparkles, Edit2 } from 'lucide-react';
import {
  getStoredProducts,
  isProductAvailable,
  syncCatalogWithCloud,
  saveStoredProducts,
  getCustomCategories,
  subscribeToStoreUpdates,
} from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { CategoryType, Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAdminAuth } from '@/lib/admin';
import { EditProductModal } from '@/components/admin/EditProductModal';

export default function MenuPage() {
  const { addItem, setIsDrawerOpen } = useCart();
  const { isAdmin } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, 'Panas' | 'Dingin'>>({});
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Dynamic categories from catalog products + custom categories
  const categories = useMemo(() => {
    const fromProducts = products.map((p) => p.category?.trim()).filter(Boolean);
    const fromCustom = getCustomCategories();
    const cats = Array.from(new Set([...fromProducts, ...fromCustom]));
    return ['Semua', ...cats];
  }, [products]);

  useEffect(() => {
    const sync = () => {
      const stored = getStoredProducts();
      setProducts(stored);
    };

    sync();

    // Cross-device cloud sync (guest, member, admin)
    syncCatalogWithCloud().then((cloudItems) => {
      if (cloudItems !== null && Array.isArray(cloudItems)) {
        setProducts(cloudItems);
      }
    });

    // Realtime Supabase updates across all devices
    const channel = supabase
      .channel('gh_catalog_menu')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: 'customer_name=eq.__CATALOG_SYNC__',
        },
        (payload) => {
          try {
            const raw = (payload.new as any)?.delivery_address;
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                saveStoredProducts(parsed, false);
                setProducts(parsed);
              }
            }
          } catch (e) {
            console.error('Realtime sync parse err:', e);
          }
        }
      )
      .subscribe();

    const unsubscribe = subscribeToStoreUpdates(sync);

    return () => {
      supabase.removeChannel(channel);
      unsubscribe();
    };
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleOptionSelect = (productId: string, opt: 'Panas' | 'Dingin') => {
    setSelectedOptions((prev) => ({ ...prev, [productId]: opt }));
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="py-8 sm:py-14 pb-28 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Header (Ferea Editorial Style) */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE4DA] text-[#010101] text-[11px] font-bold uppercase tracking-wider font-sans">
            <Sparkles size={12} className="text-[#7E4124]" />
            <span>Curated Artisan Menu</span>
          </div>
          <h1 className="font-display font-bold uppercase tracking-tighter text-[#010101] leading-[0.88] text-4xl sm:text-6xl md:text-7xl">
            OUR FRESH MENU
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7269] font-sans font-light leading-relaxed max-w-lg mx-auto">
            Dari racikan biji kopi arabika pilihan hingga kudapan hangat artisan, seluruhnya disiapkan segar dengan ketelitian dan bahan murni terbaik.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-5">
          {/* Search bar */}
          <div className="max-w-md mx-auto relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7269]"
            />
            <input
              type="text"
              placeholder="Cari kopi, makanan, atau minuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white/90 border border-[#D8D0C8] text-[#010101] placeholder-[#7A7269] text-xs sm:text-sm focus:outline-none focus:border-[#010101] focus:ring-1 focus:ring-[#010101] transition-all shadow-2xs font-sans"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? 'bg-[#010101] text-white shadow-sm'
                      : 'bg-white/70 hover:bg-white text-[#7A7269] hover:text-[#010101] border border-[#D8D0C8]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[28px] border border-[#D8D0C8] max-w-lg mx-auto p-8 sm:p-14 space-y-5 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#EAE4DA] flex items-center justify-center text-[#7E4124] mx-auto shadow-inner">
              <Coffee size={30} className="stroke-[1.75]" />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EAE4DA] text-[#010101] text-[10px] font-bold uppercase tracking-widest">
                <Sparkles size={11} className="text-[#7E4124]" />
                <span>Katalog Masih Kosong (0 Menu)</span>
              </span>
              <h3 className="font-display font-bold uppercase tracking-tight text-2xl text-[#010101]">
                Belum Ada Menu Terdaftar
              </h3>
              <p className="text-xs sm:text-sm text-[#7A7269] leading-relaxed max-w-md mx-auto font-light">
                Seluruh daftar menu saat ini masih kosong (0 item). Produk baru akan segera ditambahkan oleh admin melalui portal manajemen katalog.
              </p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[28px] border border-[#D8D0C8] max-w-md mx-auto p-8 space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#EAE4DA] flex items-center justify-center text-[#7A7269] mx-auto">
              <Coffee size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold uppercase tracking-tight text-xl text-[#010101]">
                Menu Tidak Ditemukan
              </h3>
              <p className="text-xs text-[#7A7269] font-light">
                Tidak ada menu yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
              className="text-xs font-bold text-[#7E4124] uppercase tracking-wider underline hover:text-[#010101] transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredProducts.map((product) => {
              const currentOption =
                selectedOptions[product.id] ||
                (product.temperatureOptions ? product.temperatureOptions[0] : undefined);
              const available = isProductAvailable(product.id, product);

              return (
                <div
                  key={product.id}
                  className={`group bg-white rounded-[26px] border border-[#D8D0C8] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-[#010101] ${
                    available ? '' : 'opacity-70 grayscale-[25%]'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAE4DA]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      unoptimized={Boolean(product.image?.startsWith('data:'))}
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {product.badge && available && (
                      <span className="absolute top-3 left-3 bg-[#F3EFEA]/95 backdrop-blur-sm text-[#7E4124] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#D8D0C8] shadow-sm">
                        {product.badge}
                      </span>
                    )}
                    {!available && (
                      <span className="absolute top-3 left-3 bg-[#010101]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                        Stok Habis
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#7A7269]">
                        <span className="uppercase tracking-wider font-semibold text-[10px]">
                          {product.category}
                        </span>
                        {product.rating && (
                          <span className="font-bold text-[#010101] text-xs">
                            ★ {product.rating}
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-xl uppercase tracking-tight text-[#010101] leading-snug group-hover:text-[#7E4124] transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-xs text-[#7A7269] leading-relaxed line-clamp-2 font-light">
                        {product.description}
                      </p>

                      {/* Temperature Option Pill (Panas / Dingin / Keduanya) */}
                      {product.temperatureOptions && product.temperatureOptions.length > 0 && (
                        <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                          {product.temperatureOptions.length > 1 ? (
                            <>
                              <span className="text-[10px] text-[#7A7269] font-medium mr-0.5">Suhu:</span>
                              {product.temperatureOptions.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleOptionSelect(product.id, opt)}
                                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all active:scale-95 ${
                                    currentOption === opt
                                      ? 'bg-[#7E4124] text-white shadow-2xs font-semibold'
                                      : 'bg-[#F3EFEA] text-[#7A7269] hover:text-[#010101] border border-[#D8D0C8]'
                                  }`}
                                >
                                  {opt === 'Panas' ? '🔥 Panas' : '❄️ Dingin'}
                                </button>
                              ))}
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#F3EFEA] border border-[#D8D0C8] text-[#7E4124]">
                              {product.temperatureOptions[0] === 'Panas' ? '🔥 Panas Saja' : '❄️ Dingin (Ice)'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price & Add to Cart button */}
                    <div className="pt-3 border-t border-[#EAE4DA] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#7A7269] uppercase font-medium block">
                          Harga
                        </span>
                        <span className="font-display font-bold text-xl text-[#010101]">
                          {formatRupiah(product.price)}
                        </span>
                      </div>

                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsEditModalOpen(true);
                          }}
                          className="py-2 px-3.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-all bg-[#F3EFEA] hover:bg-[#010101] text-[#010101] hover:text-white border border-[#D8D0C8] active:scale-95"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit2 size={13} />
                          <span>Edit Stok</span>
                        </button>
                      ) : (
                        <button
                          disabled={!available}
                          onClick={() => {
                            if (!available) return;
                            addItem(product, currentOption);
                            setIsDrawerOpen(true);
                          }}
                          className={`py-2 px-4 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                            available
                              ? 'bg-[#010101] hover:bg-[#7E4124] text-white'
                              : 'bg-[#D8D0C8] text-[#7A7269] cursor-not-allowed'
                          }`}
                          aria-label={`Pesan ${product.name}`}
                        >
                          <Plus size={14} className="stroke-[2.5]" />
                          <span>{available ? 'Tambah' : 'Habis'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Edit Product & Stock Modal for Admin */}
      <EditProductModal
        isOpen={isEditModalOpen}
        product={editingProduct}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
      />
    </div>
  );
}
