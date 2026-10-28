'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface MerchantLifecycleEvent {
  fromStatus: string;
  toStatus: string;
  changedAt: string;
  changedBy: string;
  reason?: string;
  notes?: string;
}

interface MerchantItem {
  id: string;
  name: string;
  handle: string;
  status: 'draft' | 'pending_approval' | 'active' | 'suspended' | 'rejected';
  email: string;
  phone: string;
  businessRegistrationNumber?: string;
  taxIdentifier?: string;
  metadata?: {
    verificationSubmittedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    rejectedAt?: string;
    rejectedBy?: string;
    rejectionReason?: string;
    suspendedAt?: string;
    suspendedBy?: string;
    suspensionReason?: string;
    changesRequestedAt?: string;
    changesRequestedBy?: string;
    changesRequestedReason?: string;
    lifecycleHistory?: MerchantLifecycleEvent[];
  };
  owner?: {
    userId: string;
    role: string;
    status: string;
  } | null;
  memberCount?: number;
  productCount?: number;
  created_at?: string;
  updated_at?: string;
}

export default function AdminMerchantReviewPage() {
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('pending_approval');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Action dialog state
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    merchant: MerchantItem | null;
    action: 'approve' | 'reject' | 'request-changes' | 'suspend' | 'reactivate' | null;
    reason: string;
    notes: string;
    submitting: boolean;
    error: string | null;
  }>({
    open: false,
    merchant: null,
    action: null,
    reason: '',
    notes: '',
    submitting: false,
    error: null,
  });

  const [isUnauthorized, setIsUnauthorized] = useState(false);

function getAdminAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('ecom_admin_token')
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/admin/marketplace/merchants', window.location.origin);
      if (activeTab !== 'all') {
        url.searchParams.set('status', activeTab);
      }
      if (searchQuery.trim()) {
        url.searchParams.set('q', searchQuery.trim());
      }

      const res = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          ...getAdminAuthHeaders(),
        },
        credentials: 'include',
      });

      if (res.status === 401 || res.status === 403) {
        setIsUnauthorized(true);
        setMerchants([]);
        throw new Error('Access Denied: Super Admin authentication required.');
      }

      if (!res.ok) {
        throw new Error(`Failed to load merchants: HTTP ${res.status}`);
      }

      const data = await res.json();
      setIsUnauthorized(false);
      setMerchants(data.merchants || []);
    } catch (err: any) {
      setError(err.message || 'Unable to load merchant review queue.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const openActionDialog = (
    merchant: MerchantItem,
    action: 'approve' | 'reject' | 'request-changes' | 'suspend' | 'reactivate'
  ) => {
    // Assert transition eligibility against merchant's authoritative status
    if (['approve', 'reject', 'request-changes'].includes(action) && merchant.status !== 'pending_approval') {
      return;
    }
    if (action === 'suspend' && merchant.status !== 'active') {
      return;
    }
    if (action === 'reactivate' && merchant.status !== 'suspended') {
      return;
    }

    setActionModal({
      open: true,
      merchant,
      action,
      reason: '',
      notes: '',
      submitting: false,
      error: null,
    });
  };

  const executeReviewAction = async () => {
    if (!actionModal.merchant || !actionModal.action) return;
    const targetAction = actionModal.action;
    const targetMerchant = actionModal.merchant;

    // Reason validation for reject, request-changes, and suspend
    if (
      ['reject', 'request-changes', 'suspend'].includes(targetAction) &&
      !actionModal.reason.trim()
    ) {
      setActionModal((prev) => ({
        ...prev,
        error: `A mandatory reason is required to ${targetAction.replace('-', ' ')} this merchant.`,
      }));
      return;
    }

    setActionModal((prev) => ({ ...prev, submitting: true, error: null }));

    try {
      const res = await fetch(
        `/api/admin/marketplace/merchants/${actionModal.merchant.id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...getAdminAuthHeaders(),
          },
          credentials: 'include',
          body: JSON.stringify({
            action: actionModal.action,
            reason: actionModal.reason.trim() || undefined,
            notes: actionModal.notes.trim() || undefined,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Action failed: HTTP ${res.status}`);
      }

      // Refresh queue
      setActionModal((prev) => ({ ...prev, open: false }));
      if (detailModalOpen && selectedMerchant?.id === actionModal.merchant.id) {
        setDetailModalOpen(false);
      }
      fetchMerchants();
    } catch (err: any) {
      setActionModal((prev) => ({
        ...prev,
        submitting: false,
        error: err.message || 'Failed to update merchant status.',
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            Active
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            Pending Review
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft / Re-Edit
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Suspended
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🔒
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Super Admin Authentication Required</h2>
          <p className="text-sm text-slate-600 mb-6">
            You must be signed in with an authorized Super Admin account to access the platform merchant review console.
          </p>
          <a
            href="/admin/login?redirect=/admin/merchants"
            className="inline-block w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition"
          >
            Sign In as Super Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Merchant Review & Moderation Queue
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Super Admin verification, approval, changes request, and suspension management (ADR-003, ADR-006).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchMerchants()}
              className="px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Refresh Queue
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'pending_approval', label: 'Pending Review' },
              { id: 'active', label: 'Active Sellers' },
              { id: 'draft', label: 'Draft / Changes Requested' },
              { id: 'suspended', label: 'Suspended' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'all', label: 'All Merchants' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by name, handle, GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Merchant Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Loading merchant review queue...
            </div>
          ) : merchants.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No merchants found in this queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">Merchant Name & Slug</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Tax / GSTIN / PAN</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Owner</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {merchants.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{m.name}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{m.handle}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>{m.email}</div>
                        <div className="text-slate-400">{m.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div>GSTIN: {m.businessRegistrationNumber || '—'}</div>
                        <div className="text-slate-400">PAN: {m.taxIdentifier || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(m.status)}</td>
                      <td className="py-3.5 px-4">
                        {m.owner ? (
                          <span className="text-emerald-700 font-medium">Active Owner</span>
                        ) : (
                          <span className="text-rose-600 font-medium">Missing Owner</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMerchant(m);
                            setDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs border border-slate-200 text-slate-700 rounded hover:bg-slate-100"
                        >
                          Details
                        </button>

                        {m.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => openActionDialog(m, 'approve')}
                              className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openActionDialog(m, 'request-changes')}
                              className="px-2.5 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600 font-medium"
                            >
                              Request Changes
                            </button>
                            <button
                              onClick={() => openActionDialog(m, 'reject')}
                              className="px-2.5 py-1 text-xs bg-rose-600 text-white rounded hover:bg-rose-700 font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {m.status === 'active' && (
                          <button
                            onClick={() => openActionDialog(m, 'suspend')}
                            className="px-2.5 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                          >
                            Suspend
                          </button>
                        )}

                        {m.status === 'suspended' && (
                          <button
                            onClick={() => openActionDialog(m, 'reactivate')}
                            className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium"
                          >
                            Reactivate
                          </button>
                        )}

                        {m.status === 'draft' && (
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                            Awaiting Submission
                          </span>
                        )}

                        {m.status === 'rejected' && (
                          <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium">
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Action Dialog (Approve, Reject, Request Changes, Suspend, Reactivate) */}
      {actionModal.open && actionModal.merchant && actionModal.action && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 capitalize">
                {actionModal.action.replace('-', ' ')} Merchant
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Merchant:{' '}
                <span className="font-semibold text-slate-800">
                  {actionModal.merchant.name} ({actionModal.merchant.handle})
                </span>
              </p>
            </div>

            {actionModal.error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {actionModal.error}
              </div>
            )}

            {/* Warning notes */}
            {actionModal.action === 'suspend' && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
                <strong>Warning:</strong> Suspending this merchant will immediately revoke all active
                sessions and hide all merchant products from the storefront catalog.
              </div>
            )}

            {['reject', 'request-changes', 'suspend'].includes(actionModal.action) && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={actionModal.reason}
                  onChange={(e) =>
                    setActionModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder={`Provide a clear reason for ${actionModal.action.replace('-', ' ')}...`}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Internal Administrative Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={actionModal.notes}
                onChange={(e) =>
                  setActionModal((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Optional notes for audit logs..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                disabled={actionModal.submitting}
                onClick={() => setActionModal((prev) => ({ ...prev, open: false }))}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={actionModal.submitting}
                onClick={executeReviewAction}
                className={`px-4 py-2 text-xs font-medium text-white rounded-lg disabled:opacity-50 ${
                  ['reject', 'suspend'].includes(actionModal.action)
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {actionModal.submitting ? 'Processing...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailModalOpen && selectedMerchant && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedMerchant.name}
                </h3>
                <p className="text-xs text-slate-500">ID: {selectedMerchant.id}</p>
              </div>
              <div>{getStatusBadge(selectedMerchant.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Contact</span>
                <p className="font-semibold text-slate-800">{selectedMerchant.email}</p>
                <p className="text-slate-600">{selectedMerchant.phone}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Tax Identifiers</span>
                <p className="font-semibold text-slate-800 font-mono">
                  GSTIN: {selectedMerchant.businessRegistrationNumber || 'Not submitted'}
                </p>
                <p className="text-slate-600 font-mono">
                  PAN: {selectedMerchant.taxIdentifier || 'Not submitted'}
                </p>
              </div>
            </div>

            {/* Lifecycle Audit History */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Decision & Verification History
              </h4>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                {(selectedMerchant.metadata?.lifecycleHistory || []).length === 0 ? (
                  <p className="p-3 text-slate-400 italic">No transition events recorded.</p>
                ) : (
                  selectedMerchant.metadata?.lifecycleHistory?.map((evt, idx) => (
                    <div key={idx} className="p-3 space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-800">
                          {evt.fromStatus} &rarr; {evt.toStatus}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(evt.changedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Actor: <span className="font-mono text-slate-800">{evt.changedBy}</span>
                      </p>
                      {evt.reason && (
                        <p className="text-rose-700 bg-rose-50 p-1.5 rounded text-[11px]">
                          Reason: {evt.reason}
                        </p>
                      )}
                      {evt.notes && (
                        <p className="text-slate-500 italic text-[11px]">Notes: {evt.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                {selectedMerchant.status === 'pending_approval' && (
                  <>
                    <button
                      onClick={() => openActionDialog(selectedMerchant, 'approve')}
                      className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                    >
                      Approve Merchant
                    </button>
                    <button
                      onClick={() => openActionDialog(selectedMerchant, 'request-changes')}
                      className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => openActionDialog(selectedMerchant, 'reject')}
                      className="px-3 py-1.5 text-xs bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium"
                    >
                      Reject Application
                    </button>
                  </>
                )}
                {selectedMerchant.status === 'active' && (
                  <button
                    onClick={() => openActionDialog(selectedMerchant, 'suspend')}
                    className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Suspend Merchant
                  </button>
                )}
                {selectedMerchant.status === 'suspended' && (
                  <button
                    onClick={() => openActionDialog(selectedMerchant, 'reactivate')}
                    className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                  >
                    Reactivate Merchant
                  </button>
                )}
                {selectedMerchant.status === 'draft' && (
                  <span className="text-xs text-slate-500 italic">
                    Merchant account is in draft status awaiting seller verification submission.
                  </span>
                )}
                {selectedMerchant.status === 'rejected' && (
                  <span className="text-xs text-rose-600 italic">
                    Merchant application was rejected. Awaiting merchant re-submission.
                  </span>
                )}
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
