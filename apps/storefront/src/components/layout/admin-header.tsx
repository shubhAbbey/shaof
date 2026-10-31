'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, Package, ClipboardCheck, LogOut, Menu, X, Boxes, ShoppingBag } from 'lucide-react';

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Merchant Review', href: '/admin/merchants', icon: Users },
  { label: 'Product Catalog', href: '/admin/products', icon: Package },
  { label: 'Moderation Queue', href: '/admin/moderation', icon: ClipboardCheck },
  { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
];

export function AdminHeader() {
  const pathname = usePathname() || '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthPage = pathname === '/admin/login';

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('ecom_admin_token') : null;
      await fetch('/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
    } catch (err) {
      console.error('Super Admin sign out error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ecom_admin_token');
        localStorage.removeItem('ecom_admin_token');
        window.location.href = '/admin/login';
      }
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Workspace Title (No device before Ateevra logo) */}
          <div className="flex items-center space-x-3">
            <Link
              href={isAuthPage ? '/admin/login' : '/admin/merchants'}
              className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg p-1"
              aria-label="Ateevra Super Admin"
            >
              <img
                src="/images/ateevra-logo-white.png"
                alt="Ateevra"
                className="h-6 sm:h-7 w-auto object-contain"
              />
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-600/90 text-white uppercase tracking-wider">
                Super Admin
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isAuthPage && (
            <nav className="hidden md:flex items-center space-x-1" aria-label="Admin Navigation">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white border-b-2 border-red-500 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Actions / Sign Out */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthPage ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label="Sign out of Super Admin console"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-red-600 hover:text-white border border-slate-700 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400">Authentication Portal</span>
            )}
          </div>

          {/* Mobile menu button */}
          {!isAuthPage && (
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
                className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {!isAuthPage && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-base font-medium ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
