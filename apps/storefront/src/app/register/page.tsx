'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RegisterForm } from '../../components/auth/register-form';

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') || '/';
  const mobile = searchParams.get('mobile') || undefined;

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <RegisterForm
          redirectUrl={redirect}
          initialMobile={mobile}
          onSuccess={() => router.push(redirect)}
          onSwitchToLogin={() =>
            router.push(
              `/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`
            )
          }
        />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
