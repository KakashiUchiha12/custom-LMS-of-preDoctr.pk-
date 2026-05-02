import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Check local storage for mock session
    const savedUser = localStorage.getItem('predoctr-user');
    const savedProfile = localStorage.getItem('predoctr-profile');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    setLoading(false);
  }, []);

  const loginWithGoogle = () => {
    // Mock Google Login
    const mockUser = { id: '123', email: 'student@example.com', name: 'MDCAT Aspirant' };
    setUser(mockUser);
    localStorage.setItem('predoctr-user', JSON.stringify(mockUser));
  };

  const completeOnboarding = (profileData) => {
    setProfile(profileData);
    localStorage.setItem('predoctr-profile', JSON.stringify(profileData));
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('predoctr-user');
    localStorage.removeItem('predoctr-profile');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
