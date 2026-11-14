import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setAuthToken, type AuthResponse, type User } from './api';
import { readStoredToken, writeStoredToken } from './storage';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: Parameters<typeof api.register>[0]) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyAuth = useCallback(async (response: AuthResponse) => {
    setAuthToken(response.token);
    setToken(response.token);
    setUser(response.user);
    await writeStoredToken(response.token);
  }, []);

  useEffect(() => {
    let active = true;
    async function restore() {
      const stored = await readStoredToken();
      if (!active) return;
      if (!stored) {
        setLoading(false);
        return;
      }
      setAuthToken(stored);
      setToken(stored);
      try {
        const me = await api.me();
        if (active) setUser(me);
      } catch {
        setAuthToken(null);
        if (active) setToken(null);
        await writeStoredToken(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await api.login(identifier.trim(), password);
    await applyAuth(response);
  }, [applyAuth]);

  const register = useCallback(async (payload: Parameters<typeof api.register>[0]) => {
    const response = await api.register(payload);
    await applyAuth(response);
  }, [applyAuth]);

  const logout = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    await writeStoredToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const me = await api.me();
    setUser(me);
  }, [token]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshUser, setUser }),
    [user, token, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return context;
}
