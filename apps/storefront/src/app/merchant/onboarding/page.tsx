'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GSTIN_REGEX,
  PAN_REGEX,
  INDIAN_PHONE_REGEX,
  MERCHANT_HANDLE_REGEX,
  validateGSTIN,
  validatePAN,
} from '@ecom/types';

interface OnboardingFormData {
  name: string;
  handle: string;
  email: string;
  phone: string;
  businessRegistrationNumber: string; // GSTIN
  taxIdentifier: string; // PAN
  password: string;
  confirmPassword: string;
}

interface SubmittedMerchant {
  id: string;
  name: string;
  handle: string;
  status: string;
  email: string;
  phone: string;
  businessRegistrationNumber?: string;
  taxIdentifier?: string;
}

export default function MerchantOnboardingPage() {
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: '',
    handle: '',
    email: '',
    phone: '',
    businessRegistrationNumber: '',
    taxIdentifier: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMerchant, setSubmittedMerchant] = useState<SubmittedMerchant | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate handle from name if handle hasn't been manually typed
      if (name === 'name' && !prev.handle) {
        updated.handle = value
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 50);
      }
      return updated;
    });

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Store name is required (at least 2 characters).';
    } else if (formData.name.trim().length > 120) {
      errors.name = 'Store name cannot exceed 120 characters.';
    }

    if (formData.handle) {
      const cleanHandle = formData.handle.trim().toLowerCase();
      if (!MERCHANT_HANDLE_REGEX.test(cleanHandle) || cleanHandle.length < 3) {
        errors.handle = 'Handle must be at least 3 characters and use lowercase letters, numbers, and hyphens.';
      }
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Valid corporate business email is required.';
    }

    // Phone validation (+91)
    let phoneVal = formData.phone.trim();
    if (!phoneVal.startsWith('+91')) {
      const digitsOnly = phoneVal.replace(/\D/g, '');
      if (digitsOnly.length === 10) {
        phoneVal = `+91${digitsOnly}`;
      }
    }
    if (!INDIAN_PHONE_REGEX.test(phoneVal)) {
      errors.phone = 'Valid Indian mobile number (+91 followed by 10 digits starting with 6-9) is required.';
    }

    // GSTIN validation (optional during draft, but validated if provided)
    if (formData.businessRegistrationNumber.trim()) {
      const gstinRes = validateGSTIN(formData.businessRegistrationNumber.trim());
      if (!gstinRes.isValid) {
        errors.businessRegistrationNumber = gstinRes.error || 'Invalid GSTIN format (15 characters required).';
      }
    }

    // PAN validation (optional during draft, but validated if provided)
    if (formData.taxIdentifier.trim()) {
      const panRes = validatePAN(formData.taxIdentifier.trim());
      if (!panRes.isValid) {
        errors.taxIdentifier = panRes.error || 'Invalid PAN format (10 characters required).';
      }
    }

    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let phoneVal = formData.phone.trim();
      if (!phoneVal.startsWith('+91')) {
        const digitsOnly = phoneVal.replace(/\D/g, '');
        if (digitsOnly.length === 10) {
          phoneVal = `+91${digitsOnly}`;
        }
      }

      const res = await fetch('/merchant/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          handle: formData.handle.trim() || undefined,
          email: formData.email.trim().toLowerCase(),
          phone: phoneVal,
          businessRegistrationNumber: formData.businessRegistrationNumber.trim() || undefined,
          taxIdentifier: formData.taxIdentifier.trim() || undefined,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setGlobalError(data.message || data.error || 'Failed to submit onboarding application.');
        setIsSubmitting(false);
        return;
      }

      setSubmittedMerchant(data.merchant);
    } catch (err: any) {
      setGlobalError('Network error. Unable to reach server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Submitted State (Pending Verification)
  // ----------------------------------------------------
  if (submittedMerchant) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted</h2>
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 py-1 px-3 rounded-full inline-block mb-4">
            Status: Draft (Pending Verification)
          </p>

          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            Thank you for registering <strong className="text-gray-900">{submittedMerchant.name}</strong>.
            Your merchant account has been provisioned in <code className="bg-gray-100 px-1 py-0.5 rounded">draft</code> status.
            Platform administrators review seller details, GSTIN, and tax records before granting active commerce capabilities.
          </p>

          <div className="bg-gray-50 p-4 rounded-xl text-left text-xs text-gray-600 space-y-2 mb-6 border border-gray-100">
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Store Handle:</span>
              <span className="font-mono text-gray-800">{submittedMerchant.handle}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Business Email:</span>
              <span className="text-gray-800">{submittedMerchant.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Contact Phone:</span>
              <span className="text-gray-800">{submittedMerchant.phone}</span>
            </div>
            {submittedMerchant.businessRegistrationNumber && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">GSTIN:</span>
                <span className="font-mono text-gray-800">{submittedMerchant.businessRegistrationNumber}</span>
              </div>
            )}
            {submittedMerchant.taxIdentifier && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">PAN:</span>
                <span className="font-mono text-gray-800">{submittedMerchant.taxIdentifier}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Link
              href="/merchant/login"
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Go to Merchant Login
            </Link>
            <div>
              <Link
                href="/"
                className="text-xs text-gray-500 hover:text-gray-700 transition"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Form State
  // ----------------------------------------------------
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-2xl w-full bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Become a Verified Merchant</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join Ateevra Marketplace. Register your store to begin onboarding and verification.
          </p>
        </div>

        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start">
            <span className="mr-2 text-base">⚠️</span>
            <span>{globalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Store / Business Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. Acme Fashion Studio"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                  fieldErrors.name ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                }`}
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Store Handle / URL Slug
              </label>
              <input
                type="text"
                name="handle"
                value={formData.handle}
                onChange={handleInputChange}
                placeholder="e.g. acme-fashion"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono ${
                  fieldErrors.handle ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                }`}
              />
              {fieldErrors.handle && <p className="mt-1 text-xs text-red-600">{fieldErrors.handle}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Corporate Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="partner@acme.com"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                  fieldErrors.email ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                }`}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Mobile Number (+91) *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+919876543210"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                  fieldErrors.phone ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                }`}
              />
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                GSTIN (Indian Tax Reg.)
              </label>
              <input
                type="text"
                name="businessRegistrationNumber"
                value={formData.businessRegistrationNumber}
                onChange={handleInputChange}
                placeholder="07AAAAA0000A1Z5"
                maxLength={15}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono uppercase ${
                  fieldErrors.businessRegistrationNumber ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                }`}
              />
              {fieldErrors.businessRegistrationNumber && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.businessRegistrationNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                PAN (Permanent Account No.)
              </label>
              <input
                type="text"
                name="taxIdentifier"
                value={formData.taxIdentifier}
                onChange={handleInputChange}
                placeholder="ABCDE1234F"
                maxLength={10}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono uppercase ${
                  fieldErrors.taxIdentifier ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                }`}
              />
              {fieldErrors.taxIdentifier && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.taxIdentifier}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Account Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Min. 8 characters"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                  fieldErrors.password ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                }`}
              />
              {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Repeat password"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                  fieldErrors.confirmPassword ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Merchant Application'}
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-xs text-gray-500">
              Already have a registered merchant account?{' '}
              <Link href="/merchant/login" className="text-indigo-600 font-semibold hover:underline">
                Sign in here
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
