import type { Metadata } from 'next';
import './globals.css';
import { UiProvider } from '../providers/ui-provider';
import { ToastProvider } from '../components/ui/toast';
import { MiniPdpProvider } from '../context/mini-pdp-context';
import { MiniPdpModal } from '../components/pdp/mini-pdp-modal';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { constructMetadata } from '../lib/seo';

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white font-sans antialiased text-gray-900 selection:bg-brand-500 selection:text-white">
        <ToastProvider>
          <UiProvider>
            <MiniPdpProvider>
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
              <MiniPdpModal />
            </MiniPdpProvider>
          </UiProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
