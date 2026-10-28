import type { Metadata } from 'next';
import './globals.css';
import { UiProvider } from '../providers/ui-provider';
import { ToastProvider } from '../components/ui/toast';
import { MiniPdpProvider } from '../context/mini-pdp-context';
import { StorefrontShell } from '../components/layout/storefront-shell';
import { constructMetadata } from '../lib/seo';
import { SearchProvider } from '../context/search-context';

import { fetchCmsNavigation, fetchCmsGlobalSettings } from '../lib/strapi-client';

import { AuthProvider } from '../context/auth-context';
import { CartProvider } from '../context/cart-context';
import { WishlistProvider } from '../context/wishlist-context';
import { AddressProvider } from '../context/address-context';

export const metadata: Metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [headerNav, footerNav, globalSettings] = await Promise.all([
    fetchCmsNavigation('header-nav'),
    fetchCmsNavigation('footer-nav'),
    fetchCmsGlobalSettings(),
  ]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white font-sans antialiased text-gray-900 selection:bg-brand-500 selection:text-white">
        <ToastProvider>
          <UiProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <AddressProvider>
                    <MiniPdpProvider>
                      <SearchProvider>
                        <StorefrontShell
                          headerNav={headerNav?.items}
                          footerNav={footerNav?.items}
                          globalSettings={globalSettings}
                        >
                          {children}
                        </StorefrontShell>
                      </SearchProvider>
                    </MiniPdpProvider>
                  </AddressProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </UiProvider>
        </ToastProvider>
      </body>
    </html>
  );
}


