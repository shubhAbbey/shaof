import React from 'react';
import { MerchantHeader } from '../../components/layout/merchant-header';

export const metadata = {
  title: 'ATEEVRA Merchant Portal',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MerchantRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900" data-testid="merchant-workspace-layout">
      <MerchantHeader />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
