import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/services.js';
import { SESSION_EXPIRED_EVENT, tokenStore } from '../api/client.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (tokenStore.get() ? 'checking' : 'anonymous'));

  useEffect(() => {
    if (status !== 'checking') return;
    authApi
      .me()
      .then((u) => {
        setUser(u);
        setStatus('authenticated');
      })
      .catch(() => {
        tokenStore.clear();
        setStatus('anonymous');
      });
  }, [status]);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setStatus('anonymous');
  }, []);

  useEffect(() => {
    const onExpired = () => {
      if (!tokenStore.get()) return;
      logout();
      toast.info('Tu sesión expiró', 'Volvé a iniciar sesión para continuar.');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [logout, toast]);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await authApi.login(email, password);
    tokenStore.set(token);
    setUser(u);
    setStatus('authenticated');
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const { token, user: u } = await authApi.register(data);
    tokenStore.set(token);
    setUser(u);
    setStatus('authenticated');
    return u;
  }, []);

  const value = useMemo(
    () => ({ user, setUser, status, login, register, logout }),
    [user, status, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
