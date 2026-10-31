'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, Package, Users, PlusCircle, LogOut, Menu, X, Boxes, ShoppingBag } from 'lucide-react';

interface MerchantNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MERCHANT_NAV_ITEMS: MerchantNavItem[] = [
  { label: 'Products', href: '/merchant/products', icon: Package },
  { label: 'Inventory', href: '/merchant/inventory', icon: Boxes },
  { label: 'Orders', href: '/merchant/orders', icon: ShoppingBag },
  { label: 'Store Team', href: '/merchant/team', icon: Users },
];

export function MerchantHeader() {
  const pathname = usePathname() || '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const isAuthPage = pathname === '/merchant/login' || pathname === '/merchant/onboarding';

  useEffect(() => {
    if (isAuthPage) return;
    // Attempt to read session email from backend or cached token
    let active = true;
    async function fetchMerchantSession() {
      try {
        const token = sessionStorage.getItem('ecom_merchant_token');
        const res = await fetch('/merchant/auth/session', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (active && data?.session?.email) {
            setUserEmail(data.session.email);
          }
        }
      } catch {
        // Silently ignore session fetch failures in header
      }
    }
    fetchMerchantSession();
    return () => {
      active = false;
    };
  }, [isAuthPage]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('ecom_merchant_token') : null;
      await fetch('/merchant/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
    } catch (err) {
      console.error('Merchant sign out error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ecom_merchant_token');
        localStorage.removeItem('ecom_merchant_token');
        window.location.href = '/merchant/login';
      }
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Workspace Title (No device before Ateevra logo) */}
          <div className="flex items-center space-x-3">
            <Link
              href={isAuthPage ? '/merchant/login' : '/merchant/products'}
              className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg p-1"
              aria-label="Ateevra Merchant Console"
            >
              <img
                src="/images/ateevra-logo-cropped.png"
                alt="Ateevra"
                className="h-6 sm:h-7 w-auto object-contain"
              />
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800 uppercase tracking-wider">
                Merchant
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isAuthPage && (
            <nav className="hidden md:flex items-center space-x-1" aria-label="Merchant Navigation">
              {MERCHANT_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-700 font-semibold border-b-2 border-orange-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Add Product Shortcut Action */}
              <Link
                href="/merchant/products?action=new"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 ml-2 rounded-lg text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 transition shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </Link>
            </nav>
          )}

          {/* Right Actions / Identity & Sign Out */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthPage ? (
              <>
                {userEmail && (
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400 leading-tight">Signed in as</p>
                    <p className="text-xs font-medium text-slate-700 truncate max-w-[160px] leading-tight">
                      {userEmail}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  aria-label="Sign out of Merchant portal"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-red-50 hover:text-red-600 border border-slate-300 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                </button>
              </>
            ) : (
              <span className="text-xs text-slate-500">Partner Access Portal</span>
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
                className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {!isAuthPage && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {MERCHANT_NAV_ITEMS.map((item) => {
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
                    ? 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <Link
            href="/merchant/products?action=new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-md text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>

          {userEmail && (
            <div className="pt-2 pb-1 border-t border-slate-100 px-3">
              <p className="text-[11px] text-slate-400">Signed in as</p>
              <p className="text-xs font-medium text-slate-700 truncate">{userEmail}</p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
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
