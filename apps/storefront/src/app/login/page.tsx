'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container } from '../../components/ui/container';
import { LoginForm } from '../../components/auth/login-form';
import { useAuth } from '../../context/auth-context';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const redirectUrl = searchParams.get('redirect') || '/account';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, redirectUrl, router]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <Container size="sm" className="w-full">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 max-w-md mx-auto">
          <LoginForm
            onSuccess={() => router.push(redirectUrl)}
            onSwitchToRegister={() => router.push('/register' + (redirectUrl ? '?redirect=' + encodeURIComponent(redirectUrl) : ''))}
            redirectUrl={redirectUrl}
          />
        </div>
      </Container>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
