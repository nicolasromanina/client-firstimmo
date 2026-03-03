import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/authService';
import type { ProfileResponse } from '@/lib/types';

interface AuthContextType {
  user: ProfileResponse | null;
  loading: boolean;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isLocalHost = (host: string): boolean =>
  host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      if (!authService.isAuthenticated()) {
        authService.logout();
        return;
      }
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Local fallback: accept ?token=... after auth redirect on localhost only.
    if (isLocalHost(window.location.hostname)) {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        localStorage.setItem('token', urlToken);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    loadProfile();
  }, []);

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
