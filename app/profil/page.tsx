'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Coffee,
  Heart,
  Sparkles,
  ArrowRight,
  LogOut,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { useAppUser, AppSignOutButton } from '@/lib/auth';
import { isAdminUser } from '@/lib/admin';
import { LoyaltyCard } from '@/components/member/LoyaltyCard';
import { getMemberQueueId, syncCurrentMember } from '@/lib/member';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MemberProfile } from '@/types';
import { Avatar, AvatarFallback, CustomBadge } from '@/components/ui/avatar';

function getInitials(name: string): string {
  if (!name) return 'GH';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { isSignedIn, user } = useAppUser();
  const isAdmin = isAdminUser(user);

  const [memberStamps, setMemberStamps] = useState<number>(0);
  const [memberPoints, setMemberPoints] = useState<number>(0);
  const [memberId, setMemberId] = useState<string>('GH-001');
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // Jika admin login dan membuka halaman profil, langsung arahkan ke Dashboard Admin
  useEffect(() => {
    if (isSignedIn && isAdmin) {
      router.replace('/admin');
    }
  }, [isSignedIn, isAdmin, router]);

  useEffect(() => {
    if (user?.id) {
      const qId = getMemberQueueId(user.id, false);
      setMemberId(qId);

      // 1. Initial local load
      try {
        const savedStamps = localStorage.getItem(`gh_stamps_${user.id}`);
        const savedPoints = localStorage.getItem(`gh_points_${user.id}`);
        const savedOrders = localStorage.getItem(`gh_orders_${user.id}`);

        if (savedStamps !== null) setMemberStamps(Number(savedStamps));
        if (savedPoints !== null) setMemberPoints(Number(savedPoints));
        if (savedOrders) {
          setUserOrders(JSON.parse(savedOrders));
        }
      } catch {}

      // 2. Cloud sync with Supabase members table
      const doSync = () => {
        syncCurrentMember(user).then((res) => {
          setMemberStamps(res.stamps);
          setMemberPoints(res.points);
          if (res.memberId) setMemberId(res.memberId);
        });
      };
      doSync();

      // 3. Listen to local custom event when admin changes stamps
      const handleCustomUpdate = (e: any) => {
        if (!e?.detail || e.detail.clerkId === user.id || e.detail.memberId === qId) {
          doSync();
        }
      };
      window.addEventListener('gh_member_stamps_updated', handleCustomUpdate);
      window.addEventListener('storage', doSync);

      // 4. Realtime Supabase subscription on members table
      let channel: any = null;
      if (isSupabaseConfigured()) {
        channel = supabase
          .channel('member_profil_realtime_' + user.id)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'members' },
            () => {
              doSync();
            }
          )
          .subscribe();
      }

      return () => {
        window.removeEventListener('gh_member_stamps_updated', handleCustomUpdate);
        window.removeEventListener('storage', doSync);
        if (channel) supabase.removeChannel(channel);
      };
    }
  }, [user]);

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
    stamps: memberStamps,
    points: memberPoints,
    joinDate: 'November 2026',
  };

  // Guest card profile for preview
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
    <div className="py-8 sm:py-14 pb-28 md:pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* If user is Signed In: Regular Member */}
        {isSignedIn ? (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-300">
              
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE4DA]">
              <div className="flex items-center gap-4">
                <Avatar size="xl" className="relative shrink-0">
                  <AvatarFallback className="bg-[#EAE4DA] border border-[#D8D0C8] text-[#010101] font-display font-bold text-lg">
                    {getInitials(memberName)}
                  </AvatarFallback>
                  <span className="absolute -bottom-0.5 -right-0.5">
                    <CustomBadge className="size-5" />
                  </span>
                </Avatar>
                <div>
                  <span className="text-[11px] font-bold text-[#7E4124] uppercase tracking-wider">
                    Profil Anggota Member
                  </span>
                  <h1 className="font-display font-bold uppercase tracking-tight text-2xl sm:text-3xl text-[#010101] mt-0.5">
                    Selamat Datang, {memberName}
                  </h1>
                  <p className="text-xs text-[#7A7269] mt-0.5 font-light">
                    ID: {memberId} • Anggota sejak {memberData.joinDate}
                  </p>
                </div>
              </div>

              <AppSignOutButton>
                <button className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#D8D0C8] bg-white/70 hover:bg-white text-xs font-bold uppercase tracking-wider text-[#010101] transition-all shadow-2xs cursor-pointer active:scale-95">
                  <LogOut size={14} />
                  <span>Keluar</span>
                </button>
              </AppSignOutButton>
            </div>

            {/* The 10-Stamp Digital Loyalty Card */}
            <LoyaltyCard member={memberData} />

            {/* Riwayat Kunjungan & Stamp */}
            <div className="bg-white border border-[#D8D0C8] rounded-[28px] p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE4DA]">
                <div className="flex items-center gap-2.5">
                  <Clock size={18} className="text-[#7E4124]" />
                  <h3 className="font-display font-bold uppercase tracking-tight text-xl text-[#010101]">
                    Riwayat Transaksi & Stamp
                  </h3>
                </div>
                <span className="text-xs text-[#7A7269]">
                  {userOrders.length > 0 ? `${userOrders.length} Pesanan Terakhir` : 'Belum Ada Pesanan'}
                </span>
              </div>

              {userOrders.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#EAE4DA] text-[#7A7269] flex items-center justify-center mx-auto border border-[#D8D0C8]">
                    <Coffee size={20} className="stroke-[1.8]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-bold uppercase tracking-tight text-lg text-[#010101]">
                      Koleksi Stamp Masih 0
                    </h4>
                    <p className="text-xs text-[#7A7269] max-w-sm mx-auto leading-relaxed font-light">
                      Anda belum memiliki riwayat pesanan. Lakukan pemesanan pertama Anda untuk mulai mengumpulkan stamp seduh dan reward gratis!
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/menu"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#010101] hover:bg-[#7E4124] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
                    >
                      <ShoppingBag size={14} />
                      <span>Mulai Pesan Menu</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#F3EFEA] border border-[#D8D0C8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#010101]">{item.date}</span>
                        </div>
                        <p className="font-light text-[#7A7269]">{item.items}</p>
                      </div>

                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <span className="font-display font-bold text-base text-[#010101]">
                          {formatRupiah(item.total)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EAE4DA] text-[#7E4124] font-bold text-[11px] uppercase tracking-wider">
                          +{item.stampsAdded || 1} Stamp
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* State A: Tamu (Unauthenticated Guest view) */
          <div className="space-y-10 sm:space-y-12 animate-in fade-in duration-300">
            
            {/* Guest Banner Card */}
            <div className="bg-white border border-[#D8D0C8] rounded-[32px] p-8 sm:p-12 text-center space-y-6 shadow-sm max-w-2xl mx-auto">
              
              {/* Avatar Guest */}
              <div className="w-20 h-20 rounded-full bg-[#EAE4DA] text-[#7A7269] flex items-center justify-center mx-auto border border-[#D8D0C8]">
                <User size={36} className="stroke-[1.7]" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#7E4124] uppercase tracking-wider">
                  Akun Tamu (Guest)
                </span>
                <h1 className="font-display font-bold uppercase tracking-tight text-3xl sm:text-5xl text-[#010101] leading-tight">
                  HALO, TAMU GH ROVIQ
                </h1>
                <p className="text-xs sm:text-sm text-[#7A7269] max-w-md mx-auto leading-relaxed font-light">
                  Anda saat ini menjelajah sebagai tamu. Bergabunglah dengan{' '}
                  <strong className="text-[#010101] font-semibold">Artisan Club</strong> untuk membuka kartu stamp digital, mengumpulkan reward gratis, dan menikmati kemudahan pemesanan.
                </p>
              </div>

              {/* Benefits list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-lg mx-auto text-center">
                <div className="p-5 rounded-2xl bg-[#F3EFEA] border border-[#D8D0C8] space-y-2 flex flex-col items-center justify-center text-center">
                  <Coffee size={22} className="text-[#7E4124]" />
                  <h4 className="font-display font-bold uppercase tracking-tight text-base text-[#010101]">
                    10 Stamp Gratis
                  </h4>
                  <p className="text-xs text-[#7A7269] leading-snug font-light">
                    Dapatkan 1 minuman kurasi gratis setiap 10 cangkir kopi yang dipesan.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F3EFEA] border border-[#D8D0C8] space-y-2 flex flex-col items-center justify-center text-center">
                  <Heart size={22} className="text-[#7E4124]" />
                  <h4 className="font-display font-bold uppercase tracking-tight text-base text-[#010101]">
                    Menu Favorit
                  </h4>
                  <p className="text-xs text-[#7A7269] leading-snug font-light">
                    Simpan dan pesan kembali racikan kopi serta sajian dapur favorit Anda.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
                <Link
                  href="/sign-in"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#010101] hover:bg-[#7E4124] text-white text-xs uppercase tracking-wider font-bold text-center shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <span>Masuk Akun</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/sign-up"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[#D8D0C8] bg-white hover:bg-[#F3EFEA] text-[#010101] text-xs uppercase tracking-wider font-bold text-center transition-all duration-200 active:scale-95 shadow-2xs"
                >
                  Daftar Jadi Member
                </Link>
              </div>

            </div>

            {/* Preview of the Loyalty Card for Guest */}
            <div className="space-y-3 text-center">
              <span className="text-xs uppercase tracking-widest text-[#7A7269] font-semibold block">
                Pratinjau Kartu Loyalitas Digital
              </span>
              <div className="opacity-80 grayscale-[30%] hover:grayscale-0 transition-all pointer-events-none">
                <LoyaltyCard member={guestCardData} />
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
