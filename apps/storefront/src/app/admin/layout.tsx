import React from 'react';
import { AdminHeader } from '../../components/layout/admin-header';

export const metadata = {
  title: 'ATEEVRA Super Admin Console',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900" data-testid="admin-workspace-layout">
      <AdminHeader />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
