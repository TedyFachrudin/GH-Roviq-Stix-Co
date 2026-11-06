'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { verifyAdminCredentials, setAdminSession, useAdminAuth } from '@/lib/admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAdmin } = useAdminAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect straight to /admin
  React.useEffect(() => {
    if (isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const isValid = verifyAdminCredentials(identifier, password);

    if (isValid) {
      setAdminSession();
      router.push('/admin');
    } else {
      setErrorMsg('Kredensial tidak valid. Silakan periksa kembali username/email dan kata sandi Anda.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center p-4 sm:p-6">
      
      <div className="w-full max-w-md space-y-6">
        
        {/* Back Link to Store */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#605850] hover:text-[#C2652A] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Toko</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-[#E8E2D9] shadow-xl p-8 sm:p-10 space-y-8">
          
          {/* Header Brand */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#FAF5EE] border border-[#D8D0C8] p-2.5 mx-auto flex items-center justify-center shadow-xs">
              <Image
                src="/logo-gh-roviq.svg"
                alt="GH ROVIQ"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F0E8] border border-[#E8E2D9] text-[#C2652A] text-[10px] font-bold uppercase tracking-widest mb-1.5">
                <ShieldCheck size={12} />
                <span>Portal Developer & Admin</span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-[#3A302A] tracking-tight">
                Masuk Admin GH ROVIQ
              </h1>
              <p className="text-xs text-[#605850] font-sans font-light mt-1">
                Akses terbatas khusus pengelola katalog, stok, dan pesanan real-time.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Identifier input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3A302A] block">
                Username atau Email
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9088]" />
                <input
                  type="text"
                  required
                  placeholder="Roviq atau tumbalstu0@gmail.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#D8D0C8] text-sm text-[#3A302A] placeholder-[#9A9088] focus:outline-none focus:border-[#C2652A] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3A302A] block">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9088]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#D8D0C8] text-sm text-[#3A302A] placeholder-[#9A9088] focus:outline-none focus:border-[#C2652A] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-70 mt-2"
            >
              <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight size={15} />
            </button>

          </form>

          {/* Hint Footer for Developer Reference */}
          <div className="pt-4 border-t border-[#F2ECE4] text-center">
            <p className="text-[11px] text-[#9A9088]">
              Akun resmi developer: <span className="font-mono text-[#3A302A] font-semibold">Roviq</span>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

