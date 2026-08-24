'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  className,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [disabled]);

  const handleChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value.replace(/\D/g, '');
      if (!inputVal) return;

      const char = inputVal.slice(-1);
      const digits = value.split('');
      digits[index] = char;
      const newOtp = digits.slice(0, length).join('');

      onChange(newOtp);

      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }

      if (newOtp.length === length && onComplete) {
        onComplete(newOtp);
      }
    },
    [length, onChange, onComplete, value]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const digits = value.split('');
        if (digits[index]) {
          digits[index] = '';
          const newOtp = digits.join('');
          onChange(newOtp);
        } else if (index > 0 && inputRefs.current[index - 1]) {
          digits[index - 1] = '';
          const newOtp = digits.join('');
          onChange(newOtp);
          inputRefs.current[index - 1]?.focus();
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    },
    [length, onChange, value]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text/plain').trim().replace(/\D/g, '');
      if (!pastedData) return;

      const newOtp = pastedData.slice(0, length);
      onChange(newOtp);

      const focusIdx = Math.min(newOtp.length, length - 1);
      if (inputRefs.current[focusIdx]) {
        inputRefs.current[focusIdx]?.focus();
      }

      if (newOtp.length === length && onComplete) {
        onComplete(newOtp);
      }
    },
    [length, onChange, onComplete]
  );

  return (
    <div
      className={cn('flex items-center justify-center gap-2 sm:gap-3', className)}
      role="group"
      aria-label="OTP verification code"
    >
      {Array.from({ length }, (_, i) => {
        const digit = value[i] || '';
        return (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete="one-time-code"
            disabled={disabled}
            value={digit}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={'Digit ' + (i + 1) + ' of ' + length}
            className={cn(
              'h-12 w-10 sm:h-14 sm:w-12 text-center text-xl font-bold rounded-lg border bg-white transition-all',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-600',
              hasError
                ? 'border-red-500 text-red-600 focus:ring-red-400'
                : digit
                ? 'border-brand-600 text-gray-900 bg-brand-50/20'
                : 'border-gray-300 text-gray-900',
              disabled && 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          />
        );
      })}
    </div>
  );
};
