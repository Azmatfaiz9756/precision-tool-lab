// AuthContext.jsx — Firebase-powered authentication context
// Uses Firebase onAuthStateChanged as the single source of truth for auth state.

import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthChange, logout as firebaseLogout } from '@/lib/firebaseAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]                               = useState(null);
  const [isAuthenticated, setIsAuthenticated]         = useState(false);
  const [isLoadingAuth, setIsLoadingAuth]             = useState(true);   // true until Firebase resolves
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError]                     = useState(null);
  const [authChecked, setAuthChecked]                 = useState(false);
  const [appPublicSettings, setAppPublicSettings]     = useState({ id: 'app-public', public_settings: {} });

  useEffect(() => {
    // Subscribe to Firebase auth state — fires immediately with current user or null
    const unsubscribe = onAuthChange((normalizedUser) => {
      setUser(normalizedUser);
      setIsAuthenticated(!!normalizedUser);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      setAuthError(null);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const logout = async (shouldRedirect = true) => {
    try {
      await firebaseLogout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  };

  // Kept for compatibility — Firebase handles re-auth automatically via the listener
  const checkUserAuth = () => {};
  const checkAppState = () => {};

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
