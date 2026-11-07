'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  ChefHat,
  Coffee,
  Phone,
  AlertCircle,
  Check,
  ChevronRight,
  Sparkles,
  Eye,
} from 'lucide-react';
import { OrderDetails } from '@/types';
import {
  getStoredOrders,
  saveStoredOrders,
  updateOrderStatus,
  syncOrdersFromCloud,
} from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAdminAuth } from '@/lib/admin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminPesananPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdminAuth();

  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Protect Admin route
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isLoading, isAdmin, router]);

  // Refresh orders from local storage
  const refreshOrders = () => {
    setOrders(getStoredOrders());
  };

  // Load and subscribe to real-time cloud and local orders
  useEffect(() => {
    // 1. Initial cached orders
    refreshOrders();

    // 2. Fetch latest orders from Supabase cloud
    syncOrdersFromCloud().then((cloudOrders) => {
      setOrders(cloudOrders);
    });

    // 3. Listen to local events
    const handleLocalUpdate = () => setOrders(getStoredOrders());
    window.addEventListener('gh_orders_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    // 4. Supabase Realtime channel subscription
    let channel: any = null;
    if (isSupabaseConfigured()) {
      channel = supabase
        .channel('admin_pesanan_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            syncOrdersFromCloud().then((updated) => setOrders(updated));
          }
        )
        .subscribe();
    }

    // 5. Periodic polling fallback every 6 seconds
    const interval = setInterval(() => {
      syncOrdersFromCloud().then((updated) => setOrders(updated));
    }, 6000);

    return () => {
      window.removeEventListener('gh_orders_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
      if (channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(interval);
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const updated = await syncOrdersFromCloud();
    setOrders(updated);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Metrics
  const waitingCount = orders.filter((o) => o.status === 'Menunggu').length;
  const processingCount = orders.filter((o) => o.status === 'Diproses').length;
  const completedCount = orders.filter((o) => o.status === 'Selesai').length;

  // Filtered orders with strict null-safety
  const filteredOrders = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return orders.filter((o) => {
      if (!o) return false;
      const idMatch = (o.id || '').toLowerCase().includes(q);
      const nameMatch = (o.customerName || '').toLowerCase().includes(q);
      const queueMatch = (o.queueNumber || '').toLowerCase().includes(q);
      const matchSearch = !q || idMatch || nameMatch || queueMatch;

      const matchType = selectedType === 'Semua' || o.orderType === selectedType;
      const matchStatus = selectedStatus === 'Semua' || o.status === selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [orders, searchQuery, selectedType, selectedStatus]);

  const handleStatusChange = (orderId: string, newStatus: 'Menunggu' | 'Diproses' | 'Selesai') => {
    updateOrderStatus(orderId, newStatus);
    refreshOrders();
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-2 border-[#C2652A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#9A9088] uppercase tracking-widest font-semibold">
            Memuat Manajemen Pesanan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5EE] flex flex-col lg:flex-row">
      
      {/* Sidebar matching SVG layout */}
      <AdminSidebar />

      {/* Main Content Area (width: 992px, background: #FAF5EE) */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl space-y-8">
        
        {/* Top Header matching SVG (y: 25 to 135) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F6F0E8] border border-[#E8E2D9] text-[#C2652A] text-[11px] font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#C2652A] animate-pulse" />
              <span>Real-Time Kitchen Feed</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A302A] tracking-tight">
              Pesanan Masuk (Real-Time)
            </h1>
            <p className="text-xs sm:text-sm text-[#605850] font-sans font-light">
              Pantau antrean pesanan pelanggan, racikan kopi, serta status sajian meja secara langsung.
            </p>
          </div>

          {/* Refresh button matching SVG (x:1116.42, y:103, w:131.58, h:32, fill: #F2ECE4) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleManualRefresh}
              className="px-4 py-2 rounded-xl bg-[#F2ECE4] hover:bg-[#E8E2D9] border border-[#D8D0C8] text-xs font-semibold text-[#3A302A] flex items-center gap-2 transition-all shadow-2xs active:scale-95"
            >
              <RefreshCw
                size={14}
                className={`text-[#C2652A] ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards matching SVG (y:135, each w:298, h:180, rx:12, fill: #F6F0E8) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* Card 1: Menunggu Konfirmasi */}
          <div className="p-6 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9088]">
                Pesanan Baru
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#C2652A] animate-ping" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#3A302A]">
              {waitingCount}
            </div>
            <div className="text-xs text-[#605850] space-y-0.5">
              <p className="font-semibold text-[#3A302A]">Menunggu Konfirmasi</p>
              <p className="text-[11px] text-[#9A9088]">Perlu diterima barista/dapur</p>
            </div>
          </div>

          {/* Card 2: Sedang Diproses */}
          <div className="p-6 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2652A]">
                Sedang Diseduh / Masak
              </span>
              <ChefHat size={18} className="text-[#C2652A]" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#C2652A]">
              {processingCount}
            </div>
            <div className="text-xs text-[#605850] space-y-0.5">
              <p className="font-semibold text-[#3A302A]">Sedang Diproses</p>
              <p className="text-[11px] text-[#9A9088]">Dalam persiapan bar & dapur</p>
            </div>
          </div>

          {/* Card 3: Pesanan Selesai */}
          <div className="p-6 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32]">
                Selesai Disajikan
              </span>
              <CheckCircle2 size={18} className="text-[#2E7D32]" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#2E7D32]">
              {completedCount}
            </div>
            <div className="text-xs text-[#605850] space-y-0.5">
              <p className="font-semibold text-[#3A302A]">Pesanan Selesai</p>
              <p className="text-[11px] text-[#9A9088]">Telah diantarkan ke meja</p>
            </div>
          </div>

        </div>

        {/* Filter and Search Bar matching SVG (y:315, w:928, h:68, rx:12, fill: #F6F0E8) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Input (w:295, h:36) */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9088]" />
            <input
              type="text"
              placeholder="Cari ID pesanan, nama, antrean..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-[#D8D0C8] text-xs text-[#3A302A] placeholder-[#9A9088] focus:outline-none focus:border-[#C2652A] transition-all"
            />
          </div>

          {/* Filter Dropdowns (w:148, w:155) */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-[#D8D0C8] text-xs text-[#3A302A] font-medium focus:outline-none focus:border-[#C2652A] transition-all"
            >
              <option value="Semua">Semua Layanan</option>
              <option value="Dine-in">Dine-in (Meja)</option>
              <option value="Takeaway">Takeaway (Bungkus)</option>
              <option value="Delivery">Delivery</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-[#D8D0C8] text-xs text-[#3A302A] font-medium focus:outline-none focus:border-[#C2652A] transition-all"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

        </div>

        {/* Live Orders Stream matching SVG (923x375px cards) */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F6F0E8] border border-[#E8E2D9] flex items-center justify-center text-[#9A9088] mx-auto">
              <ClipboardList size={28} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-lg font-bold text-[#3A302A]">
                Belum Ada Pesanan Masuk
              </h3>
              <p className="text-xs text-[#605850]">
                Saat pelanggan melakukan checkout, pesanan akan langsung muncul secara real-time di halaman ini.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const isWaiting = order.status === 'Menunggu';
              const isProcessing = order.status === 'Diproses';
              const isCompleted = order.status === 'Selesai';

              return (
                <div
                  key={order.id}
                  className="rounded-3xl bg-[#F6F0E8] border border-[#E8E2D9] p-5 sm:p-7 space-y-5 shadow-xs transition-all hover:border-[#D8D0C8]"
                >
                  {/* Card Header matching SVG (x:344, y:487, w:875, h:72, fill: white) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                    
                    <div className="flex items-center gap-4">
                      {/* Queue Number Box */}
                      <div className="w-14 h-14 rounded-xl bg-[#3A302A] text-white flex flex-col items-center justify-center font-bold shrink-0 shadow-xs">
                        <span className="text-[9px] uppercase tracking-wider text-[#D8D0C8]">Antrean</span>
                        <span className="font-mono text-base text-[#FAF5EE]">{order.queueNumber || '#A-01'}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#3A302A]">
                            {order.id}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF5EE] text-[#605850] border border-[#E8E2D9]">
                            {order.orderType} {order.tableNumber ? `(Meja ${order.tableNumber})` : ''}
                          </span>
                        </div>

                        <h3 className="font-serif text-base font-bold text-[#3A302A]">
                          {order.customerName}
                        </h3>

                        {order.customerPhone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#9A9088]">
                            <Phone size={11} />
                            <span>{order.customerPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge & Timestamp */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isWaiting
                            ? 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]'
                            : isProcessing
                            ? 'bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB]'
                            : 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-[11px] text-[#9A9088] flex items-center gap-1">
                        <Clock size={11} />
                        <span>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </span>
                      </span>
                    </div>

                  </div>

                  {/* Items Breakdown list matching SVG (fill: #F2ECE4 per item row) */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9088] px-1 block">
                      Rincian Sajian ({order.items?.length || 0} Item)
                    </span>

                    <div className="space-y-2">
                      {order.items?.map((item, idx) => {
                        const productName =
                          item?.product?.name || (item as any)?.name || 'Menu Sajian';
                        const productPrice =
                          item?.product?.price ?? (item as any)?.price ?? 0;
                        const quantity = item?.quantity || 1;

                        return (
                          <div
                            key={idx}
                            className="p-3.5 sm:p-4 rounded-xl bg-[#F2ECE4] border border-[#E8E2D9] flex items-center justify-between gap-4 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-md bg-white text-[#C2652A] font-bold text-xs flex items-center justify-center border border-[#D8D0C8]">
                                {quantity}x
                              </span>
                              <div>
                                <div className="font-serif font-bold text-[#3A302A]">
                                  {productName}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-[#605850] mt-0.5">
                                  {item?.selectedOption && (
                                    <span className="font-medium text-[#C2652A]">
                                      [{item.selectedOption}]
                                    </span>
                                  )}
                                  {item?.note && (
                                    <span className="italic">
                                      Catatan: &ldquo;{item.note}&rdquo;
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="font-semibold text-xs text-[#3A302A]">
                              {formatRupiah(productPrice * quantity)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Bottom: Total Payment & Action Buttons matching SVG */}
                  <div className="pt-4 border-t border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Payment Info */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase text-[#9A9088] block">Total Pembayaran</span>
                        <span className="font-serif text-lg font-bold text-[#3A302A]">
                          {formatRupiah(order.total)}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-white text-[#C2652A] border border-[#D8D0C8]">
                        {order.paymentMethod} • Lunas
                      </span>
                      {order.paymentProof && (
                        <button
                          type="button"
                          onClick={() => {
                            const w = window.open('');
                            w?.document.write(`<html><head><title>Bukti Pembayaran - ${order.id}</title></head><body style="margin:0;background:#1a1a1a;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${order.paymentProof}" style="max-width:90%;max-height:90vh;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);" /></body></html>`);
                          }}
                          className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Klik untuk melihat bukti transfer QRIS"
                        >
                          <Eye size={12} />
                          <span>Bukti QRIS</span>
                        </button>
                      )}
                    </div>

                    {/* Action Buttons matching SVG (fill: #C2652A & #3A302A) */}
                    <div className="flex items-center gap-2.5">
                      {isWaiting && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(order.id, 'Diproses')}
                          className="px-5 py-2.5 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                        >
                          <ChefHat size={14} />
                          <span>Terima & Proses Pesanan</span>
                        </button>
                      )}

                      {isProcessing && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(order.id, 'Selesai')}
                          className="px-5 py-2.5 rounded-xl bg-[#3A302A] hover:bg-[#201A16] text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                        >
                          <CheckCircle2 size={14} className="text-[#A5D6A7]" />
                          <span>Tandai Selesai & Sajikan</span>
                        </button>
                      )}

                      {isCompleted && (
                        <div className="px-4 py-2 rounded-xl bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-xs font-semibold flex items-center gap-1.5">
                          <Check size={14} />
                          <span>Pesanan Telah Selesai</span>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

    </div>
  );
}

