import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';
import { getToken, setToken, clearToken } from '../api/client';

const AuthContext = createContext(null);

const WEB_DEV_CODE = 'web_dev_login';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mom, setMom] = useState(null);
  const [settings, setSettings] = useState(null);
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);
  const loginPromiseRef = useRef(null);

  const refreshProfile = useCallback(async () => {
    const status = await api.getProfileStatus();
    setMom(status.mom);
    setSettings(status.settings);
    setOnboarded(status.onboarded);
    return status;
  }, []);

  const ensureLogin = useCallback(async () => {
    if (loginPromiseRef.current) return loginPromiseRef.current;

    loginPromiseRef.current = (async () => {
      const token = getToken();
      if (token) {
        try {
          const u = await api.getMe();
          setUser(u);
          return { token, user: u };
        } catch {
          clearToken();
        }
      }

      const data = await api.login(WEB_DEV_CODE);
      setToken(data.token);
      setUser(data.user);
      return data;
    })();

    try {
      return await loginPromiseRef.current;
    } catch (e) {
      loginPromiseRef.current = null;
      throw e;
    }
  }, []);

  useEffect(() => {
    ensureLogin()
      .then(() => refreshProfile())
      .catch((err) => console.error('登录失败', err))
      .finally(() => setLoading(false));
  }, [ensureLogin, refreshProfile]);

  const value = {
    user,
    mom,
    settings,
    onboarded,
    loading,
    ensureLogin,
    refreshProfile,
    setOnboarded,
    setMom,
    setSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRequireOnboarding() {
  const { onboarded, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !onboarded) {
      navigate('/onboarding', { replace: true });
    }
  }, [loading, onboarded, navigate]);

  return { ready: !loading && onboarded };
}
