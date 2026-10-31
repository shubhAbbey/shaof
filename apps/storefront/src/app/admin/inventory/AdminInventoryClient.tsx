'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AteevraLoader } from '../../../components/ui/ateevra-loader';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Warehouse,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Minus,
  Store,
  ShieldAlert,
  Link as LinkIcon,
} from 'lucide-react';
import type { MerchantInventoryItemDto, InventorySummaryDto } from '@ecom/types';

function getAdminAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('ecom_admin_token') ||
        sessionStorage.getItem('ecom_admin_token')
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminInventoryClient() {
  const [items, setItems] = useState<Array<MerchantInventoryItemDto & { merchant_name?: string; merchant_handle?: string }>>([]);
  const [summary, setSummary] = useState<InventorySummaryDto | null>(null);
  const [locations, setLocations] = useState<Array<{ id: string; name: string; merchants?: any[] }>>([]);
  const [merchants, setMerchants] = useState<Array<{ id: string; name: string; handle: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Adjust Modal state
  const [selectedItem, setSelectedItem] = useState<MerchantInventoryItemDto | null>(null);
  const [adjustMode, setAdjustMode] = useState<'delta' | 'absolute'>('delta');
  const [deltaValue, setDeltaValue] = useState<number>(0);
  const [absoluteValue, setAbsoluteValue] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjusting, setAdjusting] = useState<boolean>(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Assign Location Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignMerchantId, setAssignMerchantId] = useState('');
  const [assignLocationId, setAssignLocationId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const fetchLocationsAndMerchants = async () => {
    try {
      const locRes = await fetch('/api/admin/marketplace/inventory/locations', {
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders(),
        },
        credentials: 'include',
      });
      if (locRes.ok) {
        const locData = await locRes.json();
        if (locData.success && locData.locations) {
          setLocations(locData.locations);
        }
      }

      const merchRes = await fetch('/api/admin/marketplace/merchants', {
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders(),
        },
        credentials: 'include',
      });
      if (merchRes.ok) {
        const merchData = await merchRes.json();
        if (merchData.success && merchData.merchants) {
          setMerchants(merchData.merchants);
        }
      }
    } catch (e: any) {
      console.warn('Failed to load locations or merchants:', e.message);
    }
  };

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedMerchant !== 'all') {
        params.set('merchant_id', selectedMerchant);
      }
      if (selectedLocation !== 'all') {
        params.set('location_id', selectedLocation);
      }
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (search.trim()) {
        params.set('search', search.trim());
      }

      const res = await fetch(`/api/admin/marketplace/inventory?${params.toString()}`, {
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
        throw new Error(errData.message || `Inventory request failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setItems(data.inventory || []);
        setSummary(data.summary || null);
      } else {
        throw new Error(data.message || 'Failed to retrieve inventory.');
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred loading platform inventory.');
    } finally {
      setLoading(false);
    }
  }, [selectedMerchant, selectedLocation, statusFilter, search]);

  useEffect(() => {
    fetchLocationsAndMerchants();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const openAdjustModal = (item: MerchantInventoryItemDto) => {
    setSelectedItem(item);
    setAdjustMode('delta');
    setDeltaValue(0);
    const stocked = item.stockedQuantity !== undefined ? item.stockedQuantity : (item.stocked_quantity || 0);
    setAbsoluteValue(stocked);
    setAdjustReason('');
    setAdjustError(null);
  };

  const closeAdjustModal = () => {
    setSelectedItem(null);
    setAdjustError(null);
    setDeltaValue(0);
    setAdjustReason('');
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const inventoryItemId = selectedItem.inventoryItemId || selectedItem.inventory_item_id;
    const locationId = selectedItem.locationId || selectedItem.location_id;

    if (!inventoryItemId) {
      setAdjustError('Item does not have an active inventory link. Cannot adjust stock.');
      return;
    }
    if (!locationId) {
      setAdjustError('Item does not have a linked stock location.');
      return;
    }

    setAdjusting(true);
    setAdjustError(null);

    const payload: any = {
      inventory_item_id: inventoryItemId,
      location_id: locationId,
      reason: adjustReason.trim() || 'Super Admin manual stock adjustment',
    };

    if (adjustMode === 'delta') {
      if (deltaValue === 0) {
        setAdjustError('Please specify a non-zero adjustment (+ or -).');
        setAdjusting(false);
        return;
      }
      payload.adjustment = deltaValue;
    } else {
      payload.stocked_quantity = absoluteValue;
    }

    try {
      const res = await fetch('/api/admin/marketplace/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Adjustment failed with status ${res.status}`);
      }

      if (data.success) {
        closeAdjustModal();
        await fetchInventory();
      } else {
        throw new Error(data.message || 'Failed to adjust stock.');
      }
    } catch (e: any) {
      setAdjustError(e.message || 'Stock adjustment failed.');
    } finally {
      setAdjusting(false);
    }
  };

  const handleAssignLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignMerchantId || !assignLocationId) {
      setAssignError('Both Merchant and Stock Location must be selected.');
      return;
    }

    setAssigning(true);
    setAssignError(null);

    try {
      const res = await fetch('/api/admin/marketplace/inventory/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          merchant_id: assignMerchantId,
          stock_location_id: assignLocationId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to assign location.');
      }

      if (data.success) {
        setAssignModalOpen(false);
        setAssignMerchantId('');
        setAssignLocationId('');
        await fetchLocationsAndMerchants();
        await fetchInventory();
      } else {
        throw new Error(data.message || 'Failed to assign location.');
      }
    } catch (e: any) {
      setAssignError(e.message || 'Location assignment failed.');
    } finally {
      setAssigning(false);
    }
  };

  // Preview calculations
  let previewStocked = 0;
  let previewViolates = false;
  let previewViolatesReason = '';

  if (selectedItem) {
    const currStocked = selectedItem.stockedQuantity !== undefined ? selectedItem.stockedQuantity : (selectedItem.stocked_quantity || 0);
    const currReserved = selectedItem.reservedQuantity !== undefined ? selectedItem.reservedQuantity : (selectedItem.reserved_quantity || 0);

    if (adjustMode === 'delta') {
      previewStocked = currStocked + deltaValue;
    } else {
      previewStocked = absoluteValue;
    }

    if (previewStocked < 0) {
      previewViolates = true;
      previewViolatesReason = 'Resulting stock quantity cannot be negative.';
    } else if (previewStocked < currReserved) {
      previewViolates = true;
      previewViolatesReason = `Cannot reduce stock below active reserved quantity (${currReserved} units).`;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Boxes className="w-7 h-7 text-indigo-600" />
            Platform Inventory & Stock Locations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Platform-wide inventory visibility, stock location assignments, and Super Admin stock adjustments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAssignModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition"
          >
            <LinkIcon className="w-4 h-4 text-indigo-600" />
            Assign Location to Merchant
          </button>
          <button
            onClick={() => fetchInventory()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total SKUs</span>
              <Boxes className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalSkus || summary.total_items || 0}</p>
            <p className="mt-1 text-xs text-slate-500">{summary.totalStockedUnits || summary.total_stocked_units || 0} units across platform</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">In Stock</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.inStockCount || summary.in_stock_count || 0}</p>
            <p className="mt-1 text-xs text-slate-500">&gt; 10 units available</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Low Stock</span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.lowStockCount || summary.low_stock_count || 0}</p>
            <p className="mt-1 text-xs text-slate-500">&le; 10 units available</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Out of Stock</span>
              <XCircle className="w-5 h-5 text-rose-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.outOfStockCount || summary.outOfStockCount || 0}</p>
            <p className="mt-1 text-xs text-slate-500">0 units available</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 border border-slate-200 rounded-md p-1 bg-slate-50 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'in_stock', label: 'In Stock' },
            { id: 'low_stock', label: 'Low Stock' },
            { id: 'out_of_stock', label: 'Out of Stock' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                statusFilter === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Merchant Dropdown, Location Dropdown, and Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {merchants.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Store className="w-4 h-4 text-slate-400" />
              <select
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Merchants</option>
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {locations.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Warehouse className="w-4 h-4 text-slate-400" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU, product, merchant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <AteevraLoader
              size="md"
              variant="admin"
              text="Loading platform inventory records..."
              subtext="Ateevra Stock Allocation Engine"
            />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
            <Boxes className="w-10 h-10 text-slate-300" />
            <p className="font-medium text-slate-700">No inventory records found</p>
            <p className="text-xs text-slate-500 max-w-sm">
              No products or stock levels matched the query filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Merchant</th>
                  <th className="px-6 py-3">Product & Variant</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3 text-right">Stocked</th>
                  <th className="px-6 py-3 text-right">Reserved</th>
                  <th className="px-6 py-3 text-right">Available</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {items.map((item) => {
                  const stocked = item.stockedQuantity !== undefined ? item.stockedQuantity : (item.stocked_quantity || 0);
                  const reserved = item.reservedQuantity !== undefined ? item.reservedQuantity : (item.reserved_quantity || 0);
                  const available = item.availableQuantity !== undefined ? item.availableQuantity : (item.available_quantity || 0);
                  const isLow = item.isLowStock !== undefined ? item.isLowStock : item.is_low_stock;

                  return (
                    <tr key={`${item.id}-${item.locationId || item.location_id}`} className="hover:bg-slate-50/75 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{item.merchant_name || 'ATEEVRA Direct'}</div>
                        <div className="text-xs text-slate-400 font-mono">{item.merchant_handle || item.merchant_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{item.productTitle || item.product_title}</div>
                        <div className="text-xs text-slate-500">{item.variantTitle || item.variant_title}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.locationName || item.location_name || 'Central'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">
                        {stocked}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {reserved > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                            {reserved}
                          </span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        <span className={available === 0 ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}>
                          {available}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {available === 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openAdjustModal(item)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Super Admin Stock Adjustment</h3>
                <p className="text-xs text-slate-500">
                  {selectedItem.productTitle || selectedItem.product_title} &bull; {selectedItem.variantTitle || selectedItem.variant_title}
                </p>
              </div>
              <button
                onClick={closeAdjustModal}
                disabled={adjusting}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-md border border-slate-200 text-center">
                <div>
                  <span className="text-xs text-slate-500 block">Stocked</span>
                  <span className="text-base font-bold text-slate-900">
                    {selectedItem.stockedQuantity !== undefined ? selectedItem.stockedQuantity : (selectedItem.stocked_quantity || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Reserved</span>
                  <span className="text-base font-bold text-amber-600">
                    {selectedItem.reservedQuantity !== undefined ? selectedItem.reservedQuantity : (selectedItem.reserved_quantity || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Available</span>
                  <span className="text-base font-bold text-indigo-600">
                    {selectedItem.availableQuantity !== undefined ? selectedItem.availableQuantity : (selectedItem.available_quantity || 0)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Adjustment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustMode('delta')}
                    className={`py-2 px-3 text-xs font-medium rounded-md border text-center transition ${
                      adjustMode === 'delta'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    +/- Add / Remove Units
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustMode('absolute')}
                    className={`py-2 px-3 text-xs font-medium rounded-md border text-center transition ${
                      adjustMode === 'absolute'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Set New Absolute Total
                  </button>
                </div>
              </div>

              {adjustMode === 'delta' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Delta Quantity (Positive to add, negative to remove)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeltaValue((v) => v - 1)}
                      className="p-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={deltaValue}
                      onChange={(e) => setDeltaValue(parseInt(e.target.value, 10) || 0)}
                      className="flex-1 text-center font-bold text-slate-900 border border-slate-300 rounded-md py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setDeltaValue((v) => v + 1)}
                      className="p-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    New Total Stocked Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={absoluteValue}
                    onChange={(e) => setAbsoluteValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full text-center font-bold text-slate-900 border border-slate-300 rounded-md py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="p-3 rounded-md bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
                <span className="text-indigo-900 font-medium">Resulting Stocked Quantity:</span>
                <span className="font-bold text-indigo-700 text-sm">{previewStocked} units</span>
              </div>

              {previewViolates && (
                <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{previewViolatesReason}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Adjustment (Platform Audit Log)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Central warehouse reconciliation, Physical count discrepancy"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {adjustError && (
                <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {adjustError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeAdjustModal}
                  disabled={adjusting}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting || previewViolates}
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {adjusting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Location Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Assign Stock Location</h3>
                <p className="text-xs text-slate-500">Authorize a merchant to store inventory at a location</p>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                disabled={assigning}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAssignLocationSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Merchant</label>
                <select
                  value={assignMerchantId}
                  onChange={(e) => setAssignMerchantId(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Merchant --</option>
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.handle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Stock Location</label>
                <select
                  value={assignLocationId}
                  onChange={(e) => setAssignLocationId(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Stock Location --</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {assignError && (
                <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {assignError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  disabled={assigning}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {assigning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Assign Stock Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
