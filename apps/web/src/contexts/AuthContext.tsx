'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    const hasToken = document.cookie.includes('token=');
    if (hasToken) {
      setIsAuthenticated(true);
    } else {
      if (pathname !== '/login' && pathname !== '/pos') {
        router.push('/login');
      }
    }
  }, [pathname, router]);

  const login = (pass: string) => {
    // Legacy mock login is no longer used, login is handled by /login page
    return false;
  };

  const logout = () => {
    localStorage.removeItem('arhat_auth_token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsAuthenticated(false);
    router.push('/login');
  };

  if (!isMounted) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
