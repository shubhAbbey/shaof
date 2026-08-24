'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { sanitizeRedirectPath } from '@ecom/types';
import { LoginForm } from '../../components/auth/login-form';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawRedirect = searchParams.get('redirect');
  const redirect = rawRedirect ? sanitizeRedirectPath(rawRedirect, '/') : '/';


  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <LoginForm
          redirectUrl={redirect}
          onSuccess={() => router.push(redirect)}
          onSwitchToRegister={(mobile) =>
            router.push(
              `/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}${mobile ? `${redirect !== '/' ? '&' : '?'}mobile=${encodeURIComponent(mobile)}` : ''}`
            )
          }
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
