import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken, clearToken } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore session from existing JWT
  useEffect(() => {
    const restore = async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const data = await api.get('/api/auth/me');
        setUser({ id: data.id, name: data.name, email: data.email,
                  role: data.role, accessLevel: data.accessLevel,
                  onboardingComplete: data.onboardingComplete });
        setProfile(data.profile || null);
      } catch {
        clearToken(); // Token expired or invalid — clear it
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // Mock Google login — calls our API which creates/finds user in PostgreSQL
  const loginWithGoogle = useCallback(async () => {
    // Mock Google identity (replace with real Google OAuth later)
    const mockEmail = 'student@predoctr.pk';
    const mockName  = 'MDCAT Aspirant';

    const data = await api.post('/api/auth/login', { name: mockName, email: mockEmail });
    setToken(data.token);
    setUser({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      accessLevel: data.user.accessLevel,
      onboardingComplete: data.user.onboardingComplete,
    });
    if (data.user.profile) setProfile(data.user.profile);
    return data.user;
  }, []);

  // Save onboarding profile to PostgreSQL
  const completeOnboarding = useCallback(async (profileData) => {
    const data = await api.post('/api/profile/complete', profileData);
    setProfile(data.profile);
    setUser(prev => ({ ...prev, onboardingComplete: true }));
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
    clearToken();
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
