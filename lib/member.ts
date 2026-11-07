import { MemberProfile } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const MEMBER_REGISTRY_KEY = 'gh_roviq_member_registry';
const MEMBER_LOCAL_CACHE_KEY = 'gh_roviq_members_cache_v1';

export interface ExtendedMemberProfile extends MemberProfile {
  clerkId?: string | null;
  createdAt?: string;
}

/**
 * Helper to manage member registration queue number and loyalty data.
 * Format: ID: GH-001, GH-002, etc. (for registered members)
 * and ID: GH-000 (for guest / preview).
 */
export function getMemberQueueId(userId?: string | null, isGuest: boolean = false): string {
  if (isGuest || !userId) {
    return 'GH-000';
  }

  if (typeof window === 'undefined') {
    return 'GH-001';
  }

  try {
    const stored = localStorage.getItem(MEMBER_REGISTRY_KEY);
    let registry: string[] = stored ? JSON.parse(stored) : [];

    let index = registry.indexOf(userId);
    if (index === -1) {
      registry.push(userId);
      localStorage.setItem(MEMBER_REGISTRY_KEY, JSON.stringify(registry));
      index = registry.length - 1;
    }

    // Queue number starting from 001, formatted as 3-digit padded number
    const queueNumber = String(index + 1).padStart(3, '0');
    return `GH-${queueNumber}`;
  } catch {
    return 'GH-001';
  }
}

/**
 * Fetches all registered members from Supabase (with localStorage fallback).
 * Used by the Admin to view and manage members.
 */
export async function fetchMembersFromCloud(): Promise<ExtendedMemberProfile[]> {
  const localList = getLocalCachedMembers();

  if (!isSupabaseConfigured()) {
    return localList;
  }

  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .neq('member_id', 'SYSTEM-CATALOG')
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.warn('Gagal mengambil data member dari Supabase:', error?.message);
      return localList;
    }

    const mapped: ExtendedMemberProfile[] = data.map((row) => {
      const stamps = Math.max(0, Math.min(10, Number(row.stamps) || 0));
      return {
        id: String(row.member_id || 'GH-001'),
        clerkId: row.clerk_id || null,
        name: String(row.name || 'Anggota Member'),
        email: String(row.email || '-'),
        phone: String(row.phone || '-'),
        tier: (row.tier as any) || (stamps >= 10 ? 'Gold' : 'Artisan Club'),
        stamps,
        points: Number(row.points) || 0,
        joinDate: row.created_at
          ? new Date(row.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : 'November 2026',
        createdAt: row.created_at,
      };
    });

    saveLocalCachedMembers(mapped);
    return mapped;
  } catch (err) {
    console.error('Error fetchMembersFromCloud:', err);
    return localList;
  }
}

/**
 * Updates member stamps in Supabase & local storage, syncing in real-time to member's account.
 */
export async function adminUpdateMemberStamps(
  memberId: string,
  clerkId: string | null | undefined,
  newStamps: number
): Promise<boolean> {
  const safeStamps = Math.max(0, Math.min(10, newStamps));
  const newTier = safeStamps >= 10 ? 'Gold' : 'Artisan Club';

  // 1. Update local cache
  const cached = getLocalCachedMembers();
  const index = cached.findIndex(
    (m) => m.id === memberId || (clerkId && m.clerkId === clerkId)
  );
  if (index !== -1) {
    cached[index].stamps = safeStamps;
    cached[index].tier = newTier;
    saveLocalCachedMembers([...cached]);
  }

  // 2. Update local user key if clerkId is available
  if (typeof window !== 'undefined' && clerkId) {
    try {
      localStorage.setItem(`gh_stamps_${clerkId}`, String(safeStamps));
    } catch {}
  }

  // Also save a fallback override by memberId
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`gh_member_stamp_override_${memberId}`, String(safeStamps));
      // Dispatch custom event to notify all components and tabs
      window.dispatchEvent(
        new CustomEvent('gh_member_stamps_updated', {
          detail: { memberId, clerkId, stamps: safeStamps },
        })
      );
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  // 3. Update Supabase
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('members')
        .update({ stamps: safeStamps, tier: newTier });

      if (clerkId) {
        query = query.or(`member_id.eq.${memberId},clerk_id.eq.${clerkId}`);
      } else {
        query = query.eq('member_id', memberId);
      }

      const { error } = await query;
      if (error) {
        console.warn('Supabase update member stamps error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exception update member stamps:', err);
      return false;
    }
  }

  return true;
}

/**
 * Deletes a member record from Supabase & local cache.
 */
