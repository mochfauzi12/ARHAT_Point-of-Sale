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
    const auth = localStorage.getItem('arhat_auth_token');
    if (auth === 'valid') {
      setIsAuthenticated(true);
    } else {
      if (pathname !== '/login' && pathname !== '/pos') {
        router.push('/login');
      }
    }
  }, [pathname, router]);

  const login = (pass: string) => {
    // Simple password for MVP
    if (pass === 'admin123') {
      localStorage.setItem('arhat_auth_token', 'valid');
      setIsAuthenticated(true);
      router.push('/products');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('arhat_auth_token');
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
