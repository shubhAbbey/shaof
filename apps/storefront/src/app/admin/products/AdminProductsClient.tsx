'use client';

import React, { useState, useEffect } from 'react';

interface MerchantSummary {
  id: string;
  name: string;
  handle?: string;
  status?: string;
}

interface AdminProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  status: string;
  merchant_id: string;
  merchant_name?: string;
  merchant?: MerchantSummary;
  variants?: Array<{
    id: string;
    title: string;
    sku: string;
  }>;
  created_at: string;
  updated_at: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [merchants, setMerchants] = useState<MerchantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchantFilter, setSelectedMerchantFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<AdminProduct | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formHandle, setFormHandle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTargetMerchant, setFormTargetMerchant] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

function getAdminAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('ecom_admin_token')
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

  const fetchMerchants = async () => {
    try {
      const res = await fetch('/api/admin/marketplace/merchants', {
        headers: {
          ...getAdminAuthHeaders(),
        },
        credentials: 'include',
      });
      if (res.status === 401 || res.status === 403) {
        setIsUnauthorized(true);
        setMerchants([]);
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setMerchants(data.merchants || []);
      }
    } catch {
      // Non-blocking merchant list fetch
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        selectedMerchantFilter !== 'all'
          ? `/api/admin/marketplace/products?merchant_id=${selectedMerchantFilter}`
          : '/api/admin/marketplace/products';

      const res = await fetch(url, {
        headers: {
          ...getAdminAuthHeaders(),
        },
        credentials: 'include',
      });
      if (res.status === 401 || res.status === 403) {
        setIsUnauthorized(true);
        setProducts([]);
        throw new Error('Access Denied: Super Admin authentication required.');
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load platform products');
      }
      setIsUnauthorized(false);
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedMerchantFilter]);

  const openCreateModal = () => {
    setFormTitle('');
    setFormHandle('');
    setFormDescription('');
    setFormTargetMerchant(merchants.length > 0 ? merchants[0].id : '');
    setFormError(null);
    setCreateModalOpen(true);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTargetMerchant) {
      setFormError('Super Admin must select an active target merchant.');
      return;
    }
    if (!formTitle.trim()) {
      setFormError('Product title is required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/admin/marketplace/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({
          title: formTitle.trim(),
          handle: formHandle.trim() || undefined,
          description: formDescription.trim() || undefined,
          target_merchant_id: formTargetMerchant,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create product');
      }
      setCreateModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (prod: AdminProduct) => {
    setEditProduct(prod);
    setFormTitle(prod.title);
    setFormHandle(prod.handle);
    setFormDescription(prod.description || '');
    setFormTargetMerchant(prod.merchant_id || prod.merchant?.id || '');
    setFormError(null);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    if (!formTitle.trim()) {
      setFormError('Product title is required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/admin/marketplace/products/${editProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({
          title: formTitle.trim(),
          handle: formHandle.trim() || undefined,
          description: formDescription.trim() || undefined,
          target_merchant_id: formTargetMerchant || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update product');
      }
      setEditProduct(null);
      await fetchProducts();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/admin/marketplace/products/${deleteProduct.id}`, {
        method: 'DELETE',
        headers: { ...getAdminAuthHeaders() },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete product');
      }
      setDeleteProduct(null);
      await fetchProducts();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
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
            Draft
          </span>
        );
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.merchant_name && p.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🔒
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Super Admin Authentication Required</h2>
          <p className="text-sm text-gray-600 mb-6">
            You must be signed in with an authorized Super Admin account to access the platform product catalog governance console.
          </p>
          <a
            href="/admin/login?redirect=/admin/products"
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
            <h1 className="text-2xl font-bold text-gray-900">Platform Product Catalog Governance</h1>
            <p className="mt-1 text-sm text-gray-500">
              Cross-merchant catalog oversight, product lifecycle moderation, and target merchant bindings.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              + Create Product for Merchant
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by title, handle, or merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Merchant:</label>
              <select
                value={selectedMerchantFilter}
                onChange={(e) => setSelectedMerchantFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Merchants</option>
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="proposed">Pending Moderation</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="mt-6 bg-white shadow overflow-hidden rounded-lg border border-gray-200">
          {loading ? (
            <div className="py-12 text-center text-gray-500 text-sm">Loading platform catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No products found matching the criteria.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Title & Handle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Associated Merchant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variants
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{prod.title}</div>
                      <div className="text-xs text-gray-500 font-mono">handle: {prod.handle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {prod.merchant_name || prod.merchant?.name || prod.merchant_id || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(prod.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prod.variants ? `${prod.variants.length} variant(s)` : '0 variants'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {prod.status === 'proposed' && (
                        <a
                          href="/admin/moderation"
                          className="text-amber-600 hover:text-amber-900 mr-4 font-semibold"
                        >
                          Review Queue
                        </a>
                      )}
                      <button
                        onClick={() => openEditModal(prod)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit / Transfer
                      </button>
                      <button
                        onClick={() => {
                          setFormError(null);
                          setDeleteProduct(prod);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Modal with Target Merchant Selector */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Create Merchant-Owned Product
              </h2>
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {formError}
                </div>
              )}
              <form onSubmit={handleCreateProduct}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Merchant (Mandatory) *
                  </label>
                  <select
                    required
                    value={formTargetMerchant}
                    onChange={(e) => setFormTargetMerchant(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select target merchant...</option>
                    {merchants.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Kashmiri Walnut Wood Bowl"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Handle</label>
                  <input
                    type="text"
                    value={formHandle}
                    onChange={(e) => setFormHandle(e.target.value)}
                    placeholder="e.g. kashmiri-walnut-wood-bowl"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Artisan hand-carved decorative bowl..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create & Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit / Transfer Modal */}
        {editProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Product & Ownership</h2>
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {formError}
                </div>
              )}
              <form onSubmit={handleUpdateProduct}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Merchant (Ownership Transfer)
                  </label>
                  <select
                    value={formTargetMerchant}
                    onChange={(e) => setFormTargetMerchant(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    {merchants.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Handle</label>
                  <input
                    type="text"
                    value={formHandle}
                    onChange={(e) => setFormHandle(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditProduct(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Product (Platform Admin)</h2>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-gray-800">{deleteProduct.title}</span>? This action is
                executed under a PostgreSQL transaction-level advisory lock.
              </p>
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 mb-4">
                <strong>Platform Invariant:</strong> Products with existing customer order lines cannot be
                deleted to maintain financial and fulfillment audit records.
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteProduct(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProduct}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Deleting...' : 'Confirm Deletion'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
