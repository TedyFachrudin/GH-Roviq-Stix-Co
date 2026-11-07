'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  RefreshCw,
  Award,
  Coffee,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Gift,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheck,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/admin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  fetchMembersFromCloud,
  adminUpdateMemberStamps,
  adminDeleteMember,
  ExtendedMemberProfile,
} from '@/lib/member';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { Avatar, AvatarFallback, AvatarImage, CustomBadge } from '@/components/ui/avatar';

function getInitials(name: string): string {
  if (!name) return 'GH';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminMemberPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdminAuth();

  const [members, setMembers] = useState<ExtendedMemberProfile[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Draft stamp edits keyed by member ID
  const [draftStamps, setDraftStamps] = useState<Record<string, number>>({});

  // Protect Admin route
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isLoading, isAdmin, router]);

  const loadMembers = async () => {
    try {
      const data = await fetchMembersFromCloud();
      setMembers(data);
      // Initialize draft stamps
      const drafts: Record<string, number> = {};
      data.forEach((m) => {
        drafts[m.id] = m.stamps;
      });
      setDraftStamps((prev) => ({ ...drafts, ...prev }));
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadMembers();

    // Listen to local update events
    const handleLocalUpdate = () => loadMembers();
    window.addEventListener('gh_member_stamps_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    // Supabase Realtime subscription on members table
    let channel: any = null;
    if (isSupabaseConfigured()) {
      channel = supabase
        .channel('admin_members_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'members' },
          () => {
            loadMembers();
          }
        )
        .subscribe();
    }

    // Polling fallback every 8 seconds
    const interval = setInterval(() => {
      loadMembers();
    }, 8000);

    return () => {
      window.removeEventListener('gh_member_stamps_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
      if (channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(interval);
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadMembers();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  // Adjust draft stamp in UI
  const handleDraftChange = (memberId: string, currentVal: number, delta: number) => {
    const cur = draftStamps[memberId] !== undefined ? draftStamps[memberId] : currentVal;
    const nextVal = Math.max(0, Math.min(10, cur + delta));
    setDraftStamps((prev) => ({ ...prev, [memberId]: nextVal }));
  };

  // Save / Confirm stamps to cloud & sync with member profile
  const handleConfirmStamps = async (member: ExtendedMemberProfile) => {
    const targetStamps =
      draftStamps[member.id] !== undefined ? draftStamps[member.id] : member.stamps;
    setSavingId(member.id);

    try {
      await adminUpdateMemberStamps(member.id, member.clerkId, targetStamps);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id
            ? {
                ...m,
                stamps: targetStamps,
                tier: targetStamps >= 10 ? 'Gold' : 'Artisan Club',
              }
            : m
        )
      );
      showToast(
        `Stamp anggota ${member.name} (${member.id}) berhasil dikonfirmasi menjadi ${targetStamps} stamp dan tersinkronisasi ke akun member!`
      );
    } finally {
      setSavingId(null);
    }
  };

  // Quick action: +1 Stamp langsung
  const handleQuickAddOne = async (member: ExtendedMemberProfile) => {
    const nextVal = Math.min(10, member.stamps + 1);
    setSavingId(member.id);
    try {
      await adminUpdateMemberStamps(member.id, member.clerkId, nextVal);
      setDraftStamps((prev) => ({ ...prev, [member.id]: nextVal }));
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id
            ? {
                ...m,
                stamps: nextVal,
                tier: nextVal >= 10 ? 'Gold' : 'Artisan Club',
              }
            : m
        )
      );
      showToast(`+1 Stamp berhasil ditambahkan untuk ${member.name}! Total: ${nextVal}/10`);
    } finally {
      setSavingId(null);
    }
  };

  // Reset stamps to 0 (after claiming reward)
  const handleResetStamps = async (member: ExtendedMemberProfile) => {
    if (
      confirm(
        `Reset stamp anggota ${member.name} (${member.id}) kembali ke 0?\n(Gunakan jika pelanggan telah menukarkan reward 1 Kopi Gratis).`
      )
    ) {
      setSavingId(member.id);
      try {
        await adminUpdateMemberStamps(member.id, member.clerkId, 0);
        setDraftStamps((prev) => ({ ...prev, [member.id]: 0 }));
        setMembers((prev) =>
          prev.map((m) =>
            m.id === member.id
              ? {
                  ...m,
                  stamps: 0,
                  tier: 'Artisan Club',
                }
              : m
          )
        );
        showToast(`Stamp anggota ${member.name} berhasil di-reset ke 0.`);
      } finally {
        setSavingId(null);
      }
    }
  };

  // Delete member
  const handleDeleteMember = async (member: ExtendedMemberProfile) => {
    if (
      confirm(
        `Hapus data anggota member ${member.name} (${member.id}) secara permanen dari sistem?`
      )
    ) {
      await adminDeleteMember(member.id, member.clerkId);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      showToast(`Anggota ${member.name} telah dihapus.`);
    }
  };

  // Metrics
  const totalMembers = members.length;
  const totalStampsIssued = members.reduce((acc, m) => acc + (m.stamps || 0), 0);
  const eligibleRewardCount = members.filter((m) => m.stamps >= 10).length;

  // Filter & Search
  const filteredMembers = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return members.filter((m) => {
      if (
        !m ||
        m.id.startsWith('SYSTEM') ||
        m.name === '__DELETED__' ||
        m.email === 'tumbalstu0@gmail.com' ||
        m.email === 'deleted@system.local'
      ) {
        return false;
      }
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q);

      return matchSearch;
    });
  }, [members, searchQuery]);

  // Pagination (10 members per page)
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMembers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMembers, currentPage]);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-2 border-[#C2652A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#9A9088] uppercase tracking-widest font-semibold">
            Memuat Manajemen Anggota Member...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5EE] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl space-y-8">
        
        {/* Toast Notifikasi Sukses */}
        {toastMsg && (
          <div className="fixed top-5 right-5 z-50 max-w-md bg-[#3A302A] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200 border border-white/10">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check size={16} />
            </div>
            <p className="text-xs font-medium leading-relaxed">{toastMsg}</p>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F6F0E8] border border-[#E8E2D9] text-[#C2652A] text-[11px] font-semibold tracking-wider uppercase">
              <ShieldCheck size={13} />
              <span>Loyalty & Keanggotaan</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A302A] tracking-tight">
              Anggota Member
            </h1>
            <p className="text-xs sm:text-sm text-[#605850] font-sans font-light">
              Kelola data anggota terdaftar, pantau koleksi stamp reward, dan konfirmasi perolehan stamp secara langsung.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleManualRefresh}
              className="px-4 py-2 rounded-xl bg-[#F2ECE4] hover:bg-[#E8E2D9] border border-[#D8D0C8] text-xs font-semibold text-[#3A302A] flex items-center gap-2 transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <RefreshCw
                size={14}
                className={`text-[#C2652A] ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total Anggota */}
          <div className="p-6 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9088]">
                Total Anggota
              </span>
              <Users size={18} className="text-[#C2652A]" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#3A302A]">
              {totalMembers}
            </div>
            <div className="text-xs text-[#605850] space-y-0.5">
              <p className="font-semibold text-[#3A302A]">Member Terdaftar</p>
              <p className="text-[11px] text-[#9A9088]">Akun member aktif GH ROVIQ</p>
            </div>
          </div>

          {/* Card 2: Total Stamp Diberikan */}
          <div className="p-6 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2652A]">
                Stamp Terkumpul
              </span>
              <Award size={18} className="text-[#C2652A]" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#C2652A]">
              {totalStampsIssued}
            </div>
            <div className="text-xs text-[#605850] space-y-0.5">
              <p className="font-semibold text-[#3A302A]">Total Stamp Aktif</p>
              <p className="text-[11px] text-[#9A9088]">Tersinkronisasi di kartu member</p>
            </div>
          </div>

          {/* Card 3: Siap Klaim Kopi Gratis (10 Stamp) */}
          <div className="p-6 rounded-2xl bg-[#F6F0E8] border border-[#E8E2D9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Reward Siap Klaim
              </span>
              <Gift size={18} className="text-emerald-600" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-emerald-700">
              {eligibleRewardCount}
            </div>
            <div className="text-xs text-[#605850] space-y-0.5">
              <p className="font-semibold text-[#3A302A]">Mencapai 10 Stamp</p>
              <p className="text-[11px] text-[#9A9088]">Berhak atas 1 Kopi Artisan Gratis</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9088]"
            />
            <input
              type="text"
              placeholder="Cari nama, ID (GH-001), email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF5EE] border border-[#D8D0C8] text-xs text-[#3A302A] placeholder-[#9A9088] focus:outline-none focus:border-[#C2652A]"
            />
          </div>
        </div>

        {/* Member List / Table */}
        {isFetching ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#C2652A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#9A9088] font-semibold">Memuat data anggota member...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto space-y-3 bg-white rounded-3xl border border-[#E8E2D9] p-8">
            <div className="w-14 h-14 rounded-full bg-[#F6F0E8] border border-[#E8E2D9] flex items-center justify-center text-[#9A9088] mx-auto">
              <Users size={24} />
            </div>
            <h4 className="font-serif text-base font-bold text-[#3A302A]">
              Tidak Ada Anggota Ditemukan
            </h4>
            <p className="text-xs text-[#605850]">
              {searchQuery
                ? `Tidak ada member dengan kata kunci "${searchQuery}".`
                : 'Belum ada anggota yang terdaftar sebagai member saat ini.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cards for each member */}
            <div className="grid grid-cols-1 gap-4">
              {paginatedMembers.map((member) => {
                const currentDraft =
                  draftStamps[member.id] !== undefined
                    ? draftStamps[member.id]
                    : member.stamps;
                const hasChanges = currentDraft !== member.stamps;
                const isSaving = savingId === member.id;

                return (
                  <div
                    key={member.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E2D9] hover:border-[#D8D0C8] shadow-xs space-y-5 transition-all"
                  >
                    {/* Top Row: Identity & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F6F0E8]">
                      <div className="flex items-center gap-3.5">
                        <Avatar size="lg" className="relative shrink-0">
                          <AvatarFallback className="bg-[#F6F0E8] border border-[#E8E2D9] text-[#C2652A] font-bold text-sm">
                            {getInitials(member.name)}
                          </AvatarFallback>
                          <span className="absolute -bottom-0.5 -right-0.5">
                            <CustomBadge />
                          </span>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-base font-bold text-[#3A302A]">
                              {member.name}
                            </h3>
                            <span className="text-[11px] font-mono font-bold text-[#C2652A] px-2 py-0.5 rounded-md bg-[#FAF5EE] border border-[#E8E2D9]">
                              {member.id}
                            </span>
                          </div>
                          <p className="text-xs text-[#9A9088]">
                            {member.email} {member.phone && member.phone !== '-' ? `• ${member.phone}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="text-[11px] text-[#9A9088]">
                          Bergabung: {member.joinDate}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member)}
                          className="p-1.5 rounded-lg text-[#9A9088] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer ml-1"
                          title="Hapus member ini"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Visual Stamps & Reward Status */}
                    <div className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#3A302A]">
                            Koleksi Stamp Digital:
                          </span>
                          <span className="font-bold text-[#C2652A]">
                            {member.stamps} / 10 Stamp
                          </span>
                        </div>
                        {member.stamps >= 10 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            <Sparkles size={12} />
                            <span>Kupon 1 Kopi Gratis Siap Digunakan!</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#9A9088]">
                            Butuh {10 - member.stamps} stamp lagi untuk reward kopi gratis
                          </span>
                        )}
                      </div>

                      {/* 10 Visual Stamp Dots matching Member Card */}
                      <div className="grid grid-cols-10 gap-1.5 sm:gap-2.5 p-3 rounded-xl bg-[#FAF5EE] border border-[#E8E2D9]">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((stampNum) => {
                          const isCollected = stampNum <= member.stamps;
                          return (
                            <div
                              key={stampNum}
                              className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                                isCollected
                                  ? 'bg-[#C2652A] text-white shadow-2xs font-bold'
                                  : 'bg-white border border-[#D8D0C8] text-[#D8D0C8]'
                              }`}
                              title={`Stamp ke-${stampNum}`}
                            >
                              <Coffee size={14} className={isCollected ? 'text-white' : 'text-[#D8D0C8]'} />
                              <span className="text-[9px] mt-0.5">{stampNum}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Row: Stamp Management & Confirmation Actions */}
                    <div className="pt-3 border-t border-[#F6F0E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Adjuster */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-[#605850]">
                          Ubah Stamp:
                        </span>
                        <div className="flex items-center rounded-xl border border-[#D8D0C8] bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleDraftChange(member.id, member.stamps, -1)}
                            disabled={currentDraft <= 0}
                            className="p-2 text-[#605850] hover:text-[#3A302A] hover:bg-[#FAF5EE] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Kurangi 1 stamp"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="px-3.5 py-1 text-xs font-bold text-[#3A302A] min-w-8 text-center">
                            {currentDraft}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDraftChange(member.id, member.stamps, 1)}
                            disabled={currentDraft >= 10}
                            className="p-2 text-[#605850] hover:text-[#3A302A] hover:bg-[#FAF5EE] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Tambah 1 stamp"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Tombol Konfirmasi Perubahan */}
                        <button
                          type="button"
                          onClick={() => handleConfirmStamps(member)}
                          disabled={!hasChanges || isSaving}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                            hasChanges
                              ? 'bg-[#C2652A] hover:bg-[#A95420] text-white active:scale-95 ring-2 ring-[#C2652A]/20'
                              : 'bg-[#F2ECE4] text-[#9A9088] cursor-not-allowed border border-[#E8E2D9]'
                          }`}
                        >
                          {isSaving ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Konfirmasi Stamp</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickAddOne(member)}
                          disabled={member.stamps >= 10 || isSaving}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-[#FAF5EE] border border-[#D8D0C8] hover:border-[#C2652A] text-xs font-semibold text-[#C2652A] flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                          title="Tambah 1 stamp dan langsung simpan ke akun member"
                        >
                          <Plus size={13} />
                          <span>+1 Stamp Cepat</span>
                        </button>

                        {member.stamps > 0 && (
                          <button
                            type="button"
                            onClick={() => handleResetStamps(member)}
                            disabled={isSaving}
                            className="px-3 py-2 rounded-xl bg-white hover:bg-amber-50 border border-[#D8D0C8] hover:border-amber-300 text-xs font-semibold text-[#605850] hover:text-amber-800 flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
                            title="Reset stamp ke 0 saat reward kopi gratis sudah diklaim"
                          >
                            <RotateCcw size={12} />
                            <span>Reset (0)</span>
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8E2D9]">
                <p className="text-xs text-[#605850]">
                  Menampilkan <span className="font-semibold text-[#3A302A]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> -{' '}
                  <span className="font-semibold text-[#3A302A]">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)}
                  </span>{' '}
                  dari <span className="font-semibold text-[#3A302A]">{filteredMembers.length}</span> anggota
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
      </main>
    </div>
  );
}

