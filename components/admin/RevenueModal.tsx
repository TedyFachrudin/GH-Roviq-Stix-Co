'use client';

import React, { useState } from 'react';
import { X, TrendingUp, Download, ArrowUpRight, DollarSign, Receipt, CreditCard, Banknote } from 'lucide-react';
import { calculateOmsetStats, OmsetStats } from '@/lib/store';

interface RevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RevenueModal({ isOpen, onClose }: RevenueModalProps) {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [stats, setStats] = useState<OmsetStats>(() => calculateOmsetStats('today'));

  React.useEffect(() => {
    if (isOpen) {
      setStats(calculateOmsetStats(timeframe));
    }
  }, [isOpen, timeframe]);

  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportCSV = () => {
    if (stats.recentTransactions.length === 0) {
      alert('Belum ada transaksi untuk diexport.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog Card matching PopOut Total Pendapatan Omset.svg (760px wide, rx:16, fill: #FAF5EE) */}
      <div className="relative w-full max-w-3xl bg-[#FAF5EE] rounded-3xl border border-[#D8D0C8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header (y:14 to 107, fill: #F6F0E8) */}
        <div className="px-6 sm:px-8 py-5 bg-[#F6F0E8] border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C2652A] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C2652A]">
                Finansial & Omset
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#3A302A] tracking-tight">
              TOTAL PENDAPATAN OMSET
            </h2>
            <p className="text-xs text-[#605850] font-sans font-light">
              Ringkasan performa finansial dan transaksi GH Roviq
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9A9088] hover:text-[#3A302A] hover:bg-[#FAF5EE] border border-transparent hover:border-[#D8D0C8] transition-all"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          
          {/* Timeframe Filter Pills matching SVG (w:251, h:36, rx:12) */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="inline-flex p-1 rounded-xl bg-[#F2ECE4] border border-[#E8E2D9]">
              {(['today', 'week', 'month'] as const).map((t) => {
                const labels = {
                  today: 'Hari Ini',
                  week: '7 Hari Terakhir',
                  month: 'Bulan Ini',
                };
                const isSelected = timeframe === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeframe(t)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isSelected
                        ? 'bg-[#C2652A] text-white shadow-xs'
                        : 'text-[#605850] hover:text-[#3A302A]'
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] text-[#9A9088]">
              Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}
            </span>
          </div>

          {/* 3 Summary KPI Cards matching SVG (w:227, h:112, fill: #F6F0E8, stroke: #D8D0C8) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1: Total Pendapatan */}
            <div className="p-5 rounded-2xl bg-[#F6F0E8] border border-[#D8D0C8] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#9A9088]">
                <span className="uppercase tracking-wider font-semibold text-[10px]">
                  Total Omset
                </span>
                <DollarSign size={16} className="text-[#C2652A]" />
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#3A302A]">
                {formatRupiah(stats.totalRevenue)}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#2E7D32]">
                <ArrowUpRight size={13} />
                <span>Real-time terakumulasi</span>
              </div>
            </div>

            {/* Card 2: Total Transaksi */}
            <div className="p-5 rounded-2xl bg-[#F6F0E8] border border-[#D8D0C8] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#9A9088]">
                <span className="uppercase tracking-wider font-semibold text-[10px]">
                  Total Transaksi
                </span>
                <Receipt size={16} className="text-[#C2652A]" />
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#3A302A]">
                {stats.totalOrders} <span className="text-sm font-sans font-normal text-[#605850]">Pesanan</span>
              </div>
              <div className="text-[11px] text-[#605850]">
                Volume pesanan masuk
              </div>
            </div>

            {/* Card 3: Rata-rata Order */}
            <div className="p-5 rounded-2xl bg-[#F6F0E8] border border-[#D8D0C8] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#9A9088]">
                <span className="uppercase tracking-wider font-semibold text-[10px]">
                  Rata-rata / Order
                </span>
                <TrendingUp size={16} className="text-[#C2652A]" />
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#3A302A]">
                {formatRupiah(stats.averageOrderValue)}
              </div>
              <div className="text-[11px] text-[#605850]">
                Basket size per meja
              </div>
            </div>

          </div>

          {/* Breakdown Section: Payment Methods & Category matching SVG (w:710, h:266) */}
          <div className="p-6 rounded-2xl bg-[#F6F0E8] border border-[#D8D0C8] space-y-5">
            <div>
              <h3 className="font-serif text-sm font-bold text-[#3A302A] uppercase tracking-wider">
                Distribusi Metode Pembayaran
              </h3>
              <p className="text-xs text-[#605850] mt-0.5">
                Perbandingan transaksi nontunai (QRIS) dan pembayaran langsung (Tunai)
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-[#E8E2D9] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${stats.qrisPercentage}%` }}
                  className="bg-[#C2652A] transition-all duration-500"
                  title={`QRIS: ${stats.qrisPercentage}%`}
                />
                <div
                  style={{ width: `${stats.cashPercentage}%` }}
                  className="bg-[#3A302A] transition-all duration-500"
                  title={`Tunai: ${stats.cashPercentage}%`}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#C2652A]" />
                  <span className="font-semibold text-[#3A302A]">QRIS ({stats.qrisPercentage}%)</span>
                  <span className="text-[#9A9088]">{formatRupiah(stats.qrisRevenue)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#3A302A]" />
                  <span className="font-semibold text-[#3A302A]">Tunai ({stats.cashPercentage}%)</span>
                  <span className="text-[#9A9088]">{formatRupiah(stats.cashRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Category summary pills */}
            <div className="pt-2 border-t border-[#E8E2D9] grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.categoryBreakdown.map((cat) => (
                <div key={cat.category} className="p-2.5 rounded-xl bg-[#FAF5EE] border border-[#E8E2D9]">
                  <span className="text-[10px] uppercase font-bold text-[#9A9088] block">
                    {cat.category}
                  </span>
                  <span className="font-bold text-xs text-[#3A302A] block mt-0.5">
                    {formatRupiah(cat.revenue)}
                  </span>
                  <span className="text-[10px] text-[#C2652A]">
                    {cat.percentage}% kontribusi
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Completed Transactions Table matching SVG (w:710, h:177) */}
          <div className="p-6 rounded-2xl bg-[#F6F0E8] border border-[#D8D0C8] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-[#3A302A] uppercase tracking-wider">
                Transaksi Terbaru
              </h3>
              <span className="text-[11px] text-[#9A9088]">
                {stats.recentTransactions.length} transaksi tercatat
              </span>
            </div>

            {stats.recentTransactions.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#9A9088]">
                Belum ada transaksi pada periode ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8E2D9] text-[#9A9088] font-semibold text-[10px] uppercase">
                      <th className="pb-2">ID Pesanan</th>
                      <th className="pb-2">Pelanggan</th>
                      <th className="pb-2">Metode</th>
                      <th className="pb-2 text-right">Total</th>
                      <th className="pb-2 text-right">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D9]">
                    {stats.recentTransactions.slice(0, 5).map((tx) => (
                      <tr key={tx.id} className="text-[#605850]">
                        <td className="py-2.5 font-mono font-medium text-[#3A302A]">{tx.id}</td>
                        <td className="py-2.5 font-medium">{tx.customerName}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              tx.paymentMethod === 'QRIS'
                                ? 'bg-[#F2ECE4] text-[#C2652A]'
                                : 'bg-[#FAF5EE] text-[#3A302A]'
                            }`}
                          >
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-bold text-[#3A302A]">
                          {formatRupiah(tx.total)}
                        </td>
                        <td className="py-2.5 text-right text-[11px] text-[#9A9088]">
                          {new Date(tx.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer matching SVG (Export button w:74, h:32, rx:12, fill: #C2652A) */}
        <div className="px-6 sm:px-8 py-4 bg-[#F6F0E8] border-t border-[#E8E2D9] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-[#605850] hover:text-[#3A302A] hover:bg-[#FAF5EE] transition-all"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-5 py-2 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs font-semibold tracking-wide flex items-center gap-2 shadow-sm transition-all"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

      </div>
    </div>
  );
}