export async function adminDeleteMember(memberId: string, clerkId?: string | null): Promise<boolean> {
  const cached = getLocalCachedMembers();
  const filtered = cached.filter((m) => m.id !== memberId && (!clerkId || m.clerkId !== clerkId));
  saveLocalCachedMembers(filtered);

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('members').delete();
      if (clerkId) {
        query = query.or(`member_id.eq.${memberId},clerk_id.eq.${clerkId}`);
      } else {
        query = query.eq('member_id', memberId);
      }
      await query;
    } catch (err) {
      console.error('Error delete member from Supabase:', err);
      return false;
    }
  }

  return true;
}

/**
 * Syncs the currently logged-in member with Supabase.
 * If this member is opening /profil for the first time, registers them in Supabase.
 * Returns the latest verified stamp count & member data from the cloud.
 */
export async function syncCurrentMember(user: any): Promise<{
  memberId: string;
  stamps: number;
  points: number;
  tier: 'Regular' | 'Silver' | 'Gold' | 'Artisan Club';
}> {
  if (!user?.id) {
    return { memberId: 'GH-000', stamps: 0, points: 0, tier: 'Regular' };
  }

  const generatedId = getMemberQueueId(user.id, false);
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.email ||
    'member@ghroviq.com';
  const name =
    user?.username ||
    user?.fullName ||
    user?.firstName ||
    'Sahabat Seduh';
  const phone =
    user?.primaryPhoneNumber?.phoneNumber ||
    user?.phone ||
    '-';

  // Read local stamp fallback
  let localStamps = 0;
  let localPoints = 0;
  if (typeof window !== 'undefined') {
    try {
      const s = localStorage.getItem(`gh_stamps_${user.id}`);
      const p = localStorage.getItem(`gh_points_${user.id}`);
      if (s !== null) localStamps = Number(s);
      if (p !== null) localPoints = Number(p);
    } catch {}
  }

  if (!isSupabaseConfigured()) {
    return {
      memberId: generatedId,
      stamps: localStamps,
      points: localPoints,
      tier: localStamps >= 10 ? 'Gold' : 'Artisan Club',
    };
  }

  try {
    // 1. Check if member already exists in Supabase
    const { data: existing, error: selectErr } = await supabase
      .from('members')
      .select('*')
      .or(`clerk_id.eq.${user.id},email.eq.${email}`)
      .neq('member_id', 'SYSTEM-CATALOG')
      .maybeSingle();

    if (existing && !selectErr) {
      // Member found! Use cloud values as verified source of truth
      const cloudStamps = Math.max(0, Math.min(10, Number(existing.stamps) || 0));
      const cloudPoints = Number(existing.points) || 0;
      const verifiedId = existing.member_id || generatedId;
      const verifiedTier =
        (existing.tier as any) || (cloudStamps >= 10 ? 'Gold' : 'Artisan Club');

      // Sync down to local storage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`gh_stamps_${user.id}`, String(cloudStamps));
          localStorage.setItem(`gh_points_${user.id}`, String(cloudPoints));
        } catch {}
      }

      return {
        memberId: verifiedId,
        stamps: cloudStamps,
        points: cloudPoints,
        tier: verifiedTier,
      };
    }

    // 2. Member doesn't exist yet in Supabase -> Auto-register this member
    const newTier = localStamps >= 10 ? 'Gold' : 'Artisan Club';
    const { data: inserted, error: insertErr } = await supabase
      .from('members')
      .insert({
        member_id: generatedId,
        clerk_id: user.id,
        name,
        email,
        phone,
        tier: newTier,
        stamps: localStamps,
        points: localPoints,
      })
      .select()
      .maybeSingle();

    if (inserted && !insertErr) {
      return {
        memberId: inserted.member_id,
        stamps: inserted.stamps,
        points: inserted.points,
        tier: inserted.tier as any,
      };
    }

    return {
      memberId: generatedId,
      stamps: localStamps,
      points: localPoints,
      tier: newTier,
    };
  } catch (err) {
    console.warn('syncCurrentMember error:', err);
    return {
      memberId: generatedId,
      stamps: localStamps,
      points: localPoints,
      tier: localStamps >= 10 ? 'Gold' : 'Artisan Club',
    };
  }
}

/**
 * Local cache helpers for offline & SSR safety
 */
function getLocalCachedMembers(): ExtendedMemberProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MEMBER_LOCAL_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCachedMembers(list: ExtendedMemberProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMBER_LOCAL_CACHE_KEY, JSON.stringify(list));
  } catch {}
}
