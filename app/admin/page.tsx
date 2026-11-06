'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  Coffee,
  Sparkles,
  X,
  Filter,
  Check,
  Upload,
} from 'lucide-react';
import { Product, CategoryType } from '@/types';
import {
  getStoredProducts,
  saveStoredProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  isProductAvailable,
  setProductAvailability,
  clearStoredProducts,
} from '@/lib/store';
import { useAdminAuth } from '@/lib/admin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { RevenueModal } from '@/components/admin/RevenueModal';

const CATEGORIES: CategoryType[] = ['Semua', 'Kopi', 'Makanan', 'Camilan', 'Minuman'];

export default function AdminKatalogPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdminAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'Semua' | 'Tersedia' | 'Habis'>('Semua');
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Kopi' as CategoryType,
    price: '' as string | number,
    description: '',
    image: '',
    badge: '',
    hasHot: false,
    hasCold: false,
    rating: 5.0,
  });

  // Protect Admin route
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isLoading, isAdmin, router]);

  // Load products
  const refreshProducts = () => {
    setProducts(getStoredProducts());
  };

  useEffect(() => {
    refreshProducts();
    window.addEventListener('gh_products_updated', refreshProducts);
    window.addEventListener('storage', refreshProducts);

    return () => {
      window.removeEventListener('gh_products_updated', refreshProducts);
      window.removeEventListener('storage', refreshProducts);
    };
  }, []);

  // Format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Stock calculations
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => isProductAvailable(p.id)).length;
  const outOfStockProducts = totalProducts - inStockProducts;

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const available = isProductAvailable(p.id);
      const matchStock =
        stockFilter === 'Semua' ||
        (stockFilter === 'Tersedia' && available) ||
        (stockFilter === 'Habis' && !available);

      return matchCat && matchQuery && matchStock;
    });
  }, [products, selectedCategory, searchQuery, stockFilter]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Kopi',
      price: '',
      description: '',
      image: '',
      badge: '',
      hasHot: false,
      hasCold: false,
      rating: 5.0,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: product.image,
      badge: product.badge || '',
      hasHot: product.temperatureOptions?.includes('Panas') ?? false,
      hasCold: product.temperatureOptions?.includes('Dingin') ?? false,
      rating: product.rating || 5.0,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const tempOptions: ('Panas' | 'Dingin')[] = [];
    if (formData.hasHot) tempOptions.push('Panas');
    if (formData.hasCold) tempOptions.push('Dingin');

    const productPrice = Number(formData.price) || 0;
    const productImage = formData.image.trim() || '/logo-gh-roviq.svg';

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        category: formData.category,
        price: productPrice,
        description: formData.description,
        image: productImage,
        badge: formData.badge || undefined,
        temperatureOptions: tempOptions.length > 0 ? tempOptions : undefined,
        rating: Number(formData.rating) || 5.0,
      });
    } else {
      const newProduct: Product = {
        id: `gh-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        category: formData.category,
        price: productPrice,
        description: formData.description,
        image: productImage,
        badge: formData.badge || undefined,
        temperatureOptions: tempOptions.length > 0 ? tempOptions : undefined,
        rating: Number(formData.rating) || 5.0,
      };
      addProduct(newProduct);
    }
        image: formData.image,
        badge: formData.badge || undefined,
        temperatureOptions: tempOptions.length > 0 ? tempOptions : undefined,
        rating: Number(formData.rating) || 4.9,
      };
      addProduct(newProduct);
    }

    setIsModalOpen(false);
    refreshProducts();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus menu "${name}"?`)) {
      deleteProduct(id);
      refreshProducts();
    }
  };

  const handleClearAll = () => {
    if (confirm('Yakin ingin mengosongkan semua menu di katalog (reset ke 0 produk)?')) {
      clearStoredProducts();
      refreshProducts();
    }
  };

  const handleToggleStock = (id: string) => {
    const current = isProductAvailable(id);
    setProductAvailability(id, !current);
    refreshProducts();
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-2 border-[#C2652A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#9A9088] uppercase tracking-widest font-semibold">
            Memuat Portal Admin...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5EE] flex flex-col lg:flex-row">
      
      {/* Sidebar matching SVG layout */}
      <AdminSidebar onOpenRevenueModal={() => setIsRevenueModalOpen(true)} />

      {/* Main Content Area (width: 992px, background: #FAF5EE) */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl space-y-8">
        
        {/* Top Header matching SVG (y: 25 to 136) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F6F0E8] border border-[#E8E2D9] text-[#C2652A] text-[11px] font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#C2652A]" />
              <span>Tambah Menu</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A302A] tracking-tight">
              Katalog & Stok Produk
            </h1>
            <p className="text-xs sm:text-sm text-[#605850] font-sans font-light">
              Kelola daftar menu kopi, sajian dapur, serta status ketersediaan stok secara terpusat.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-[#9A9088] uppercase tracking-wider block">Tanggal Hari Ini</span>
            <span className="font-mono text-xs font-semibold text-[#3A302A]">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Top KPI Box matching SVG (x:320, y:192, w:928, h:112, fill: #F6F0E8) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6 sm:gap-10">
            
            {/* Stat 1: Total Produk */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9088] block">
                Total Produk
              </span>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3A302A]">
                {totalProducts}
              </div>
              <span className="text-[10px] text-[#605850]">
                Terdaftar di katalog
              </span>
            </div>

            <div className="h-10 w-px bg-[#E8E2D9]" />

            {/* Stat 2: Stok Tersedia */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] block">
                Stok Tersedia
              </span>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2E7D32]">
                {inStockProducts}
              </div>
              <span className="text-[10px] text-[#605850]">
                Dapat dipesan pelanggan
              </span>
            </div>

            <div className="h-10 w-px bg-[#E8E2D9]" />

            {/* Stat 3: Stok Habis */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2652A] block">
                Stok Habis
              </span>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#C2652A]">
                {outOfStockProducts}
              </div>
              <span className="text-[10px] text-[#605850]">
                Perlu restock
              </span>
            </div>

          </div>

          {/* Action Button matching SVG (x:609, y:223, w:177, h:52, fill: #C2652A) */}
          <div className="flex items-center gap-3">
            {totalProducts > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-3 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold tracking-wide flex items-center gap-2 shadow-xs transition-all"
                title="Kosongkan semua produk dari katalog (reset ke 0)"
              >
                <Trash2 size={15} />
                <span>Kosongkan Menu (0)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-6 py-3.5 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs font-bold tracking-wider uppercase flex items-center gap-2.5 shadow-md transition-all active:scale-95"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar matching SVG (y:336, w:928, h:56) */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Category Filter Pills (w:447, h:56) */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] overflow-x-auto scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#FAF5EE] text-[#C2652A] shadow-xs'
                        : 'text-[#605850] hover:text-[#3A302A]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input & Stock Filter matching SVG (w:288 & w:164) */}
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9088]" />
                <input
                  type="text"
                  placeholder="Cari nama produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#D8D0C8] text-xs text-[#3A302A] placeholder-[#9A9088] focus:outline-none focus:border-[#C2652A] transition-all"
                />
              </div>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl bg-white border border-[#D8D0C8] text-xs text-[#3A302A] font-medium focus:outline-none focus:border-[#C2652A] transition-all"
              >
                <option value="Semua">Semua Stok</option>
                <option value="Tersedia">Stok Tersedia</option>
                <option value="Habis">Stok Habis</option>
              </select>
            </div>

          </div>
        </div>

        {/* Product List Cards matching SVG (928x104px per row) */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F6F0E8] border border-[#E8E2D9] flex items-center justify-center text-[#C2652A] mx-auto">
              <Coffee size={28} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-lg font-bold text-[#3A302A]">
                {totalProducts === 0 ? 'Katalog Masih Kosong' : 'Produk Tidak Ditemukan'}
              </h3>
              <p className="text-xs text-[#605850]">
                {totalProducts === 0
                  ? 'Belum ada produk yang didaftarkan ke katalog GH ROVIQ.'
                  : 'Coba ubah kata kunci pencarian atau reset filter kategori.'}
              </p>
            </div>
            {totalProducts === 0 ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-5 py-2.5 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
                >
                  + Tambah Produk Pertama
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSearchQuery('');
                  setStockFilter('Semua');
                }}
                className="text-xs font-semibold text-[#C2652A] hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredProducts.map((product) => {
              const available = isProductAvailable(product.id);

              return (
                <div
                  key={product.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] hover:border-[#C2652A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs group"
                >
                  {/* Left: Thumbnail & Details matching SVG */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#ECE6DC] border border-[#D8D0C8] shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        unoptimized={Boolean(product.image?.startsWith("data:"))}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="64px"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[#C2652A] border border-[#E8E2D9]">
                          {product.category}
                        </span>
                        {product.badge && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF5EE] text-[#3A302A] border border-[#D8D0C8]">
                            {product.badge}
                          </span>
                        )}
                        {product.rating && (
                          <span className="text-[11px] font-bold text-[#3A302A]">
                            ★ {product.rating}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-base font-bold text-[#3A302A] leading-snug">
                        {product.name}
                      </h3>

                      <p className="text-xs text-[#605850] line-clamp-1 max-w-md font-light">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Price, Stock Toggle & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8E2D9]">
                    
                    {/* Price */}
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-[#9A9088] uppercase block">Harga</span>
                      <span className="font-bold text-sm sm:text-base text-[#3A302A]">
                        {formatRupiah(product.price)}
                      </span>
                    </div>

                    {/* Stock Availability Toggle switch matching SVG */}
                    <button
                      type="button"
                      onClick={() => handleToggleStock(product.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all border ${
                        available
                          ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32] hover:bg-[#C8E6C9]'
                          : 'bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828] hover:bg-[#FFCDD2]'
                      }`}
                      title="Klik untuk mengubah status ketersediaan stok"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          available ? 'bg-[#2E7D32]' : 'bg-[#C62828]'
                        }`}
                      />
                      <span>{available ? 'Tersedia' : 'Habis'}</span>
                    </button>

                    {/* Edit & Delete actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(product)}
                        className="p-2 rounded-xl bg-white hover:bg-[#FAF5EE] text-[#605850] hover:text-[#C2652A] border border-[#D8D0C8] transition-all shadow-2xs"
                        aria-label="Edit produk"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 rounded-xl bg-white hover:bg-red-50 text-[#605850] hover:text-red-600 border border-[#D8D0C8] hover:border-red-200 transition-all shadow-2xs"
                        aria-label="Hapus produk"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* PopOut Modal for Revenue Omset */}
      <RevenueModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
      />

      {/* Add / Edit Product Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#FAF5EE] rounded-3xl border border-[#D8D0C8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#F6F0E8] border-b border-[#E8E2D9] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C2652A]">
                  Katalog Form
                </span>
                <h3 className="font-serif text-xl font-bold text-[#3A302A]">
                  {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#9A9088] hover:text-[#3A302A] hover:bg-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto text-xs">
              
              {/* Product Name */}
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

              {/* Category & Price */}
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
                    type="number"
                    required
                    min={0}
                    step={1000}
                    placeholder="Misal: 25000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8D0C8] text-sm text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
                  />
                </div>
              </div>

              {/* Description */}
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

              {/* Upload Foto Produk dari Perangkat */}
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

                {/* Alternatif Input URL Gambar */}
                <div>
                  <input
                    type="url"
                    placeholder="Atau tempel URL gambar langsung (opsional: https://...)"
                    value={formData.image.startsWith('data:') ? '' : formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D8D0C8] text-xs text-[#3A302A] placeholder-[#9A9088] font-mono focus:outline-none focus:border-[#C2652A]"
                  />
                </div>
              </div>

              {/* Optional Badge & Temperature options */}
              <div className="grid grid-cols-2 gap-4 pt-2">
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

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E8E2D9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#605850] hover:text-[#3A302A] hover:bg-white transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs font-semibold tracking-wide shadow-md transition-all active:scale-95"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambahkan ke Menu'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

