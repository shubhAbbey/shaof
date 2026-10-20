'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SessionInfo {
  userId: string;
  merchantId: string;
  email: string;
  role: string;
  membershipStatus: string;
  merchantStatus: string;
}

export default function MerchantLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountStatusNotice, setAccountStatusNotice] = useState<{
    type: 'draft' | 'pending' | 'suspended' | 'rejected' | 'membership_inactive';
    message: string;
  } | null>(null);

  // Cooldown / Rate Limit Lockout state
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  // Reset password state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetStatus, setResetStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  // Cooldown timer tick
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setAccountStatusNotice(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/merchant/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
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

      // Login succeeded at the identity level. Check merchant account status
      const session: SessionInfo = data.session;

      if (session.merchantStatus === 'draft' || session.merchantStatus === 'pending_approval') {
        setAccountStatusNotice({
          type: session.merchantStatus === 'draft' ? 'draft' : 'pending',
          message:
            "Your store application is currently in 'draft' status. Commercial features (products, orders, fulfillment) remain restricted until verified by platform staff.",
        });
        setIsSubmitting(false);
        return;
      }

      if (session.merchantStatus === 'suspended') {
        setAccountStatusNotice({
          type: 'suspended',
          message:
            'This merchant store has been suspended by platform administration. Store operations are locked.',
        });
        setIsSubmitting(false);
        return;
      }

      if (session.merchantStatus === 'rejected') {
        setAccountStatusNotice({
          type: 'rejected',
          message:
            'This merchant store application was rejected by platform administration.',
        });
        setIsSubmitting(false);
        return;
      }

      if (session.membershipStatus !== 'active') {
        setAccountStatusNotice({
          type: 'membership_inactive',
          message:
            'Your team membership on this store is currently inactive or suspended.',
        });
        setIsSubmitting(false);
        return;
      }

      // Store auth session token in browser sessionStorage / local state for client requests if needed
      if (data.token) {
        try {
          sessionStorage.setItem('ecom_merchant_token', data.token);
        } catch {}
      }

      // Redirect to merchant dashboard
      window.location.href = '/merchant/dashboard';
    } catch {
      setErrorMessage('Network error. Unable to reach server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);
    if (!forgotEmail.trim()) return;

    setIsSendingForgot(true);
    try {
      const res = await fetch('/merchant/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      setForgotStatus({
        success: data.success,
        message: data.message || 'If an account exists with this email, instructions have been sent.',
      });
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch {
      setForgotStatus({
        success: false,
        message: 'Network error. Please try again later.',
      });
    } finally {
      setIsSendingForgot(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);

    if (!resetToken.trim() || !resetNewPassword) {
      setResetStatus({ success: false, message: 'All fields are required.' });
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetStatus({ success: false, message: 'Passwords do not match.' });
      return;
    }

    if (resetNewPassword.length < 8) {
      setResetStatus({ success: false, message: 'Password must be at least 8 characters.' });
      return;
    }

    setIsSubmittingReset(true);
    try {
      const res = await fetch('/merchant/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken.trim(), password: resetNewPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResetStatus({ success: false, message: data.message || 'Password reset failed.' });
      } else {
        setResetStatus({
          success: true,
          message: 'Password reset successfully! You can now log in with your new password.',
        });
        setTimeout(() => {
          setShowResetModal(false);
          setShowForgotModal(false);
        }, 2000);
      }
    } catch {
      setResetStatus({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setIsSubmittingReset(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            🏪
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Merchant Portal</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to manage your marketplace store</p>
        </div>

        {/* Lockout / Cooldown Notice */}
        {cooldownRemaining !== null && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <div className="font-semibold flex items-center">
              <span className="mr-2">⏳</span>
              Account Cooldown Active
            </div>
            <p className="mt-1 text-xs text-amber-700">
              Too many failed login attempts. Please wait{' '}
              <strong className="font-mono text-amber-900 text-sm">{cooldownRemaining}s</strong> before
              trying again.
            </p>
          </div>
        )}

        {/* Account Status Gating Notice */}
        {accountStatusNotice && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm border ${
              accountStatusNotice.type === 'suspended' || accountStatusNotice.type === 'rejected'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="font-semibold flex items-center mb-1">
              <span className="mr-2">
                {accountStatusNotice.type === 'suspended' || accountStatusNotice.type === 'rejected'
                  ? '🛑'
                  : 'ℹ️'}
              </span>
              {accountStatusNotice.type === 'suspended'
                ? 'Account Suspended'
                : accountStatusNotice.type === 'rejected'
                ? 'Application Rejected'
                : 'Store Verification Pending'}
            </div>
            <p className="text-xs leading-relaxed">{accountStatusNotice.message}</p>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && !cooldownRemaining && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start">
            <span className="mr-2">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Corporate Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || cooldownRemaining !== null}
              required
              placeholder="seller@store.com"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:bg-gray-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotStatus(null);
                }}
                className="text-xs text-indigo-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting || cooldownRemaining !== null}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:bg-gray-100"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || cooldownRemaining !== null}
              className={`w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${
                isSubmitting || cooldownRemaining !== null ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Merchant Workspace'}
            </button>
          </div>

          <div className="text-center pt-3 border-t border-gray-100 mt-6">
            <span className="text-xs text-gray-500">
              New to Ateevra Marketplace?{' '}
              <Link
                href="/merchant/onboarding"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Apply for store onboarding
              </Link>
            </span>
          </div>
        </form>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h3>
              <p className="text-xs text-gray-500 mb-4">
                Enter your registered corporate email to receive a secure 15-minute reset token.
              </p>

              {forgotStatus && (
                <div
                  className={`p-3 rounded-lg text-xs mb-3 ${
                    forgotStatus.success
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {forgotStatus.message}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="seller@store.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingForgot}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                  >
                    {isSendingForgot ? 'Sending...' : 'Request Reset'}
                  </button>
                </div>
              </form>

              {forgotStatus?.success && (
                <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setShowResetModal(true);
                    }}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    Have a reset token? Enter it here
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Enter New Password</h3>
              <p className="text-xs text-gray-500 mb-4">
                Paste your reset token and enter your new account password.
              </p>

              {resetStatus && (
                <div
                  className={`p-3 rounded-lg text-xs mb-3 ${
                    resetStatus.success
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {resetStatus.message}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="reset_merch_..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReset}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                  >
                    {isSubmittingReset ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
