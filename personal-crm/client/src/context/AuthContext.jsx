import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('crm-user') || 'null'); } catch { return null; }
  });
  const [checking, setChecking] = useState(Boolean(localStorage.getItem('crm-token')));

  useEffect(() => {
    const signOut = () => {
      localStorage.removeItem('crm-token');
      localStorage.removeItem('crm-user');
      setUser(null);
      setChecking(false);
    };
    window.addEventListener('crm:unauthorized', signOut);
    if (localStorage.getItem('crm-token')) {
      api.me().then(({ user: current }) => {
        setUser(current);
        localStorage.setItem('crm-user', JSON.stringify(current));
      }).catch(signOut).finally(() => setChecking(false));
    }
    return () => window.removeEventListener('crm:unauthorized', signOut);
  }, []);

  const value = useMemo(() => ({
    user,
    checking,
    authenticate: result => {
      localStorage.setItem('crm-token', result.token);
      localStorage.setItem('crm-user', JSON.stringify(result.user));
      setUser(result.user);
    },
    updateUser: next => {
      localStorage.setItem('crm-user', JSON.stringify(next));
      setUser(next);
    },
    logout: () => {
      localStorage.removeItem('crm-token');
      localStorage.removeItem('crm-user');
      setUser(null);
    }
  }), [user, checking]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
