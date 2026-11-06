'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClerkProvider,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  UserButton as ClerkUserButton,
  SignIn as ClerkSignIn,
  SignUp as ClerkSignUp,
  useUser as useClerkUser,
  SignOutButton as ClerkSignOutButton,
} from '@clerk/nextjs';
import { User, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

// Validate whether a genuine Clerk key has been supplied by the user
export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) return false;
  if (key.includes('placeholder') || key.includes('demo') || key.includes('example')) {
    return false;
  }
  if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) {
    return false;
  }
  try {
    const parts = key.split('_');
    if (parts.length < 3) return false;
    const base64Part = parts[2];
    const decoded =
      typeof window !== 'undefined'
        ? atob(base64Part)
        : Buffer.from(base64Part, 'base64').toString('utf-8');
    return decoded.endsWith('$') && decoded.length > 8 && !decoded.includes('demo');
  } catch {
    return false;
  }
}

// Dev Auth Context for graceful preview when Clerk keys are not yet configured
interface DevUser {
  id: string;
  fullName: string;
  firstName: string;
  username?: string | null;
  primaryEmailAddress: { emailAddress: string };
}

interface DevAuthContextType {
  isSignedIn: boolean;
  user: DevUser | null;
  isLoaded: boolean;
  loginAsDemoUser: () => void;
  logout: () => void;
}

const DevAuthContext = createContext<DevAuthContextType>({
  isSignedIn: false,
  user: null,
  isLoaded: true,
  loginAsDemoUser: () => {},
  logout: () => {},
});

export const DevAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const stored = localStorage.getItem('gh_roviq_auth_state');
    if (stored !== null) {
      setIsSignedIn(stored === 'true');
    }
  }, []);

  const loginAsDemoUser = () => {
    setIsSignedIn(true);
    localStorage.setItem('gh_roviq_auth_state', 'true');
  };

  const logout = () => {
    setIsSignedIn(false);
    localStorage.setItem('gh_roviq_auth_state', 'false');
  };

  const user: DevUser | null = isSignedIn
    ? {
        id: 'USR_ROVIQ_2024',
        fullName: 'Roviq Fachrudin',
        firstName: 'Roviq',
        username: 'Roviq',
        primaryEmailAddress: { emailAddress: 'tumbalstu0@gmail.com' },
      }
    : null;

  return (
    <DevAuthContext.Provider value={{ isSignedIn, user, isLoaded, loginAsDemoUser, logout }}>
      {children}
    </DevAuthContext.Provider>
  );
};

// Unified Adaptive Clerk/Dev Provider
export const AppAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hasClerk = isClerkConfigured();

  if (hasClerk) {
    return (
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        appearance={{
          variables: {
            colorPrimary: '#C2652A',
            colorText: '#3A302A',
            colorBackground: '#FAF5EE',
            colorInputBackground: '#FFFFFF',
            colorInputText: '#3A302A',
            borderRadius: '0.75rem',
          },
        }}
      >
        {children}
      </ClerkProvider>
    );
  }

  return <DevAuthProvider>{children}</DevAuthProvider>;
};

// Adaptive useAppUser hook
export function useAppUser() {
  const hasClerk = isClerkConfigured();
  const devAuth = useContext(DevAuthContext);
  
  if (hasClerk) {
    // When real Clerk is active
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useClerkUser();
  }

  return {
    isSignedIn: devAuth.isSignedIn,
    user: devAuth.user,
    isLoaded: devAuth.isLoaded,
  };
}

// Adaptive SignedIn
export const AppSignedIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hasClerk = isClerkConfigured();
  const { isSignedIn } = useContext(DevAuthContext);

  if (hasClerk) {
    return <ClerkSignedIn>{children}</ClerkSignedIn>;
  }

  return isSignedIn ? <>{children}</> : null;
};

// Adaptive SignedOut
export const AppSignedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hasClerk = isClerkConfigured();
  const { isSignedIn } = useContext(DevAuthContext);

  if (hasClerk) {
    return <ClerkSignedOut>{children}</ClerkSignedOut>;
  }

  return !isSignedIn ? <>{children}</> : null;
};

