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
    const key = 'gh_roviq_member_registry';
    const stored = localStorage.getItem(key);
    let registry: string[] = stored ? JSON.parse(stored) : [];

    let index = registry.indexOf(userId);
    if (index === -1) {
      registry.push(userId);
      localStorage.setItem(key, JSON.stringify(registry));
      index = registry.length - 1;
    }

    // Queue number starting from 001, formatted as 3-digit padded number
    const queueNumber = String(index + 1).padStart(3, '0');
    return `GH-${queueNumber}`;
  } catch {
    return 'GH-001';
  }
}

