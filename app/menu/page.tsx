'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, Plus, Coffee, Sparkles } from 'lucide-react';
import { getStoredProducts, isProductAvailable } from '@/lib/store';
import { CategoryType, Product } from '@/types';
import { useCart } from '@/context/CartContext';

const CATEGORIES: CategoryType[] = ['Semua', 'Kopi', 'Makanan', 'Camilan', 'Minuman'];

export default function MenuPage() {
  const { addItem, setIsDrawerOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, 'Panas' | 'Dingin'>>({});

  React.useEffect(() => {
    const sync = () => {
      const stored = getStoredProducts();
      setProducts(stored);
    };

    sync();
    window.addEventListener('gh_products_updated', sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener('gh_products_updated', sync);
      window.removeEventListener('storage', sync);
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
    <div className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* Header matching Menu.svg */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F0E8] border border-[#E8E2D9] text-[#C2652A] text-xs font-semibold tracking-widest uppercase">
            <Sparkles size={13} />
            <span>Kurasi Cita Rasa</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#3A302A] tracking-tight">
            Menu GH ROVIQ
          </h1>
          <p className="text-sm sm:text-base text-[#605850] font-sans font-light">
            Dari racikan biji kopi arabika pilihan hingga kudapan hangat artisan, seluruhnya disiapkan dengan bahan murni terbaik.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-6">
          
          {/* Search bar */}
          <div className="max-w-md mx-auto relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9088]"
            />
            <input
              type="text"
              placeholder="Cari kopi, makanan, atau minuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#D8D0C8] text-[#3A302A] placeholder-[#9A9088] text-sm focus:outline-none focus:border-[#C2652A] transition-colors shadow-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#C2652A] text-white shadow-sm font-semibold'
                      : 'bg-[#F6F0E8] text-[#605850] hover:text-[#3A302A] hover:bg-[#F2ECE4] border border-[#E8E2D9]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid matching Menu.svg */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E2D9] max-w-lg mx-auto p-8 sm:p-14 space-y-5 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F6F0E8] border border-[#E8E2D9] flex items-center justify-center text-[#C2652A] mx-auto shadow-inner">
              <Coffee size={32} className="stroke-[1.75]" />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F6F0E8] text-[#C2652A] text-[10px] font-bold uppercase tracking-widest border border-[#E8E2D9]">
                <Sparkles size={11} />
                <span>Katalog Masih Kosong (0 Menu)</span>
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3A302A]">
                Belum Ada Menu Terdaftar
              </h3>
              <p className="text-xs sm:text-sm text-[#605850] leading-relaxed max-w-md mx-auto font-light">
                Seluruh daftar menu saat ini masih kosong (0 item). Produk baru akan segera ditambahkan oleh admin melalui portal manajemen katalog.
              </p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E2D9] max-w-md mx-auto p-8 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F6F0E8] flex items-center justify-center text-[#9A9088] mx-auto">
              <Coffee size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#3A302A]">
                Menu Tidak Ditemukan
              </h3>
              <p className="text-xs text-[#605850]">
                Tidak ada menu yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
              className="text-xs font-semibold text-[#C2652A] uppercase tracking-wider underline hover:text-[#A95420]"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const currentOption =
                selectedOptions[product.id] ||
                (product.temperatureOptions ? product.temperatureOptions[0] : undefined);
              const available = isProductAvailable(product.id);

              return (
                <div
                  key={product.id}
                  className={`group bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden flex flex-col justify-between transition-all hover:shadow-card ${
                    available ? 'hover:border-[#C2652A]' : 'opacity-70 grayscale-[20%]'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F6F0E8]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      unoptimized={Boolean(product.image?.startsWith("data:"))}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {product.badge && available && (
                      <span className="absolute top-3 left-3 bg-[#FAF5EE]/95 backdrop-blur-sm text-[#C2652A] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#D8D0C8] shadow-sm">
                        {product.badge}
                      </span>
                    )}
                    {!available && (
                      <span className="absolute top-3 left-3 bg-[#3A302A]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                        Stok Habis
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#9A9088]">
                        <span className="uppercase tracking-wider font-medium text-[10px]">
                          {product.category}
                        </span>
                        {product.rating && (
                          <span className="font-semibold text-[#3A302A]">★ {product.rating}</span>
                        )}
                      </div>

                      <h3 className="font-serif text-lg font-bold text-[#3A302A] leading-snug group-hover:text-[#C2652A] transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-xs text-[#605850] leading-relaxed line-clamp-2">
                        {product.description}
                      </p>

                      {/* Temperature Option Pill (Panas / Dingin) if available */}
                      {product.temperatureOptions && product.temperatureOptions.length > 1 && (
                        <div className="pt-2 flex items-center gap-1.5">
                          {product.temperatureOptions.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOptionSelect(product.id, opt)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                currentOption === opt
                                  ? 'bg-[#3A302A] text-white shadow-xs'
                                  : 'bg-[#F6F0E8] text-[#605850] hover:text-[#3A302A]'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price & Add to Cart button */}
                    <div className="pt-3 border-t border-[#F6F0E8] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#9A9088] uppercase block">Harga</span>
                        <span className="font-bold text-base text-[#3A302A]">
                          {formatRupiah(product.price)}
                        </span>
                      </div>

                      <button
                        disabled={!available}
                        onClick={() => {
                          if (!available) return;
                          addItem(product, currentOption);
                          setIsDrawerOpen(true);
                        }}
                        className={`py-2 px-3.5 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-sm transition-all ${
                          available
                            ? 'bg-[#C2652A] hover:bg-[#A95420] text-white active:scale-95'
                            : 'bg-[#D8D0C8] text-[#9A9088] cursor-not-allowed'
                        }`}
                        aria-label={`Pesan ${product.name}`}
                      >
                        <Plus size={14} className="stroke-[2.5]" />
                        <span>{available ? 'Tambah' : 'Habis'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

