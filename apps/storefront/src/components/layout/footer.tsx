import React from 'react';
import Link from 'next/link';
import { Container } from '../ui/container';
import { Sparkles, ShieldCheck, RefreshCw, Truck, CreditCard } from 'lucide-react';

import type { CmsFooterNavColumnDto, CmsGlobalSettingsDto } from '@ecom/types';

export interface FooterProps {
  navigation?: CmsFooterNavColumnDto[];
  globalSettings?: CmsGlobalSettingsDto | null;
}

const DEFAULT_VALUE_PROPS = [
  { title: 'Free Express Delivery', subtitle: 'On all orders above ₹999 across India', icon: 'truck' },
  { title: '7-Day Easy Returns', subtitle: 'Doorstep pickup & instant store credit/refund', icon: 'refresh' },
  { title: 'Cash on Delivery & UPI', subtitle: 'Pay cash or scan QR upon delivery', icon: 'credit-card' },
  { title: '100% Genuine Products', subtitle: 'Hand-curated premium quality apparel', icon: 'shield' },
];

const DEFAULT_FOOTER_COLUMNS: CmsFooterNavColumnDto[] = [
  {
    title: 'Top Categories',
    items: [
      { label: 'Women Ethnic & Western', href: '/category/women' },
      { label: 'Men Shirts & Denim', href: '/category/men' },
      { label: 'Curve + Plus', href: '/category/curve-plus' },
      { label: 'Kids Festive & Casual', href: '/category/kids' },
      { label: 'Flash Sale (Up to 70% Off)', href: '/sale' },
    ],
  },
  {
    title: 'Customer Support',
    items: [
      { label: 'Track Order', href: '/account/orders' },
      { label: 'Returns & Refunds', href: '/policies/return-policy' },
      { label: 'Shipping & Delivery', href: '/policies/shipping-policy' },
      { label: 'COD Guidelines', href: '/policies/cod-terms' },
      { label: 'Help Center & FAQs', href: '/pages/help-center' },
    ],
  },
  {
    title: 'Policies & Legal',
    items: [
      { label: 'Privacy Policy', href: '/policies/privacy-policy' },
      { label: 'Terms of Service', href: '/policies/terms-of-service' },
      { label: 'Return & Refund Policy', href: '/policies/return-policy' },
      { label: 'Security & Fraud Protection', href: '/policies/security' },
    ],
  },
];

export const Footer: React.FC<FooterProps> = ({ navigation, globalSettings }) => {
  const valueProps = globalSettings?.valuePropositions && globalSettings.valuePropositions.length > 0
    ? globalSettings.valuePropositions
    : DEFAULT_VALUE_PROPS;

  const columns = navigation && navigation.length > 0
    ? navigation
    : DEFAULT_FOOTER_COLUMNS;

  const aboutText = globalSettings?.footerAboutText ||
    "India's premier modern fashion destination offering curated ethnic wear, contemporary western silhouettes, plus size fits, and artisanal textiles with seamless checkout and pan-India express delivery.";

  const siteName = globalSettings?.siteName || 'EcomFashion';
  const currentYear = new Date().getFullYear();

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'refresh':
        return <RefreshCw className="h-6 w-6" />;
      case 'credit-card':
        return <CreditCard className="h-6 w-6" />;
      case 'shield':
        return <ShieldCheck className="h-6 w-6" />;
      case 'truck':
      default:
        return <Truck className="h-6 w-6" />;
    }
  };

  const getIconContainerStyle = (index: number) => {
    switch (index % 4) {
      case 1:
        return 'bg-emerald-50 text-emerald-600';
      case 2:
        return 'bg-blue-50 text-blue-600';
      case 3:
        return 'bg-purple-50 text-purple-600';
      case 0:
      default:
        return 'bg-brand-50 text-brand-600';
    }
  };

  return (
    <footer className="border-t border-gray-200 bg-white pt-12 pb-8 text-gray-700">
      {/* 1. Value Proposition Strip */}
      <div className="border-b border-gray-100 pb-10">
        <Container size="xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            {valueProps.map((prop, idx) => (
              <div key={prop.title} className="flex flex-col md:flex-row items-center gap-3">
                <div className={`h-12 w-12 rounded-xl ${getIconContainerStyle(idx)} flex items-center justify-center shrink-0`}>
                  {renderIcon(prop.icon)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{prop.title}</h4>
                  <p className="text-xs text-gray-500">{prop.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* 2. Main Navigation Links */}
      <Container size="xl" className="py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info (Col 1-2 on mobile, 1 on desktop) */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-black">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900 leading-none">
                {siteName.slice(0, 4)}<span className="text-brand-600">{siteName.slice(4)}</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              {aboutText}
            </p>
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-900 mb-1.5">Stay updated with exclusive offers:</p>
              <div className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email for newsletter"
                  className="h-9 w-full rounded-l-md border border-gray-300 px-3 text-xs focus:border-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  className="h-9 rounded-r-md bg-brand-600 px-4 text-xs font-bold text-white hover:bg-brand-700"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Link Columns from Strapi */}
          {columns.map((col) => (
            <div key={col.title} className="space-y-3 text-xs">
              <h5 className="font-bold text-gray-900 uppercase tracking-wider">{col.title}</h5>
              <ul className="space-y-2 text-gray-600">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={item.href === '/sale' ? 'text-red-600 font-bold hover:underline' : 'hover:text-brand-600'}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      {/* 3. Bottom Copyright & Payment Badges */}
      <div className="border-t border-gray-100 pt-6">
        <Container size="xl" className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 text-center sm:text-left">
          <p>© {currentYear} {siteName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
            <span className="font-semibold text-gray-500 text-center">100% Secure Payments:</span>
            <div className="flex flex-wrap justify-center gap-1.5 text-[10px] font-bold text-gray-600">
              <span className="bg-gray-100 px-2 py-0.5 rounded">UPI</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded">Razorpay</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded">RuPay</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded">Visa/Mastercard</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded">COD</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};
Footer.displayName = 'Footer';
