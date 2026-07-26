import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loginRequest, logoutRequest, registerRequest, type LoginPayload, type RegisterPayload } from '../api/authService';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/constants';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (credentials: LoginPayload) => Promise<User>;
  register: (details: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(AUTH_TOKEN_KEY));
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // sessionStorage already has whatever survived a page refresh; it clears on
  // tab close, which is the intended behavior here (swap for localStorage if
  // you want the session to persist across browser restarts).
  useEffect(() => {
    setIsBootstrapping(false);
  }, []);

  // If any API call gets a 401, http.ts dispatches this event so every
  // consumer of the auth state clears itself out immediately.
  useEffect(() => {
    function handleExpired() {
      setUser(null);
      setToken(null);
    }
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const persistSession = useCallback((nextUser: User, nextToken: string) => {
    sessionStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setToken(nextToken);
  }, []);

  const login = useCallback(
    async (credentials: LoginPayload) => {
      const { data } = await loginRequest(credentials);
      persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession]
  );

  // Signup only creates the account — it doesn't return a session. The user
  // is sent to /login to sign in afterwards.
  const register = useCallback(async (details: RegisterPayload) => {
    await registerRequest(details);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [user, token, isBootstrapping, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
