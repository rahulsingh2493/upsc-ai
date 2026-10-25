import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import { setToken, setUnauthorizedHandler } from '../api/client';
import type { AuthResponse, User } from '../types';

interface Session { token: string; user: User }
interface AuthValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const KEY = 'upscdesk:session';
const Ctx = createContext<AuthValue | null>(null);

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    const s = raw ? (JSON.parse(raw) as Session) : null;
    setToken(s?.token ?? null);
    return s;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession);

  const logout = useCallback(() => {
    setToken(null);
    try { sessionStorage.removeItem(KEY); } catch { /* storage unavailable */ }
    window.google?.accounts.id.disableAutoSelect();
    setSession(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const accept = useCallback((r: AuthResponse) => {
    const s = { token: r.access_token, user: r.user };
    setToken(s.token);
    try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
    setSession(s);
  }, []);

  const value = useMemo<AuthValue>(() => ({
    user: session?.user ?? null,
    login: async (e, p) => accept(await authApi.login(e, p)),
    register: async (n, e, p) => accept(await authApi.register(n, e, p)),
    loginWithGoogle: async (c) => accept(await authApi.loginWithGoogle(c)),
    logout,
  }), [session, accept, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
