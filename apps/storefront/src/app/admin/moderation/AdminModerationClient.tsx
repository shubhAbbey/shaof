'use client';

import React, { useState, useEffect } from 'react';

interface ModerationProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  status: string;
  merchant_id: string;
  merchant?: {
    id: string;
    name: string;
    handle?: string;
    status: string;
    email?: string;
  };
  variants?: Array<{
    id: string;
    title: string;
    sku: string;
  }>;
  submitted_at: string;
  submitted_by?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminModerationPage() {
  const [queue, setQueue] = useState<ModerationProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('proposed');
  const [searchQuery, setSearchQuery] = useState('');

  // Decision Modal
  const [decisionModal, setDecisionModal] = useState<{
    product: ModerationProduct | null;
    action: 'approve' | 'reject' | 'request-changes' | null;
    reason: string;
    notes: string;
    submitting: boolean;
    error: string | null;
  }>({
    product: null,
    action: null,
    reason: '',
    notes: '',
    submitting: false,
    error: null,
  });

  // Detail Modal
  const [inspectProduct, setInspectProduct] = useState<ModerationProduct | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

function getAdminAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('ecom_admin_token')
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/admin/marketplace/moderation?status=${statusFilter}${
        searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''
      }`;
      const res = await fetch(url, {
        headers: {
          ...getAdminAuthHeaders(),
        },
        credentials: 'include',
      });
      if (res.status === 401 || res.status === 403) {
        setIsUnauthorized(true);
        setQueue([]);
        throw new Error('Access Denied: Super Admin authentication required.');
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load moderation queue');
      }
      setIsUnauthorized(false);
      setQueue(data.queue || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const openDecisionModal = (
    product: ModerationProduct,
    action: 'approve' | 'reject' | 'request-changes'
  ) => {
    if (product.status !== 'proposed') {
      return;
    }
    setDecisionModal({
      product,
      action,
      reason: '',
      notes: '',
      submitting: false,
      error: null,
    });
  };

  const handleDecisionSubmit = async () => {
    if (!decisionModal.product || !decisionModal.action) return;
    const currentAction = decisionModal.action;
    const currentProduct = decisionModal.product;

    if (
      ['reject', 'request-changes'].includes(currentAction) &&
      !decisionModal.reason.trim()
    ) {
      setDecisionModal((prev) => ({
        ...prev,
        error: `A mandatory reason is required to ${currentAction.replace('-', ' ')} this product.`,
      }));
      return;
    }

    setDecisionModal((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      const res = await fetch(
        `/api/admin/marketplace/products/${currentProduct.id}/moderate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
          credentials: 'include',
          body: JSON.stringify({
            action: currentAction,
            reason: decisionModal.reason.trim() || undefined,
            notes: decisionModal.notes.trim() || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to execute moderation decision');
      }
      setDecisionModal((prev) => ({ ...prev, product: null, action: null, submitting: false }));
      await fetchQueue();
    } catch (err: any) {
      setDecisionModal((prev) => ({ ...prev, error: err.message, submitting: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            Published
          </span>
        );
      case 'proposed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            Changes Requested / Draft
          </span>
        );
    }
  };

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🔒
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Super Admin Authentication Required</h2>
          <p className="text-sm text-gray-600 mb-6">
            You must be signed in with an authorized Super Admin account to access the platform product moderation queue.
          </p>
          <a
            href="/admin/login?redirect=/admin/moderation"
            className="inline-block w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition"
          >
            Sign In as Super Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Moderation Queue</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and approve merchant catalog submissions before they become publicly discoverable.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              Queue: {queue.length} item(s)
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Search queue by title, handle, or merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchQueue()}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter Queue:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="proposed">Pending Moderation (Proposed)</option>
              <option value="published">Approved & Published</option>
              <option value="draft">Changes Requested (Draft)</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Submissions</option>
            </select>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Queue Table */}
        <div className="mt-6 bg-white shadow overflow-hidden rounded-lg border border-gray-200">
          {loading ? (
            <div className="py-12 text-center text-gray-500 text-sm">Loading moderation queue...</div>
          ) : queue.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No products found in the moderation queue matching status &quot;{statusFilter}&quot;.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Merchant Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Moderation Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {queue.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{prod.title}</div>
                      <div className="text-xs text-gray-500 font-mono">handle: {prod.handle}</div>
                      {prod.description && (
                        <div className="text-xs text-gray-400 truncate max-w-xs">{prod.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {prod.merchant?.name || prod.merchant_id}
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                        Merchant: {prod.merchant?.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(prod.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {prod.submitted_at ? new Date(prod.submitted_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setInspectProduct(prod)}
                        className="text-gray-600 hover:text-gray-900 mr-3"
                      >
                        Inspect
                      </button>
                      {prod.status === 'proposed' ? (
                        <>
                          <button
                            onClick={() => openDecisionModal(prod, 'approve')}
                            className="text-green-600 hover:text-green-900 mr-3 font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openDecisionModal(prod, 'request-changes')}
                            className="text-amber-600 hover:text-amber-900 mr-3"
                          >
                            Request Changes
                          </button>
                          <button
                            onClick={() => openDecisionModal(prod, 'reject')}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            Reject
                          </button>
                        </>
                      ) : prod.status === 'published' ? (
                        <span className="text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                          Published & Live
                        </span>
                      ) : prod.status === 'rejected' ? (
                        <span className="text-xs text-red-700 bg-red-50 px-2.5 py-1 rounded-full font-medium">
                          Rejected (Awaiting Resubmission)
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full font-medium">
                          Draft / Incomplete
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Inspect Modal */}
        {inspectProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Product Inspection</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <span className="font-semibold text-gray-900">Product Title: </span>
                  {inspectProduct.title}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Handle: </span>
                  <span className="font-mono text-xs">{inspectProduct.handle}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Merchant Organization: </span>
                  {inspectProduct.merchant?.name} ({inspectProduct.merchant_id})
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Description: </span>
                  <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                    {inspectProduct.description || 'No description provided.'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Current Status: </span>
                  {inspectProduct.status}
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setInspectProduct(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {inspectProduct.status === 'proposed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const p = inspectProduct;
                        setInspectProduct(null);
                        openDecisionModal(p, 'request-changes');
                      }}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-medium"
                    >
                      Request Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const p = inspectProduct;
                        setInspectProduct(null);
                        openDecisionModal(p, 'reject');
                      }}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const p = inspectProduct;
                        setInspectProduct(null);
                        openDecisionModal(p, 'approve');
                      }}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
                    >
                      Approve & Publish
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Decision Modal */}
        {decisionModal.product && decisionModal.action && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {decisionModal.action === 'approve'
                  ? 'Approve & Publish Product'
                  : decisionModal.action === 'request-changes'
                  ? 'Request Changes from Merchant'
                  : 'Reject Product Submission'}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Target Product:{' '}
                <span className="font-semibold text-gray-800">{decisionModal.product.title}</span> (
                {decisionModal.product.merchant?.name || decisionModal.product.merchant_id})
              </p>

              {decisionModal.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {decisionModal.error}
                </div>
              )}

              {decisionModal.action === 'approve' ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800 mb-4">
                  Approving this product will set its status to <strong>published</strong>, making it
                  immediately discoverable on the customer storefront.
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mandatory Reason *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={decisionModal.reason}
                    onChange={(e) =>
                      setDecisionModal((prev) => ({ ...prev, reason: e.target.value }))
                    }
                    placeholder={
                      decisionModal.action === 'request-changes'
                        ? 'e.g. Please clarify fabric specifications and upload higher resolution product photos.'
                        : 'e.g. Product does not meet marketplace authenticity guidelines.'
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Notes (Optional)
                </label>
                <input
                  type="text"
                  value={decisionModal.notes}
                  onChange={(e) =>
                    setDecisionModal((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Notes for compliance records..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() =>
                    setDecisionModal((prev) => ({ ...prev, product: null, action: null }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDecisionSubmit}
                  disabled={decisionModal.submitting}
                  className={`px-4 py-2 text-white rounded-md text-sm font-medium disabled:opacity-50 ${
                    decisionModal.action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : decisionModal.action === 'request-changes'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {decisionModal.submitting
                    ? 'Processing...'
                    : decisionModal.action === 'approve'
                    ? 'Confirm & Publish'
                    : decisionModal.action === 'request-changes'
                    ? 'Send Changes Request'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
