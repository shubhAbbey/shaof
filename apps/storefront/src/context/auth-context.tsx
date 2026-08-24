'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CustomerSession } from '@ecom/types';

export interface AuthContextType {
  customer: CustomerSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authView: 'login' | 'register';
  intendedDestination: string | null;
  openLogin: (destination?: string) => void;
  openRegister: (destination?: string) => void;
  closeAuthModal: () => void;
  setAuthView: (view: 'login' | 'register') => void;
  login: (customer: CustomerSession, token: string, destination?: string) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [intendedDestination, setIntendedDestination] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.isAuthenticated && data.customer) {
          setCustomer(data.customer);
          setToken(data.token || null);
        } else {
          setCustomer(null);
          setToken(null);
        }
      }
    } catch {
      setCustomer(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const openLogin = useCallback((destination?: string) => {
    if (destination) {
      const safePath = destination.startsWith('/') && !destination.startsWith('//') ? destination : '/';
      setIntendedDestination(safePath);
    }
    setAuthView('login');
    setIsAuthModalOpen(true);
  }, []);

  const openRegister = useCallback((destination?: string) => {
    if (destination) {
      const safePath = destination.startsWith('/') && !destination.startsWith('//') ? destination : '/';
      setIntendedDestination(safePath);
    }
    setAuthView('register');
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(
    (newCustomer: CustomerSession, newToken: string, destination?: string) => {
      setCustomer(newCustomer);
      setToken(newToken);
      setIsAuthModalOpen(false);

      const target = destination || intendedDestination;
      setIntendedDestination(null);

      if (target && typeof window !== 'undefined') {
        const safeTarget = target.startsWith('/') && !target.startsWith('//') ? target : '/';
        if (window.location.pathname !== safeTarget) {
          window.location.href = safeTarget;
        }
      }
    },
    [intendedDestination]
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setCustomer(null);
    setToken(null);
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/account')) {
      window.location.href = '/';
    }
  }, []);

  const value: AuthContextType = {
    customer,
    token,
    isAuthenticated: Boolean(customer),
    isLoading,
    isAuthModalOpen,
    authView,
    intendedDestination,
    openLogin,
    openRegister,
    closeAuthModal,
    setAuthView,
    login,
    logout,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
