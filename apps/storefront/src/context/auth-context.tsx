'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CustomerSession } from '@ecom/types';

export type AuthModalView = 'login' | 'register';

export interface AuthContextType {
  customer: CustomerSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authView: AuthModalView;
  authMobile?: string;
  intendedDestination: string;
  openLogin: (destination?: string, mobile?: string) => void;
  openRegister: (destination?: string, mobile?: string) => void;
  closeAuthModal: () => void;
  login: (customer: CustomerSession, token?: string, destination?: string) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function safeDestination(url?: string): string {
  if (!url || typeof url !== 'string') return '/';
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) {
    return url;
  }
  return '/';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authView, setAuthView] = useState<AuthModalView>('login');
  const [authMobile, setAuthMobile] = useState<string | undefined>(undefined);
  const [intendedDestination, setIntendedDestination] = useState<string>('/');

  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isAuthenticated && data.customer) {
          setCustomer(data.customer);
        } else {
          setCustomer(null);
        }
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const openLogin = useCallback((destination?: string, mobile?: string) => {
    setIntendedDestination(safeDestination(destination));
    if (mobile) setAuthMobile(mobile);
    setAuthView('login');
    setIsAuthModalOpen(true);
  }, []);

  const openRegister = useCallback((destination?: string, mobile?: string) => {
    setIntendedDestination(safeDestination(destination));
    if (mobile) setAuthMobile(mobile);
    setAuthView('register');
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthMobile(undefined);
  }, []);

  const login = useCallback(
    (newCustomer: CustomerSession, token?: string, destination?: string) => {
      setCustomer(newCustomer);
      setIsAuthModalOpen(false);
      setAuthMobile(undefined);
      const target = safeDestination(destination || intendedDestination);
      if (typeof window !== 'undefined' && target && target !== window.location.pathname) {
        window.location.href = target;
      }
    },
    [intendedDestination]
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      setCustomer(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (e) {
      console.error('[AuthContext] logout error:', e);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: Boolean(customer),
        isLoading,
        isAuthModalOpen,
        authView,
        authMobile,
        intendedDestination,
        openLogin,
        openRegister,
        closeAuthModal,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
