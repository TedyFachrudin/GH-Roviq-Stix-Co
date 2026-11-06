'use client';

import { useState, useEffect } from 'react';

export interface AdminUser {
  username: string;
  email: string;
  role: 'admin';
  loggedInAt: string;
}

export const ADMIN_CONFIG = {
  username: 'Roviq',
  email: 'tumbalstu0@gmail.com',
  password: 'GHroviq123',
};

const STORAGE_KEY = 'gh_roviq_admin_session';

/**
 * Validates admin credentials against developer-registered account.
 */
export function verifyAdminCredentials(identifier: string, pass: string): boolean {
  if (!identifier || !pass) return false;
  const cleanId = identifier.trim().toLowerCase();
  const isUsernameMatch = cleanId === ADMIN_CONFIG.username.toLowerCase();
  const isEmailMatch = cleanId === ADMIN_CONFIG.email.toLowerCase();
  const isPasswordMatch = pass === ADMIN_CONFIG.password;

  return (isUsernameMatch || isEmailMatch) && isPasswordMatch;
}

/**
 * Reads existing admin session from localStorage
 */
export function getAdminSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.role === 'admin' && parsed.username === ADMIN_CONFIG.username) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Stores admin session in localStorage
 */
export function setAdminSession(): AdminUser {
  const session: AdminUser = {
    username: ADMIN_CONFIG.username,
    email: ADMIN_CONFIG.email,
    role: 'admin',
    loggedInAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('gh_admin_session_changed'));
  }
  return session;
}

/**
 * Clears admin session
 */
export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('gh_admin_session_changed'));
  }
}

/**
 * React Hook for admin authentication check and real-time state
 */
export function useAdminAuth() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      setAdminUser(getAdminSession());
      setIsLoading(false);
    };

    sync();
    window.addEventListener('gh_admin_session_changed', sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener('gh_admin_session_changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return {
    isAdmin: Boolean(adminUser),
    adminUser,
    isLoading,
    logout: logoutAdmin,
  };
}

