import type { Metadata } from 'next';
import './globals.css';
import { UiProvider } from '../providers/ui-provider';
import { ToastProvider } from '../components/ui/toast';
import { constructMetadata } from '../lib/seo';

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans antialiased text-gray-900 selection:bg-brand-500 selection:text-white">
        <ToastProvider>
          <UiProvider>{children}</UiProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