// Adaptive UserButton
export const AppUserButton: React.FC = () => {
  const hasClerk = isClerkConfigured();
  const { logout, user } = useContext(DevAuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (hasClerk) {
    return (
      <ClerkUserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            userButtonAvatarBox: 'w-8 h-8 border border-[#D8D0C8]',
          },
        }}
      />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-[#F6F0E8] border border-[#D8D0C8] hover:border-[#C2652A] transition-colors"
        aria-label="User Menu"
      >
        <div className="w-6 h-6 rounded-full bg-[#3A302A] text-white flex items-center justify-center text-xs font-semibold">
          {user?.firstName?.[0] || 'R'}
        </div>
        <span className="text-xs font-medium text-[#3A302A]">{user?.firstName || 'Roviq'}</span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-[#D8D0C8] shadow-dropdown py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-[#F6F0E8]">
            <p className="text-xs font-bold text-[#3A302A]">{user?.fullName}</p>
            <p className="text-[10px] text-[#9A9088] truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <Link
            href="/profil"
            onClick={() => setDropdownOpen(false)}
            className="block px-3 py-2 text-xs text-[#3A302A] hover:bg-[#F6F0E8] transition-colors"
          >
            Loyalty & Stamp Card
          </Link>
          <button
            onClick={() => {
              logout();
              setDropdownOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-xs text-[#C0392B] hover:bg-[#FCE4E0]/40 flex items-center gap-2 transition-colors"
          >
            <LogOut size={13} />
            <span>Keluar Akun</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Adaptive SignOutButton
export const AppSignOutButton: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hasClerk = isClerkConfigured();
  const { logout } = useContext(DevAuthContext);

  if (hasClerk) {
    return <ClerkSignOutButton>{children}</ClerkSignOutButton>;
  }

  return (
    <span onClick={logout} className="cursor-pointer">
      {children}
    </span>
  );
};

// Adaptive SignIn Form
export const AppSignInForm: React.FC = () => {
  const hasClerk = isClerkConfigured();
  const router = useRouter();
  const { loginAsDemoUser } = useContext(DevAuthContext);
  const [email, setEmail] = useState('tumbalstu0@gmail.com');
  const [password, setPassword] = useState('GHroviq123');

  if (hasClerk) {
    return (
      <ClerkSignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            rootBox: 'w-full flex justify-center',
            card: 'shadow-none p-0 bg-transparent border-0 w-full max-w-sm mx-auto',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            formButtonPrimary:
              'bg-[#C2652A] hover:bg-[#A95420] text-white text-xs uppercase tracking-wider font-semibold py-3 rounded-xl shadow-sm transition-colors',
            formFieldLabel: 'text-xs font-semibold text-[#605850] uppercase tracking-wider',
            formFieldInput:
              'rounded-xl border-[#D8D0C8] bg-[#FAF5EE] text-[#3A302A] text-sm py-2.5 focus:border-[#C2652A] focus:ring-0',
            footerActionLink: 'text-[#C2652A] font-semibold hover:text-[#A95420]',
          },
        }}
      />
    );
  }

  // High-fidelity fallback form directly matching Login Masuk.svg
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        loginAsDemoUser();
        router.push('/profil');
      }}
      className="w-full max-w-sm space-y-4 mx-auto"
    >
      <div className="p-3 bg-[#F7ECE4] border border-[#C2652A]/30 rounded-xl text-xs text-[#3A302A] flex items-start gap-2.5">
        <AlertCircle size={16} className="text-[#C2652A] flex-shrink-0 mt-0.5" />
        <div className="leading-snug">
          <strong>Mode Pratayang:</strong> Clerk publishableKey asli belum dihubungkan di <code className="bg-white/60 px-1 py-0.5 rounded text-[11px]">.env.local</code>. Anda tetap dapat masuk langsung untuk mencoba seluruh fitur.
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[#605850] uppercase tracking-wider block">
          Username / Email
        </label>
        <input
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#D8D0C8] text-sm text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-[#605850] uppercase tracking-wider block">
            Password
          </label>
          <span className="text-[11px] text-[#C2652A] hover:underline cursor-pointer">
            Lupa Password?
          </span>
        </div>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password Anda"
          className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#D8D0C8] text-sm text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3.5 px-4 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs uppercase tracking-wider font-semibold shadow-sm transition-colors mt-2"
      >
        Masuk Sekarang
      </button>

      <div className="pt-2 text-center text-xs text-[#605850]">
        Belum punya akun?{' '}
        <Link href="/sign-up" className="text-[#C2652A] font-semibold hover:underline">
          Daftar di sini
        </Link>
      </div>
    </form>
  );
};

// Adaptive SignUp Form
export const AppSignUpForm: React.FC = () => {
  const hasClerk = isClerkConfigured();
  const router = useRouter();
  const { loginAsDemoUser } = useContext(DevAuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (hasClerk) {
    return (
      <ClerkSignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        appearance={{
          elements: {
            rootBox: 'w-full flex justify-center',
            card: 'shadow-none p-0 bg-transparent border-0 w-full max-w-sm mx-auto',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            formButtonPrimary:
              'bg-[#C2652A] hover:bg-[#A95420] text-white text-xs uppercase tracking-wider font-semibold py-3 rounded-xl shadow-sm transition-colors',
            formFieldLabel: 'text-xs font-semibold text-[#605850] uppercase tracking-wider',
            formFieldInput:
              'rounded-xl border-[#D8D0C8] bg-[#FAF5EE] text-[#3A302A] text-sm py-2.5 focus:border-[#C2652A] focus:ring-0',
            footerActionLink: 'text-[#C2652A] font-semibold hover:text-[#A95420]',
          },
        }}
      />
    );
  }

  // High-fidelity fallback form directly matching Login Daftar Akkun.svg
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        loginAsDemoUser();
        router.push('/profil');
      }}
      className="w-full max-w-sm space-y-4 mx-auto"
    >
      <div className="p-3 bg-[#F7ECE4] border border-[#C2652A]/30 rounded-xl text-xs text-[#3A302A] flex items-start gap-2.5">
        <AlertCircle size={16} className="text-[#C2652A] flex-shrink-0 mt-0.5" />
        <div className="leading-snug">
          <strong>Mode Pratayang:</strong> Clerk publishableKey asli belum dihubungkan di <code className="bg-white/60 px-1 py-0.5 rounded text-[11px]">.env.local</code>. Anda tetap dapat mendaftar langsung untuk menguji fitur kartu loyalitas.
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[#605850] uppercase tracking-wider block">
          Nama Lengkap
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Roviq Fachrudin"
          className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#D8D0C8] text-sm text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[#605850] uppercase tracking-wider block">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#D8D0C8] text-sm text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[#605850] uppercase tracking-wider block">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 8 karakter"
          className="w-full px-4 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#D8D0C8] text-sm text-[#3A302A] focus:outline-none focus:border-[#C2652A]"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3.5 px-4 rounded-xl bg-[#C2652A] hover:bg-[#A95420] text-white text-xs uppercase tracking-wider font-semibold shadow-sm transition-colors mt-2"
      >
        Daftar Jadi Member Sekarang
      </button>

      <div className="pt-2 text-center text-xs text-[#605850]">
        Sudah punya akun?{' '}
        <Link href="/sign-in" className="text-[#C2652A] font-semibold hover:underline">
          Masuk di sini
        </Link>
      </div>
    </form>
  );
};

