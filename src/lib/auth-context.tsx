'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { AuthService } from './auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle inactivity logout - 1 hour timeout
  const handleInactivity = () => {
    console.log('User inactive for 1 hour, logging out...');
    AuthService.logout();
  };

  // Enable inactivity timer only when user is authenticated
  // Timeout: 1 hour (60 minutes) of inactivity - user will be logged out automatically
  useInactivityTimer({
    onInactive: handleInactivity,
    enabled: !!token && !!user,
    timeout: 60 * 60 * 1000 // 1 hour in milliseconds
  });

  useEffect(() => {
    // Check for existing auth on mount
    const storedToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user') || localStorage.getItem('user_data');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Reset activity timer on mount if user is authenticated
        const now = Date.now();
        localStorage.setItem('last_activity_time', now.toString());
      } catch {
        // Error parsing user data, clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Reset activity timer on login
    const now = Date.now();
    localStorage.setItem('last_activity_time', now.toString());
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_data');
    localStorage.removeItem('last_activity_time');
    AuthService.logout();
  };

  const checkAuth = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (!storedToken) return false;
    
    try {
      // Verify token is still valid
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });
      
      if (response.ok) {
        // Reset activity timer on successful auth check
        const now = Date.now();
        localStorage.setItem('last_activity_time', now.toString());
        return true;
      } else {
        logout();
        return false;
      }
    } catch {
      // If verification fails, assume token is valid (offline mode)
      return !!storedToken;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

