'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { sanitizeRedirectPath } from '@ecom/types';
import { AteevraLoader } from '../../../components/ui/ateevra-loader';

function AdminLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawRedirect = searchParams.get('redirect');
  const redirect = rawRedirect ? sanitizeRedirectPath(rawRedirect, '/admin/merchants') : '/admin/merchants';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // MFA 2-Stage Challenge state
  const [mfaChallengeToken, setMfaChallengeToken] = useState<string | null>(null);
  const [isMfaStage, setIsMfaStage] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Rate limit lockout cooldown
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (cooldownRemaining === null || cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handlePrimaryLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password,
          totpCode: totpCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        const cooldown = data.cooldownSeconds || 900;
        setCooldownRemaining(cooldown);
        setErrorMessage(
          `Account temporarily locked due to multiple failed login attempts. Please wait ${cooldown} seconds.`
        );
        setIsSubmitting(false);
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Invalid email or password.');
        setIsSubmitting(false);
        return;
      }

      // Check if MFA challenge is required
      if (data.mfaRequired && data.mfaChallengeToken) {
        setMfaChallengeToken(data.mfaChallengeToken);
        setIsMfaStage(true);
        setIsSubmitting(false);
        return;
      }

      // Login succeeded
      if (data.token) {
        sessionStorage.setItem('ecom_admin_token', data.token);
        localStorage.removeItem('ecom_admin_token');
      }

      window.location.href = redirect;
    } catch {
      setErrorMessage('Network connection error. Unable to contact authentication server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!useBackupCode && !totpCode.trim()) {
      setErrorMessage('Please enter your 6-digit TOTP authenticator code.');
      return;
    }
    if (useBackupCode && !backupCode.trim()) {
      setErrorMessage('Please enter an 8-character backup scratch code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/admin/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mfaChallengeToken,
          code: useBackupCode ? undefined : totpCode.trim(),
          backupCode: useBackupCode ? backupCode.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        const cooldown = data.cooldownSeconds || 900;
        setCooldownRemaining(cooldown);
        setErrorMessage(`Too many invalid MFA attempts. Please wait ${cooldown} seconds.`);
        setIsSubmitting(false);
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Invalid MFA verification code.');
        setIsSubmitting(false);
        return;
      }

      if (data.token) {
        sessionStorage.setItem('ecom_admin_token', data.token);
        localStorage.removeItem('ecom_admin_token');
      }

      window.location.href = redirect;
    } catch {
      setErrorMessage('Network connection error during MFA verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 relative min-h-[380px]">
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center z-20 rounded-2xl p-6 text-center animate-fadeIn">
            <AteevraLoader
              size="lg"
              variant="admin"
              text="Authenticating Super Admin..."
              subtext="Ateevra Central Administration Console"
            />
          </div>
        )}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-md">
            ⚡
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ATEEVRA Super Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">
            Platform Governance & Trust Gateway
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {cooldownRemaining !== null && cooldownRemaining > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
            <span>⏱️</span>
            <span>Security Lockout: Try again in {cooldownRemaining}s</span>
          </div>
        )}

        {!isMfaStage ? (
          <form onSubmit={handlePrimaryLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                disabled={isSubmitting || (cooldownRemaining !== null && cooldownRemaining > 0)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ateevra.com"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                disabled={isSubmitting || (cooldownRemaining !== null && cooldownRemaining > 0)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                TOTP Authenticator Code <span className="text-slate-400 font-normal">(Optional if enrolled)</span>
              </label>
              <input
                type="text"
                maxLength={6}
                disabled={isSubmitting || (cooldownRemaining !== null && cooldownRemaining > 0)}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 text-sm font-mono tracking-widest border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (cooldownRemaining !== null && cooldownRemaining > 0)}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-semibold rounded-xl shadow-md transition"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In as Super Admin'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaVerify} className="space-y-5">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs">
              Primary credentials verified. Please provide your secondary verification factor.
            </div>

            {!useBackupCode ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  disabled={isSubmitting || (cooldownRemaining !== null && cooldownRemaining > 0)}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-3.5 py-2.5 text-center text-lg font-mono tracking-widest border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  8-Character Backup Code
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={isSubmitting || (cooldownRemaining !== null && cooldownRemaining > 0)}
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.trim())}
                  placeholder="A1B2-C3D4"
                  className="w-full px-3.5 py-2.5 text-center text-base font-mono uppercase tracking-wider border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setUseBackupCode(!useBackupCode)}
                className="text-slate-600 hover:text-slate-900 underline font-medium"
              >
                {useBackupCode ? 'Use Authenticator App instead' : 'Use a Backup Code instead'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMfaStage(false);
                  setMfaChallengeToken(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (cooldownRemaining !== null && cooldownRemaining > 0)}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-semibold rounded-xl shadow-md transition"
            >
              {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <AteevraLoader size="lg" variant="admin" text="Loading admin console..." subtext="Ateevra Central Administration" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
