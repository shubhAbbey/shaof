'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { OtpInput } from './otp-input';
import { useAuth } from '../../context/auth-context';
import { normalizeIndianMobile } from '../../lib/auth/phone-utils';

export interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  redirectUrl?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  redirectUrl,
}) => {
  const { login } = useAuth();

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const validation = normalizeIndianMobile(mobile);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: validation.normalized, type: 'login' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send OTP. Please try again.');
        return;
      }

      setMobile(validation.normalized);
      setStep('otp');
      setCountdown(30);
      setCanResend(false);
      setOtp('');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (submittedOtp?: string) => {
    const code = submittedOtp || otp;
    setError(null);

    if (!code || code.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: code, type: 'login' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid OTP code. Please try again.');
        return;
      }

      login(data.customer, data.token, redirectUrl);
      if (onSuccess) onSuccess();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setError(null);
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, type: 'login' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to resend OTP.');
        return;
      }

      setCountdown(30);
      setCanResend(false);
      setOtp('');
    } catch {
      setError('Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {step === 'mobile' ? (
        <form onSubmit={handleRequestOtp} className="space-y-5 animate-fadeIn">
          <div className="text-center space-y-1.5 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome to EcomFashion</h2>
            <p className="text-sm text-gray-500">Sign in with your mobile number to continue</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-mobile" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <div className="relative flex rounded-md shadow-xs">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm font-semibold select-none">
                +91
              </span>
              <input
                id="login-mobile"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="Enter 10-digit number"
                value={mobile.replace(/^\+91/, '')}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                autoFocus
                disabled={isLoading}
                className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-md border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-600"
              />
            </div>
            {error && <p className="text-xs text-red-600 mt-1" role="alert">{error}</p>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Get OTP
          </Button>

          {onSwitchToRegister && (
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                New user?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Create an account
                </button>
              </p>
            </div>
          )}
        </form>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-brand-50 text-brand-600 mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Enter Verification Code</h2>
            <p className="text-sm text-gray-500">
              We sent a 6-digit OTP to <span className="font-semibold text-gray-900">{mobile}</span>
            </p>
          </div>

          <div className="py-2">
            <OtpInput
              length={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                setError(null);
              }}
              onComplete={(completedOtp) => handleVerifyOtp(completedOtp)}
              disabled={isLoading}
              hasError={Boolean(error)}
            />
            {error && <p className="text-xs text-red-600 text-center mt-2" role="alert">{error}</p>}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Resend OTP
                </button>
              ) : (
                <span>Resend in <strong className="text-gray-900">{countdown}s</strong></span>
              )}
            </span>

            <button
              type="button"
              onClick={() => {
                setStep('mobile');
                setError(null);
              }}
              className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Change number
            </button>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={otp.length !== 6 || isLoading}
            onClick={() => handleVerifyOtp()}
            className="w-full"
          >
            Verify & Sign In
          </Button>
        </div>
      )}
    </div>
  );
};
