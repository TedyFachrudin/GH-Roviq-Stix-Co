'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Coffee,
  Award,
  Heart,
  Sparkles,
  Gift,
  ArrowRight,
  LogOut,
  Clock,
  ShoppingBag,
  ShieldCheck,
  Package,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { useAppUser, AppSignOutButton } from '@/lib/auth';
import { isAdminUser } from '@/lib/admin';
import { LoyaltyCard } from '@/components/member/LoyaltyCard';
import { RevenueModal } from '@/components/admin/RevenueModal';
import {
  getStoredProducts,
  getStoredOrders,
  calculateOmsetStats,
  isProductAvailable,
} from '@/lib/store';
import { getMemberQueueId } from '@/lib/member';
import { MemberProfile } from '@/types';

export default function ProfilePage() {
  const { isSignedIn, user } = useAppUser();

  const [memberStamps, setMemberStamps] = useState<number>(0);
  const [memberPoints, setMemberPoints] = useState<number>(0);
  const [memberId, setMemberId] = useState<string>('GH-001');
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // Admin stats
  const isAdmin = isAdminUser(user);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [adminProductsCount, setAdminProductsCount] = useState(0);
  const [adminInStockCount, setAdminInStockCount] = useState(0);
  const [adminPendingOrdersCount, setAdminPendingOrdersCount] = useState(0);
  const [adminTodayRevenue, setAdminTodayRevenue] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      const updateAdminStats = () => {
        const prods = getStoredProducts();
        const inStock = prods.filter((p) => isProductAvailable(p.id)).length;
        const ords = getStoredOrders();
        const pending = ords.filter((o) => o.status === 'Menunggu').length;
        const stats = calculateOmsetStats('today');

        setAdminProductsCount(prods.length);
        setAdminInStockCount(inStock);
        setAdminPendingOrdersCount(pending);
        setAdminTodayRevenue(stats.totalRevenue);
      };

      updateAdminStats();
      window.addEventListener('gh_products_updated', updateAdminStats);
      window.addEventListener('gh_orders_updated', updateAdminStats);
      window.addEventListener('storage', updateAdminStats);

      return () => {
        window.removeEventListener('gh_products_updated', updateAdminStats);
        window.removeEventListener('gh_orders_updated', updateAdminStats);
        window.removeEventListener('storage', updateAdminStats);
      };
    }
  }, [isAdmin]);

  useEffect(() => {
    if (user?.id) {
      const qId = getMemberQueueId(user.id, false);
      setMemberId(qId);

      try {
        const savedStamps = localStorage.getItem(`gh_stamps_${user.id}`);
        const savedPoints = localStorage.getItem(`gh_points_${user.id}`);
        const savedOrders = localStorage.getItem(`gh_orders_${user.id}`);

        setMemberStamps(savedStamps !== null ? Number(savedStamps) : 0);
        setMemberPoints(savedPoints !== null ? Number(savedPoints) : 0);
        if (savedOrders) {
          setUserOrders(JSON.parse(savedOrders));
        }
      } catch {}
    }
  }, [user?.id]);

  // Profile data when user is signed in as a member
  const memberName =
    (user as any)?.username ||
    user?.fullName ||
    user?.firstName ||
    'Sahabat Seduh';

  const memberData: MemberProfile = {
    id: memberId,
    name: memberName,
    email: user?.primaryEmailAddress?.emailAddress || 'member@ghroviq.com',
    phone: '+62 812-3456-7890',
    tier: memberStamps >= 10 ? 'Gold' : 'Artisan Club',
    stamps: memberStamps, // Starts from 0
    points: memberPoints, // Starts from 0
    joinDate: 'November 2026',
  };

  // Guest card profile for preview (all starting from 0, name 'Tamu', id 'GH-000')
  const guestCardData: MemberProfile = {
    id: 'GH-000',
    name: 'Tamu',
    email: '-',
    phone: '-',
    tier: 'Regular',
    stamps: 0,
    points: 0,
    joinDate: 'Hari Ini',
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* If user is Signed In: Check if Admin or Regular Member */}
        {isSignedIn ? (
          isAdmin ? (
            /* =========================================================
               STATE A: PROFIL ADMINISTRATOR & DEVELOPER (Roviq)
               ========================================================= */
            <div className="space-y-10 animate-in fade-in duration-300">
              
              {/* Header Admin */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D9]">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F0E8] border border-[#E8E2D9] text-[#C2652A] text-[11px] font-bold uppercase tracking-wider">
                    <ShieldCheck size={14} />
                    <span>Profil Administrator & Developer</span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A302A]">
                    Selamat Datang, {memberName}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#605850]">
                    {memberData.email} • Hak Akses Manajemen Penuh GH ROVIQ
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
                  >
                    <Activity size={14} />
                    <span>Buka Dashboard Penuh</span>
                  </Link>

                  <AppSignOutButton>
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D8D0C8] hover:bg-[#F6F0E8] text-xs font-semibold uppercase tracking-wider text-[#605850] transition-colors">
                      <LogOut size={14} />
                      <span>Keluar</span>
                    </button>
                  </AppSignOutButton>
                </div>
              </div>

              {/* 3 Management Hub Cards matching Figma SVGs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Hub Card 1: Manajemen Katalog & Stok Produk */}
                <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 space-y-4 hover:border-[#C2652A] transition-all shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#F6F0E8] text-[#C2652A] flex items-center justify-center">
                      <Package size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9088] block">
                        Katalog Produk
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#3A302A] mt-0.5">
                        Katalog & Stok
                      </h3>
                      <p className="text-xs text-[#605850] mt-1 leading-relaxed">
                        {adminProductsCount} menu terdaftar ({adminInStockCount} tersedia, {adminProductsCount - adminInStockCount} habis).
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/katalog"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF5EE] hover:bg-[#C2652A] text-[#3A302A] hover:text-white border border-[#D8D0C8] hover:border-[#C2652A] text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span>Kelola Menu & Stok</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Hub Card 2: Manajemen Pesanan Masuk (Real-Time) */}
                <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 space-y-4 hover:border-[#C2652A] transition-all shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#F6F0E8] text-[#C2652A] flex items-center justify-center">
                        <Clock size={24} />
                      </div>
                      {adminPendingOrdersCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          {adminPendingOrdersCount} Antrean
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9088] block">
                        Live Kitchen Feed
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#3A302A] mt-0.5">
                        Pesanan Masuk
                      </h3>
                      <p className="text-xs text-[#605850] mt-1 leading-relaxed">
                        Pantau antrean pesanan real-time dari pelanggan meja maupun takeaway.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/pesanan"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF5EE] hover:bg-[#C2652A] text-[#3A302A] hover:text-white border border-[#D8D0C8] hover:border-[#C2652A] text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span>Lihat Antrean Masuk</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Hub Card 3: PopOut Total Pendapatan Omset */}
                <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 space-y-4 hover:border-[#C2652A] transition-all shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#F6F0E8] text-[#C2652A] flex items-center justify-center">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9088] block">
                        Laporan Keuangan
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#3A302A] mt-0.5">
                        Total Pendapatan Omset
                      </h3>
                      <p className="text-xs text-[#605850] mt-1 leading-relaxed">
                        Omset hari ini: <strong className="text-[#3A302A]">{formatRupiah(adminTodayRevenue)}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRevenueModalOpen(true)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF5EE] hover:bg-[#C2652A] text-[#3A302A] hover:text-white border border-[#D8D0C8] hover:border-[#C2652A] text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span>Buka PopOut Omset</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>

              </div>

              {/* Quick Info Banner */}
              <div className="p-5 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-serif font-bold text-sm text-[#3A302A]">
                    Mode Pengelola Aktif
                  </span>
                  <p className="text-xs text-[#605850]">
                    Sebagai admin/developer, Anda dapat langsung mengatur ketersediaan menu dan melihat pesanan pelanggan secara real-time.
                  </p>
                </div>
                <Link
                  href="/menu"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF5EE] border border-[#D8D0C8] text-xs font-semibold text-[#3A302A] whitespace-nowrap self-start sm:self-auto transition-colors"
                >
                  Lihat Tampilan Menu Publik
                </Link>
              </div>

            </div>
          ) : (
            /* =========================================================
               STATE B: PROFIL MEMBER REGULER (Loyalty Card & Stamps)
               ========================================================= */
            <div className="space-y-10 animate-in fade-in duration-300">
              
              {/* Header info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D9]">
                <div>
                  <span className="text-xs font-semibold text-[#C2652A] uppercase tracking-widest">
                    Profil Anggota
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A302A] mt-1">
                    Selamat Datang, {memberName}
                  </h1>
                  <p className="text-sm text-[#605850] mt-0.5">
                    Anggota sejak {memberData.joinDate} • Status Aktif
                  </p>
                </div>

                <AppSignOutButton>
                  <button className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D8D0C8] hover:bg-[#F6F0E8] text-xs font-semibold uppercase tracking-wider text-[#605850] transition-colors">
                    <LogOut size={14} />
                    <span>Keluar</span>
                  </button>
                </AppSignOutButton>
              </div>

              {/* The 10-Stamp Digital Loyalty Card matching SVG */}
              <LoyaltyCard member={memberData} />

              {/* Riwayat Kunjungan & Stamp */}
              <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 space-y-6 shadow-subtle">
                <div className="flex items-center justify-between pb-4 border-b border-[#F6F0E8]">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-[#C2652A]" />
                    <h3 className="font-serif text-lg font-bold text-[#3A302A]">
                      Riwayat Transaksi & Perolehan Stamp
                    </h3>
                  </div>
                  <span className="text-xs text-[#9A9088]">
                    {userOrders.length > 0 ? `${userOrders.length} Pesanan Terakhir` : 'Belum Ada Pesanan'}
                  </span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FAF5EE] text-[#9A9088] flex items-center justify-center mx-auto border border-[#E8E2D9]">
                      <Coffee size={22} className="stroke-[1.8]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-base text-[#3A302A]">
                        Koleksi Stamp Masih 0
                      </h4>
                      <p className="text-xs text-[#605850] max-w-sm mx-auto leading-relaxed">
                        Anda belum memiliki riwayat pesanan. Lakukan pemesanan pertama Anda untuk mulai mengumpulkan stamp seduh dan hadiah gratis!
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link
                        href="/menu"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                      >
                        <ShoppingBag size={14} />
                        <span>Mulai Pesan Menu</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-[#FAF5EE] border border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#3A302A]">{item.id}</span>
                            <span className="text-[#9A9088]">• {item.date}</span>
                          </div>
                          <p className="font-medium text-[#605850]">{item.items}</p>
                        </div>

                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                          <span className="font-bold text-sm text-[#3A302A]">
                            {formatRupiah(item.total)}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F7ECE4] text-[#C2652A] font-semibold text-[11px]">
                            +{item.stampsAdded || 1} Stamp
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )
        ) : (
          /* State A: Tamu (Unauthenticated Guest view matching Profil Tamu.svg) */
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Guest Banner Card matching SVG */}
            <div className="bg-white border border-[#D8D0C8] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-card max-w-2xl mx-auto">
              
              {/* Avatar Guest */}
              <div className="w-20 h-20 rounded-full bg-[#F6F0E8] text-[#9A9088] flex items-center justify-center mx-auto border border-[#E8E2D9]">
                <User size={38} className="stroke-[1.7]" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#9A9088] uppercase tracking-widest">
                  Akun Tamu (Guest)
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A302A]">
                  Halo, Tamu GH ROVIQ
                </h1>
                <p className="text-sm text-[#605850] max-w-md mx-auto leading-relaxed font-sans font-light">
                  Anda saat ini menjelajah sebagai tamu. Bergabunglah dengan{' '}
                  <strong className="text-[#3A302A] font-semibold">Artisan Club</strong> untuk membuka kartu stamp digital, mengumpulkan reward gratis, dan menikmati kemudahan pemesanan.
                </p>
              </div>

              {/* Benefits list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-lg mx-auto text-center">
                <div className="p-4 rounded-xl bg-[#FAF5EE] border border-[#E8E2D9] space-y-2 flex flex-col items-center justify-center text-center">
                  <Coffee size={20} className="text-[#C2652A]" />
                  <h4 className="font-serif font-bold text-sm text-[#3A302A]">10 Stamp Gratis</h4>
                  <p className="text-[11px] text-[#605850] leading-snug">
                    Dapatkan 1 minuman kurasi gratis setiap 10 cangkir kopi yang dipesan.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF5EE] border border-[#E8E2D9] space-y-2 flex flex-col items-center justify-center text-center">
                  <Heart size={20} className="text-[#C2652A]" />
                  <h4 className="font-serif font-bold text-sm text-[#3A302A]">Menu Favorit</h4>
                  <p className="text-[11px] text-[#605850] leading-snug">
                    Simpan dan pesan kembali racikan kopi serta sajian dapur favorit Anda.
                  </p>
                </div>
              </div>

              {/* Action Buttons matching SVG */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <Link
                  href="/sign-in"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs uppercase tracking-wider font-semibold text-center shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>Masuk Akun</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/sign-up"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[#D8D0C8] bg-[#FAF5EE] hover:bg-[#F2ECE4] text-[#3A302A] text-xs uppercase tracking-wider font-semibold text-center transition-colors"
                >
                  Daftar Jadi Member
                </Link>
              </div>

            </div>

            {/* Preview of the Loyalty Card for Guest */}
            <div className="space-y-4 text-center">
              <span className="text-xs uppercase tracking-widest text-[#9A9088] font-medium block">
                Pratinjau Kartu Loyalitas Digital
              </span>
              <div className="opacity-75 grayscale hover:grayscale-0 transition-all pointer-events-none">
                <LoyaltyCard member={guestCardData} />
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Popout Total Omset & Pendapatan Modal */}
      {isAdmin && (
        <RevenueModal
          isOpen={isRevenueModalOpen}
          onClose={() => setIsRevenueModalOpen(false)}
        />
      )}

    </div>
  );
}
