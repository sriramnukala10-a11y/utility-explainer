'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthSession } from '@/lib/types';

interface AuthContextType {
  user: AuthSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoUser: (role: 'CUSTOMER' | 'ADMIN' | 'CUSTOMER_2') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  switchDemoUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        // Fallback default demo user (Priya Sharma)
        setUser({
          userId: 'usr_priya_01',
          email: 'priya.sharma@example.com',
          name: 'Priya Sharma (Demo)',
          phone: '+91 98765 43210',
          role: 'CUSTOMER',
        });
      }
    } catch {
      setUser({
        userId: 'usr_priya_01',
        email: 'priya.sharma@example.com',
        name: 'Priya Sharma (Demo)',
        phone: '+91 98765 43210',
        role: 'CUSTOMER',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Authentication failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login network error' };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const switchDemoUser = async (target: 'CUSTOMER' | 'ADMIN' | 'CUSTOMER_2') => {
    let email = 'priya.sharma@example.com';
    let password = 'UtilityPass123!';
    if (target === 'ADMIN') {
      email = 'admin@utilityservice.gov';
      password = 'UtilityPass123!';
    } else if (target === 'CUSTOMER_2') {
      email = 'rahul.verma@example.com';
      password = 'UtilityPass123!';
    }
    await login(email, password);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
