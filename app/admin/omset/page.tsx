'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Download,
  RefreshCw,
  Receipt,
  CheckCircle2,
  QrCode,
  Banknote,
  Calendar,
  Layers,
  ArrowUpRight,
  Trash2,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { calculateOmsetStats, OmsetStats, syncOrdersFromCloud, deleteOrder } from '@/lib/store';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAdminAuth } from '@/lib/admin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminOmsetPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdminAuth();

  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [stats, setStats] = useState<OmsetStats>(() => calculateOmsetStats('today'));
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Protect Admin route
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isLoading, isAdmin, router]);

  const refreshStats = () => {
    setStats(calculateOmsetStats(timeframe));
  };

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when timeframe changes
  useEffect(() => {
    setCurrentPage(1);
  }, [timeframe]);

  const totalPages = Math.ceil(stats.recentTransactions.length / ITEMS_PER_PAGE) || 1;

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return stats.recentTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [stats.recentTransactions, currentPage]);

  const handleDeleteTransaction = (orderId: string, customerName: string) => {
    if (confirm(`Hapus transaksi ${orderId} (${customerName}) dari pembukuan riwayat omset?`)) {
      deleteOrder(orderId);
      refreshStats();
    }
  };

  useEffect(() => {
    refreshStats();

    // Sync cloud orders on mount
    syncOrdersFromCloud().then(() => {
      refreshStats();
    });

    const handleLocalUpdate = () => refreshStats();
    window.addEventListener('gh_orders_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    // Supabase Realtime channel
    let channel: any = null;
    if (isSupabaseConfigured()) {
      channel = supabase
        .channel('admin_omset_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            syncOrdersFromCloud().then(() => refreshStats());
          }
        )
        .subscribe();
    }

    // Periodic sync every 10 seconds
    const interval = setInterval(() => {
      syncOrdersFromCloud().then(() => refreshStats());
    }, 10000);

    return () => {
      window.removeEventListener('gh_orders_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
      if (channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(interval);
    };
  }, [timeframe]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await syncOrdersFromCloud();
    refreshStats();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportCSV = () => {
    if (stats.recentTransactions.length === 0) {
      alert('Belum ada transaksi untuk diekspor.');
      return;
    }

    const headers = ['ID Pesanan', 'Pelanggan', 'Metode Pembayaran', 'Total', 'Waktu'];
    const rows = stats.recentTransactions.map((tx) => [
      tx.id,
      `"${tx.customerName}"`,
      tx.paymentMethod,
      tx.total,
      `"${new Date(tx.createdAt).toLocaleString('id-ID')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Omset_GHRoviq_${timeframe}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF5EE] flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F6F0E8] border border-[#E8E2D9] text-[#C2652A] text-[11px] font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#C2652A] animate-pulse" />
              <span>Finansial & Omset</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A302A] tracking-tight">
              Laporan Omset & Pendapatan
            </h1>
            <p className="text-xs sm:text-sm text-[#605850] font-sans font-light">
              Ringkasan performa finansial, omset penjualan, dan pembukuan transaksi GH ROVIQ.
            </p>
          </div>

          {/* Action Buttons: Timeframe, Export, Refresh */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Timeframe Filter Pills */}
            <div className="inline-flex p-1 rounded-xl bg-[#F2ECE4] border border-[#E8E2D9]">
              {(
                [
                  { key: 'today', label: 'Hari Ini' },
                  { key: 'week', label: '7 Hari' },
                  { key: 'month', label: '30 Hari' },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTimeframe(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    timeframe === t.key
                      ? 'bg-[#C2652A] text-white shadow-xs'
                      : 'text-[#605850] hover:text-[#3A302A]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF5EE] border border-[#D8D0C8] text-xs font-semibold text-[#3A302A] flex items-center gap-2 transition-all shadow-2xs active:scale-95"
              title="Unduh laporan transaksi dalam format CSV"
            >
              <Download size={14} className="text-[#C2652A]" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={handleManualRefresh}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#F2ECE4] hover:bg-[#E8E2D9] border border-[#D8D0C8] text-xs font-semibold text-[#3A302A] flex items-center gap-2 transition-all shadow-2xs active:scale-95"
              title="Segarkan data omset"
            >
              <RefreshCw
                size={14}
                className={`text-[#C2652A] ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>
        </div>

        {/* 3 Main KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total Omset */}
          <div className="p-6 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9088]">
                Total Omset
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] text-[#C2652A] flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3A302A]">
              {formatRupiah(stats.totalRevenue)}
            </div>
            <div className="text-xs text-[#605850]">
              <span className="font-semibold text-[#3A302A]">
                {stats.totalOrders} Transaksi
              </span>{' '}
              tercatat periode ini
            </div>
          </div>

          {/* Card 2: Rata-rata Nilai Order (AOV) */}
          <div className="p-6 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9088]">
                Rata-Rata Order (AOV)
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] text-[#C2652A] flex items-center justify-center">
                <Receipt size={16} />
              </div>
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#3A302A]">
              {formatRupiah(stats.averageOrderValue)}
            </div>
            <div className="text-xs text-[#605850]">
              Perkiraan nilai per struk transaksi
            </div>
          </div>

          {/* Card 3: Total Transaksi Selesai */}
          <div className="p-6 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9088]">
                Pesanan Berhasil
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] text-[#2E7D32] flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2E7D32]">
              {stats.totalOrders}
            </div>
            <div className="text-xs text-[#605850]">
              Pesanan selesai terbayar
            </div>
          </div>
        </div>

        {/* Secondary Analytics: Metode Pembayaran & Kategori Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Distribusi Metode Pembayaran */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F6F0E8]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9A9088]">
                  Metode Bayar
                </span>
                <h3 className="font-serif text-base font-bold text-[#3A302A]">
                  Distribusi Pembayaran
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#9A9088]">
                {stats.totalOrders} Pesanan
              </span>
            </div>

            <div className="space-y-4">
              {/* QRIS */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-[#3A302A]">
                    <QrCode size={14} className="text-[#C2652A]" />
                    QRIS
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-[#3A302A] mr-2">
                      {formatRupiah(stats.qrisRevenue)}
                    </span>
                    <span className="text-[11px] text-[#9A9088]">
                      ({stats.qrisPercentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F6F0E8] overflow-hidden">
                  <div
                    className="h-full bg-[#C2652A] rounded-full transition-all duration-500"
                    style={{ width: `${stats.qrisPercentage}%` }}
                  />
                </div>
              </div>

              {/* Tunai */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-[#3A302A]">
                    <Banknote size={14} className="text-[#3A302A]" />
                    Tunai / Kasir
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-[#3A302A] mr-2">
                      {formatRupiah(stats.cashRevenue)}
                    </span>
                    <span className="text-[11px] text-[#9A9088]">
                      ({stats.cashPercentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F6F0E8] overflow-hidden">
                  <div
                    className="h-full bg-[#3A302A] rounded-full transition-all duration-500"
                    style={{ width: `${stats.cashPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Kontribusi Penjualan per Kategori */}
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F6F0E8]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9A9088]">
                  Katalog
                </span>
                <h3 className="font-serif text-base font-bold text-[#3A302A]">
                  Omset per Kategori Menu
                </h3>
              </div>
              <Layers size={16} className="text-[#9A9088]" />
            </div>

            <div className="space-y-3.5">
              {stats.categoryBreakdown.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#3A302A]">
                      {item.category}
                    </span>
                    <div className="text-right">
                      <span className="font-semibold text-[#3A302A] mr-2">
                        {formatRupiah(item.revenue)}
                      </span>
                      <span className="text-[11px] text-[#9A9088]">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#F6F0E8] overflow-hidden">
                    <div
                      className="h-full bg-[#C2652A] rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabel Transaksi Pembukuan Terbaru */}
        <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F6F0E8]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C2652A]">
                Buku Penjualan
              </span>
              <h3 className="font-serif text-xl font-bold text-[#3A302A]">
                Riwayat Transaksi Periode Ini
              </h3>
            </div>
            <span className="text-xs text-[#9A9088]">
              {stats.recentTransactions.length} Transaksi Tercatat
            </span>
          </div>

          {stats.recentTransactions.length === 0 ? (
            <div className="py-12 text-center max-w-sm mx-auto space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#F6F0E8] border border-[#E8E2D9] flex items-center justify-center text-[#9A9088] mx-auto">
                <Receipt size={24} />
              </div>
              <h4 className="font-serif text-base font-bold text-[#3A302A]">
                Belum Ada Transaksi
              </h4>
              <p className="text-xs text-[#605850]">
                Saat pelanggan melakukan pesanan dan transaksi diselesaikan, data omset akan otomatis tercatat di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8E2D9] text-[#9A9088] uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-semibold">ID Pesanan</th>
                      <th className="pb-3 font-semibold">Pelanggan</th>
                      <th className="pb-3 font-semibold">Waktu</th>
                      <th className="pb-3 font-semibold">Metode</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Total</th>
                      <th className="pb-3 font-semibold text-center w-14">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F6F0E8]">
                    {paginatedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#FAF5EE] transition-colors">
                        <td className="py-3.5 font-mono font-bold text-[#3A302A]">
                          {tx.id}
                        </td>
                        <td className="py-3.5 font-medium text-[#3A302A]">
                          {tx.customerName}
                        </td>
                        <td className="py-3.5 text-[#9A9088]">
                          {new Date(tx.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-[#F6F0E8] text-[#3A302A] text-[10px] font-semibold">
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-right text-[#C2652A]">
                          {formatRupiah(tx.total)}
                        </td>
                        <td className="py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(tx.id, tx.customerName)}
                            className="p-1.5 rounded-lg text-[#9A9088] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                            title="Hapus transaksi ini dari riwayat"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination (Maks 10 transaksi per halaman) */}
              {totalPages > 1 && (
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8E2D9]">
                  <p className="text-xs text-[#605850]">
                    Menampilkan <span className="font-semibold text-[#3A302A]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> -{' '}
                    <span className="font-semibold text-[#3A302A]">
                      {Math.min(currentPage * ITEMS_PER_PAGE, stats.recentTransactions.length)}
                    </span>{' '}
                    dari <span className="font-semibold text-[#3A302A]">{stats.recentTransactions.length}</span> transaksi
                  </p>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          aria-label="Go to previous page"
                          size="icon"
                        >
                          <ChevronLeftIcon className="size-4" />
                        </PaginationLink>
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          aria-label="Go to next page"
                          size="icon"
                        >
                          <ChevronRightIcon className="size-4" />
                        </PaginationLink>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

