import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { getAuthMe, logoutSession, type AuthMe } from "../../lib/api.ts";
import { isConsoleAdmin } from "./admin.ts";

interface AuthState {
  me: AuthMe | null;
  loading: boolean;
  reload: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  me: null,
  loading: true,
  reload: async () => undefined,
  logout: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [me, setMe] = useState<AuthMe | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setMe(await getAuthMe());
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } finally {
      setMe(null);
    }
  }, []);

  const value = useMemo(() => ({ me, loading, reload, logout }), [loading, logout, me, reload]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function RequireAuth({ children }: { children: ReactNode }): ReactNode {
  const { me, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return null;
  }
  if (!me) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }
  return children;
}

export function RequireAdmin({ children }: { children: ReactNode }): ReactNode {
  const { me, loading } = useAuth();
  if (loading) {
    return null;
  }
  if (!isConsoleAdmin(me)) {
    return <Navigate to="/home" replace />;
  }
  return children;
}
