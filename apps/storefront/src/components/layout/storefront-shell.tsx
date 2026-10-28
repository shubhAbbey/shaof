'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import { MiniPdpModal } from '../pdp/mini-pdp-modal';
import { AuthModal } from '../auth/auth-modal';
import { CartDrawer } from '../cart/cart-drawer';
import { AddressDrawer } from '../address/address-drawer';
import type { CmsCategoryNavItemDto, CmsFooterNavColumnDto, CmsGlobalSettingsDto } from '@ecom/types';

interface StorefrontShellProps {
  headerNav?: CmsCategoryNavItemDto[];
  footerNav?: CmsFooterNavColumnDto[];
  globalSettings?: CmsGlobalSettingsDto | null;
  children: React.ReactNode;
}

/**
 * StorefrontShell controls the outer chrome (consumer storefront header, footer, drawers).
 * When navigating inside /admin or /merchant dashboards, the consumer storefront chrome
 * is completely suppressed so that administrative workspaces render strictly isolated layouts.
 */
export function StorefrontShell({
  headerNav,
  footerNav,
  globalSettings,
  children,
}: StorefrontShellProps) {
  const pathname = usePathname();
  const isDashboard = pathname ? pathname.startsWith('/admin') || pathname.startsWith('/merchant') : false;

  if (isDashboard) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900" data-testid="dashboard-root">
        {children}
      </div>
    );
  }

  return (
    <>
      <Header navigation={headerNav} globalSettings={globalSettings} />
      <div className="flex-1" data-testid="storefront-content">
        {children}
      </div>
      <Footer navigation={footerNav} globalSettings={globalSettings} />
      <MiniPdpModal />
      <AuthModal />
      <CartDrawer />
      <AddressDrawer />
    </>
  );
}
