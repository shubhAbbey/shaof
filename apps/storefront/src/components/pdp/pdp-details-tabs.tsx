'use client';

import React, { useState } from 'react';
import type { ProductDetail } from '../../lib/commerce';
import { cn } from '../../lib/utils';
import { ShieldCheck, Truck, RefreshCw, Sparkles, Layers } from 'lucide-react';

export interface PdpDetailsTabsProps {
  product: ProductDetail;
}

export const PdpDetailsTabs: React.FC<PdpDetailsTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'specifications' | 'shipping' | 'returns'>('details');

  const tabs = [
    { id: 'details', label: 'Product Details' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'returns', label: '7-Day Returns' },
  ] as const;

  return (
    <div className="w-full border-t border-gray-100 pt-6 mt-8">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'pb-3 text-sm font-bold transition-colors whitespace-nowrap border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-5 text-sm text-gray-600 leading-relaxed">
        {activeTab === 'details' && (
          <div className="space-y-4">
            <p>{product.description || 'Experience artisan craftsmanship and contemporary Indian fashion with this meticulously designed garment.'}</p>
            {product.subtitle && (
              <p className="text-gray-500 italic text-xs">{product.subtitle}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <span className="text-xs font-semibold text-gray-800">100% Genuine Handcrafted Product</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <Layers className="h-4 w-4 text-brand-600" />
                <span className="text-xs font-semibold text-gray-800">Premium Comfort Fit & Weave</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Brand</span>
              <span className="font-bold text-gray-900">{product.brand || 'Gulmohar Jaipur'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Category</span>
              <span className="font-bold text-gray-900">{product.categoryName || 'Ethnic Wear'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Product Code (SKU)</span>
              <span className="font-bold text-gray-900">{product.id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Country of Origin</span>
              <span className="font-bold text-gray-900">India</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Fabric Care</span>
              <span className="font-bold text-gray-900">Dry Clean / Gentle Hand Wash</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Package Contains</span>
              <span className="font-bold text-gray-900">1 Main Garment</span>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Fast Pan-India Delivery</h4>
                <p className="text-xs text-gray-500 mt-0.5">Orders are packed and dispatched within 24–48 hours. Metro deliveries arrive in 2–4 business days.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Cash on Delivery & Prepaid</h4>
                <p className="text-xs text-gray-500 mt-0.5">We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery across all service areas.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <RefreshCw className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Hassle-Free 7 Days Policy</h4>
                <p className="text-xs text-gray-500 mt-0.5">Initiate a return or size exchange within 7 days of delivery from your order history. Doorstep pickup arranged automatically.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
PdpDetailsTabs.displayName = 'PdpDetailsTabs';
