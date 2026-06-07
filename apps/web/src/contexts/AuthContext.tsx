'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = document.cookie.includes('token=');
      if (hasToken) {
        setIsAuthenticated(true);
        try {
          const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
          const { API_URL } = await import('@/lib/api');
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.data);
          } else {
            // Token invalid
            logout();
          }
        } catch (err) {
          console.error('Failed to fetch user', err);
        }
      } else {
        if (pathname !== '/login' && pathname !== '/pos' && !pathname.startsWith('/auth/')) {
          router.push('/login');
        }
      }
    };
    
    checkAuth();
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
