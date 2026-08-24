import type { Metadata } from 'next';
import './globals.css';
import { UiProvider } from '../providers/ui-provider';
import { ToastProvider } from '../components/ui/toast';
import { MiniPdpProvider } from '../context/mini-pdp-context';
import { MiniPdpModal } from '../components/pdp/mini-pdp-modal';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { constructMetadata } from '../lib/seo';
import { SearchProvider } from '../context/search-context';

import { fetchCmsNavigation, fetchCmsGlobalSettings } from '../lib/strapi-client';

import { AuthProvider } from '../context/auth-context';
import { AuthModal } from '../components/auth/auth-modal';
import { CartProvider } from '../context/cart-context';
import { CartDrawer } from '../components/cart/cart-drawer';

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
                <MiniPdpProvider>
                  <SearchProvider>
                    <Header navigation={headerNav?.items} globalSettings={globalSettings} />
                    <div className="flex-1">{children}</div>
                    <Footer navigation={footerNav?.items} globalSettings={globalSettings} />
                    <MiniPdpModal />
                    <AuthModal />
                    <CartDrawer />
                  </SearchProvider>
                </MiniPdpProvider>
              </CartProvider>
            </AuthProvider>
          </UiProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

