'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AteevraLoader } from '../../../components/ui/ateevra-loader';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Package,
  Calendar,
  MapPin,
  Eye,
  Store,
  User,
  AlertTriangle,
  Truck,
  CheckCircle2,
  Send,
} from 'lucide-react';

function getAdminAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('ecom_admin_token') ||
        sessionStorage.getItem('ecom_admin_token')
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

interface AdminOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  total: number;
  fulfillment_status?: string;
  merchant: {
    id: string;
    name: string;
    handle: string;
  };
}

interface AdminOrder {
  id: string;
  display_id: string | number;
  status: string;
  created_at: string;
  customer_email?: string;
  currency_code: string;
  total: number;
  item_count: number;
  items: AdminOrderItem[];
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country_code?: string;
  } | null;
}

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [merchantFilter, setMerchantFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'canceled'>('all');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Fulfillment Modal
  const [fulfillModalOrder, setFulfillModalOrder] = useState<AdminOrder | null>(null);
  const [fulfillCarrier, setFulfillCarrier] = useState('');
  const [fulfillTracking, setFulfillTracking] = useState('');
  const [fulfillNotes, setFulfillNotes] = useState('');
  const [fulfillStatus, setFulfillStatus] = useState<'fulfilled' | 'shipped'>('fulfilled');
  const [selectedItemQuantities, setSelectedItemQuantities] = useState<Record<string, number>>({});
  const [fulfillSubmitting, setFulfillSubmitting] = useState(false);
  const [fulfillError, setFulfillError] = useState<string | null>(null);
  const [fulfillSuccess, setFulfillSuccess] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/marketplace/orders', {
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders(),
        },
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Access denied. Super Admin authorization required.');
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Admin orders request failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        throw new Error(data.message || 'Failed to load platform orders.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching admin orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openFulfillModal = (order: AdminOrder) => {
    setFulfillModalOrder(order);
    setFulfillCarrier('');
    setFulfillTracking('');
    setFulfillNotes('');
    setFulfillStatus('fulfilled');
    setFulfillError(null);
    setFulfillSuccess(null);

    const initQtys: Record<string, number> = {};
    for (const item of order.items) {
      if (item.fulfillment_status !== 'fulfilled' && item.fulfillment_status !== 'shipped') {
        initQtys[item.id] = item.quantity;
      }
    }
    setSelectedItemQuantities(initQtys);
  };

  const handleConfirmFulfillment = async () => {
    if (!fulfillModalOrder) return;

    const itemsToFulfill = Object.entries(selectedItemQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, quantity]) => ({ id, quantity }));

    if (itemsToFulfill.length === 0) {
      setFulfillError('Please select at least one line item with quantity > 0 to fulfill.');
      return;
    }

    setFulfillSubmitting(true);
    setFulfillError(null);
    setFulfillSuccess(null);

    try {
      const res = await fetch(`/api/admin/marketplace/orders/${fulfillModalOrder.id}/fulfill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          items: itemsToFulfill,
          carrier_name: fulfillCarrier.trim() || undefined,
          tracking_number: fulfillTracking.trim() || undefined,
          notes: fulfillNotes.trim() || undefined,
          status: fulfillStatus,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Platform fulfillment failed.');
      }

      setFulfillSuccess('Platform fulfillment recorded and audit logged!');
      setTimeout(() => {
        setFulfillModalOrder(null);
        setSelectedOrder(null);
        fetchOrders();
      }, 1200);
    } catch (err: any) {
      setFulfillError(err.message || 'Failed to submit platform fulfillment.');
    } finally {
      setFulfillSubmitting(false);
    }
  };

  // Distinct merchant list for filter dropdown
  const merchants = Array.from(
    new Map(
      orders.flatMap((o) => o.items.map((it) => [it.merchant.id, it.merchant]))
    ).values()
  );

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      search.trim() === '' ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      String(order.display_id).toLowerCase().includes(search.toLowerCase()) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesMerchant =
      merchantFilter === 'all' ||
      order.items.some((it) => it.merchant.id === merchantFilter);

    return matchesSearch && matchesStatus && matchesMerchant;
  });

  // Summary Metrics
  const totalOrders = orders.length;
  const pendingFulfillment = orders.filter(
    (o) => o.status === 'pending' || o.items.some((i) => !i.fulfillment_status || i.fulfillment_status === 'not_fulfilled')
  ).length;
  const platformGmv = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Orders & Fulfillment</h1>
          <p className="text-sm text-slate-500 mt-1">
            Global order directory across all marketplace merchants, multi-seller attribution, and platform fulfillment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Platform Orders</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalOrders}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Orders</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingFulfillment}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Platform GMV</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatINR(platformGmv)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls: Search, Merchant Filter, Status Filter */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Customer Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="relative w-full sm:w-60">
            <select
              value={merchantFilter}
              onChange={(e) => setMerchantFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Merchants</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'pending', 'completed', 'canceled'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-900">Error</h4>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <AteevraLoader
              size="md"
              variant="admin"
              text="Loading platform orders..."
              subtext="Ateevra Order Management"
            />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No platform orders found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3 font-semibold">Order</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Items</th>
                  <th className="px-6 py-3 font-semibold">Sellers Involved</th>
                  <th className="px-6 py-3 font-semibold text-right">Order Total</th>
                  <th className="px-6 py-3 font-semibold text-center">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map((ord) => {
                  const uniqueSellers = Array.from(new Set(ord.items.map((it) => it.merchant.name)));

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/75 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        #{ord.display_id || ord.id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-700">
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ord.customer_email || 'Guest'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-700">
                        <span className="font-semibold text-slate-900">{ord.item_count}</span> items
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <div className="flex flex-wrap gap-1">
                          {uniqueSellers.map((s, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {formatINR(ord.total)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            ord.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'canceled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Details
                          </button>
                          {ord.items.some(
                            (it) => it.fulfillment_status !== 'fulfilled' && it.fulfillment_status !== 'shipped'
                          ) && (
                            <button
                              onClick={() => openFulfillModal(ord)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Fulfill
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Super Admin Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Platform Order Details — #{selectedOrder.display_id || selectedOrder.id.slice(-6)}
                </h3>
                <p className="text-xs text-slate-500">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()} &bull; Customer: {selectedOrder.customer_email}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div className="p-4 bg-slate-50 rounded-md border border-slate-200 text-xs">
                  <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Delivery Destination
                  </div>
                  <div className="text-slate-900 font-medium">
                    {selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    {selectedOrder.shipping_address.address_1} {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.province} ({selectedOrder.shipping_address.postal_code})
                  </div>
                </div>
              )}

              {/* Multi-Seller Line Items */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Order Line Items ({selectedOrder.items.length})
                </h4>
                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-2">Item</th>
                        <th className="px-4 py-2">Seller</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Unit Price</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-center">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {selectedOrder.items.map((it) => (
                        <tr key={it.id}>
                          <td className="px-4 py-2.5 font-medium text-slate-900">{it.title}</td>
                          <td className="px-4 py-2.5 text-slate-600">
                            <span className="font-medium text-slate-900">{it.merchant.name}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center text-slate-600">{it.quantity}</td>
                          <td className="px-4 py-2.5 text-right text-slate-600">{formatINR(it.unit_price)}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">{formatINR(it.total)}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {it.fulfillment_status || 'NOT_FULFILLED'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="px-4 py-2.5 font-semibold text-right text-slate-700">
                          Platform Total:
                        </td>
                        <td className="px-4 py-2.5 font-bold text-right text-indigo-600 text-sm">
                          {formatINR(selectedOrder.total)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                {selectedOrder.items.some(
                  (it) => it.fulfillment_status !== 'fulfilled' && it.fulfillment_status !== 'shipped'
                ) ? (
                  <button
                    type="button"
                    onClick={() => {
                      const ord = selectedOrder;
                      setSelectedOrder(null);
                      openFulfillModal(ord);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Fulfill Platform Items
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All platform items fulfilled
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Fulfill Modal */}
      {fulfillModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Platform Fulfill Items — #{fulfillModalOrder.display_id || fulfillModalOrder.id.slice(-6)}
                </h3>
                <p className="text-xs text-slate-500">
                  Platform fulfillment action across sellers.
                </p>
              </div>
              <button
                onClick={() => setFulfillModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              {fulfillError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
                  {fulfillError}
                </div>
              )}

              {fulfillSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {fulfillSuccess}
                </div>
              )}

              {/* Items Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Quantities to Fulfill:
                </label>
                <div className="space-y-2 border border-slate-200 rounded-md p-3 max-h-48 overflow-y-auto">
                  {fulfillModalOrder.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-xs py-1">
                      <div className="truncate max-w-[240px]">
                        <p className="font-medium text-slate-800 truncate">{it.title}</p>
                        <p className="text-[10px] text-slate-500">
                          Seller: {it.merchant.name} &bull; Ordered: {it.quantity} units
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">Fulfill:</span>
                        <input
                          type="number"
                          min="0"
                          max={it.quantity}
                          value={selectedItemQuantities[it.id] ?? 0}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(it.quantity, parseInt(e.target.value, 10) || 0));
                            setSelectedItemQuantities((prev) => ({ ...prev, [it.id]: val }));
                          }}
                          className="w-16 px-2 py-1 text-xs border border-slate-300 rounded text-center focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Option */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fulfillment Status:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFulfillStatus('fulfilled')}
                    className={`py-1.5 px-3 text-xs font-medium rounded-md border text-center transition ${
                      fulfillStatus === 'fulfilled'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Fulfilled (Packed)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillStatus('shipped')}
                    className={`py-1.5 px-3 text-xs font-medium rounded-md border text-center transition ${
                      fulfillStatus === 'shipped'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Shipped (In Transit)
                  </button>
                </div>
              </div>

              {/* Shipping References */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Carrier Name:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BlueDart, Delhivery"
                    value={fulfillCarrier}
                    onChange={(e) => setFulfillCarrier(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tracking / AWB #:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BD-987654321"
                    value={fulfillTracking}
                    onChange={(e) => setFulfillTracking(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Platform fulfillment override"
                  value={fulfillNotes}
                  onChange={(e) => setFulfillNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setFulfillModalOrder(null)}
                  disabled={fulfillSubmitting}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmFulfillment}
                  disabled={fulfillSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {fulfillSubmitting ? 'Fulfilling...' : 'Confirm Platform Fulfillment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
