'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AteevraLoader } from '../../../components/ui/ateevra-loader';
import {
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

interface MerchantApplication {
  id: string;
  name: string;
  handle: string;
  status: 'draft' | 'pending_approval' | 'active' | 'suspended' | 'rejected';
  email: string;
  phone: string;
  businessRegistrationNumber?: string;
  taxIdentifier?: string;
  metadata?: Record<string, any>;
  verification?: {
    verificationSubmittedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    rejectedAt?: string;
    rejectedBy?: string;
    rejectionReason?: string;
    suspendedAt?: string;
    suspensionReason?: string;
    changesRequestedAt?: string;
    changesRequestedReason?: string;
    lifecycleHistory?: Array<{
      fromStatus: string;
      toStatus: string;
      changedAt: string;
      changedBy: string;
      reason?: string;
      notes?: string;
    }>;
  };
  owner?: {
    userId: string;
    role: string;
    status: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export default function MerchantOnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<MerchantApplication | null>(null);

  // Registration form data
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

  // Draft editing form data
  const [draftData, setDraftData] = useState({
    name: '',
    handle: '',
    phone: '',
    businessRegistrationNumber: '',
    taxIdentifier: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  function getMerchantAuthHeaders(): Record<string, string> {
    const token =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('ecom_merchant_token')
        : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Load existing application if session/cookie exists
  const loadExistingApplication = useCallback(async () => {
    try {
      const res = await fetch('/api/merchant/application', {
        headers: {
          Accept: 'application/json',
          ...getMerchantAuthHeaders(),
        },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.merchant) {
          setApplication(data.merchant);
          setDraftData({
            name: data.merchant.name || '',
            handle: data.merchant.handle || '',
            phone: data.merchant.phone || '',
            businessRegistrationNumber: data.merchant.businessRegistrationNumber || '',
            taxIdentifier: data.merchant.taxIdentifier || '',
          });
        }
      }
    } catch {
      // Unauthenticated or network error — remain on registration view
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExistingApplication();
  }, [loadExistingApplication]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
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

  const handleDraftInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDraftData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateRegisterForm = (): boolean => {
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

    if (formData.businessRegistrationNumber.trim()) {
      const gstinRes = validateGSTIN(formData.businessRegistrationNumber.trim());
      if (!gstinRes.isValid) {
        errors.businessRegistrationNumber = gstinRes.error || 'Invalid GSTIN format (15 characters required).';
      }
    }

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

  // Submit initial registration form
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setGlobalSuccess(null);

    if (!validateRegisterForm()) {
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
        credentials: 'include',
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
        setGlobalError(data.message || data.error || 'Failed to register merchant account.');
        setIsSubmitting(false);
        return;
      }

      if (data.token) {
        try {
          sessionStorage.setItem('ecom_merchant_token', data.token);
        } catch {}
      }

      // Load newly created merchant in draft status
      setApplication(data.merchant);
      setDraftData({
        name: data.merchant.name,
        handle: data.merchant.handle,
        phone: data.merchant.phone,
        businessRegistrationNumber: data.merchant.businessRegistrationNumber || '',
        taxIdentifier: data.merchant.taxIdentifier || '',
      });
      setGlobalSuccess(
        'Store draft account registered successfully. Review your details and submit your application for verification.'
      );
    } catch {
      setGlobalError('Network error. Unable to reach server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save edits to draft application (PUT /api/merchant/application)
  const handleSaveDraft = async () => {
    setGlobalError(null);
    setGlobalSuccess(null);
    setIsSavingDraft(true);

    try {
      const res = await fetch('/api/merchant/application', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getMerchantAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          name: draftData.name.trim(),
          handle: draftData.handle.trim() || undefined,
          phone: draftData.phone.trim() || undefined,
          businessRegistrationNumber: draftData.businessRegistrationNumber.trim() || undefined,
          taxIdentifier: draftData.taxIdentifier.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setGlobalError(data.message || 'Failed to update draft application.');
        setIsSavingDraft(false);
        return;
      }

      setApplication((prev: any) => ({
        ...prev,
        ...data.merchant,
      }));
      setGlobalSuccess('Draft application details saved successfully.');
    } catch {
      setGlobalError('Network error while saving draft.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Formally submit application for platform verification (POST /api/merchant/application/submit)
  const handleSubmitForVerification = async () => {
    setGlobalError(null);
    setGlobalSuccess(null);

    // Client-side completeness check
    const errors: Record<string, string> = {};
    if (!draftData.name.trim()) errors.name = 'Store name is required.';
    if (!draftData.phone.trim()) errors.phone = 'Phone number is required.';
    if (!draftData.businessRegistrationNumber.trim()) {
      errors.businessRegistrationNumber = 'GSTIN is required for verification submission.';
    } else {
      const gstinRes = validateGSTIN(draftData.businessRegistrationNumber.trim());
      if (!gstinRes.isValid) {
        errors.businessRegistrationNumber = gstinRes.error || 'Invalid GSTIN format (15 characters required).';
      }
    }

    if (!draftData.taxIdentifier.trim()) {
      errors.taxIdentifier = 'PAN is required for verification submission.';
    } else {
      const panRes = validatePAN(draftData.taxIdentifier.trim());
      if (!panRes.isValid) {
        errors.taxIdentifier = panRes.error || 'Invalid PAN format (10 characters required).';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGlobalError('Please complete all required business and tax identifier fields before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/merchant/application/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getMerchantAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          name: draftData.name.trim(),
          handle: draftData.handle.trim() || undefined,
          phone: draftData.phone.trim(),
          businessRegistrationNumber: draftData.businessRegistrationNumber.trim().toUpperCase(),
          taxIdentifier: draftData.taxIdentifier.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setGlobalError(data.message || data.error || 'Failed to submit application for verification.');
        setIsSubmitting(false);
        return;
      }

      setApplication(data.merchant);
      setGlobalSuccess(
        'Application submitted successfully! Your account is in pending_approval status awaiting Super Admin verification.'
      );
    } catch {
      setGlobalError('Network error while submitting application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 py-16">
        <AteevraLoader
          size="lg"
          variant="merchant"
          text="Checking application status..."
          subtext="Connecting to Ateevra Merchant Portal"
        />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 1: PENDING APPROVAL (Submitted & Awaiting Platform Verification)
  // --------------------------------------------------------------------------
  if (application && application.status === 'pending_approval') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ⏳
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted for Review</h2>
          <div className="inline-block mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              Status: Pending Review (Submitted)
            </span>
          </div>

          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            Your application for <strong className="text-gray-900">{application.name}</strong> was submitted on{' '}
            <strong className="text-gray-900">
              {application.verification?.verificationSubmittedAt
                ? new Date(application.verification.verificationSubmittedAt).toLocaleString()
                : 'today'}
            </strong>
            . Platform administrators are reviewing your seller details, GSTIN, and tax records.
          </p>

          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 text-left text-xs text-amber-900 mb-6">
            <p className="font-semibold mb-1">🔒 Commercial Operations Locked</p>
            <p className="text-amber-800">
              Product catalog publishing, inventory adjustments, and order fulfillment remain restricted until
              Super Admin approval.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl text-left text-xs text-gray-600 space-y-2 mb-6 border border-gray-100">
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Store Handle:</span>
              <span className="font-mono text-gray-800">{application.handle}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Corporate Email:</span>
              <span className="text-gray-800">{application.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Contact Phone:</span>
              <span className="text-gray-800">{application.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">GSTIN:</span>
              <span className="font-mono text-gray-800">{application.businessRegistrationNumber || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">PAN:</span>
              <span className="font-mono text-gray-800">{application.taxIdentifier || '—'}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setLoading(true);
                loadExistingApplication();
              }}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              Refresh Verification Status
            </button>
            <div>
              <Link href="/" className="text-xs text-gray-500 hover:text-gray-700 transition">
                Return to Storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 2: ACTIVE (Approved by Super Admin)
  // --------------------------------------------------------------------------
  if (application && application.status === 'active') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Merchant Account Active!</h2>
          <div className="inline-block mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Status: Active & Verified
            </span>
          </div>

          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            Congratulations! Your store <strong className="text-gray-900">{application.name}</strong> has been verified
            and approved by platform administration. You can now publish products, manage inventory, and fulfill orders.
          </p>

          <div className="space-y-3">
            <Link
              href="/merchant/products"
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Go to Merchant Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 3: DRAFT OR REJECTED (Editable Application & Submission View)
  // --------------------------------------------------------------------------
  if (application && (application.status === 'draft' || application.status === 'rejected')) {
    const isRejected = application.status === 'rejected';
    const changesReason = application.verification?.changesRequestedReason;
    const rejectionReason = application.verification?.rejectionReason;

    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-2xl w-full bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-gray-100 relative min-h-[400px]">
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center z-20 rounded-2xl p-6 text-center animate-fadeIn">
              <AteevraLoader
                size="lg"
                variant="merchant"
                text="Submitting Application..."
                subtext="Connecting to Ateevra Merchant Portal"
              />
            </div>
          )}
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isRejected ? 'Application Needs Revision' : 'Merchant Application Overview'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {isRejected
                  ? 'Your application was rejected. Please review feedback, update details, and resubmit.'
                  : 'Your account is in draft status. Provide complete business & tax identifiers before submitting.'}
              </p>
            </div>
            <div>
              {isRejected ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                  Status: Rejected
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                  Status: Draft (Awaiting Submission)
                </span>
              )}
            </div>
          </div>

          {/* Feedback alerts */}
          {changesReason && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <strong className="block font-semibold mb-1">⚠️ Changes Requested by Platform Staff:</strong>
              <p>{changesReason}</p>
            </div>
          )}

          {rejectionReason && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
              <strong className="block font-semibold mb-1">❌ Rejection Reason:</strong>
              <p>{rejectionReason}</p>
            </div>
          )}

          {globalSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              {globalSuccess}
            </div>
          )}

          {globalError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {globalError}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Store / Business Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={draftData.name}
                  onChange={handleDraftInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Store Handle / Slug *
                </label>
                <input
                  type="text"
                  name="handle"
                  value={draftData.handle}
                  onChange={handleDraftInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {fieldErrors.handle && <p className="mt-1 text-xs text-red-600">{fieldErrors.handle}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  value={application.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-[11px] text-gray-400">Email is fixed to your login account.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Contact Phone (+91) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={draftData.phone}
                  onChange={handleDraftInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  GSTIN (15 characters) *
                </label>
                <input
                  type="text"
                  name="businessRegistrationNumber"
                  value={draftData.businessRegistrationNumber}
                  onChange={handleDraftInputChange}
                  placeholder="07AAAAA0000A1Z5"
                  maxLength={15}
                  className={`w-full px-3 py-2 border rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-indigo-500 outline-none ${
                    fieldErrors.businessRegistrationNumber ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.businessRegistrationNumber && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.businessRegistrationNumber}</p>
                )}
                <p className="mt-1 text-[11px] text-gray-400">Required before submission for verification.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  PAN (10 characters) *
                </label>
                <input
                  type="text"
                  name="taxIdentifier"
                  value={draftData.taxIdentifier}
                  onChange={handleDraftInputChange}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className={`w-full px-3 py-2 border rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-indigo-500 outline-none ${
                    fieldErrors.taxIdentifier ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.taxIdentifier && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.taxIdentifier}</p>
                )}
                <p className="mt-1 text-[11px] text-gray-400">Required before submission for verification.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={isSavingDraft || isSubmitting}
                onClick={handleSaveDraft}
                className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                {isSavingDraft ? 'Saving Draft...' : 'Save Draft'}
              </button>

              <button
                type="button"
                disabled={isSubmitting || isSavingDraft}
                onClick={handleSubmitForVerification}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Submitting...'
                  : isRejected
                  ? 'Resubmit Application for Verification'
                  : 'Submit Application for Verification'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 4: NEW / UNREGISTERED (Initial Registration Form)
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-2xl w-full bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-gray-100 relative min-h-[400px]">
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center z-20 rounded-2xl p-6 text-center animate-fadeIn">
            <AteevraLoader
              size="lg"
              variant="merchant"
              text="Creating Merchant Account..."
              subtext="Connecting to Ateevra Merchant Portal"
            />
          </div>
        )}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Become a Verified Merchant</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join Ateevra Marketplace. Register your store draft account to begin onboarding and verification.
          </p>
        </div>

        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start">
            <span className="mr-2 text-base">⚠️</span>
            <span>{globalError}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
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
              {isSubmitting ? 'Creating Draft Account...' : 'Register Store (Draft Account)'}
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
