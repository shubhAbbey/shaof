import React from 'react';
import Link from 'next/link';
import { Container } from '../ui/container';
import { Sparkles, ShieldCheck, RefreshCw, Truck, CreditCard } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white pt-12 pb-8 text-gray-700">
      {/* 1. Value Proposition Strip */}
      <div className="border-b border-gray-100 pb-10">
        <Container size="xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Free Express Delivery</h4>
                <p className="text-xs text-gray-500">On all orders above ₹999 across India</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">7-Day Easy Returns</h4>
                <p className="text-xs text-gray-500">Doorstep pickup & instant store credit/refund</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Cash on Delivery & UPI</h4>
                <p className="text-xs text-gray-500">Pay cash or scan QR upon delivery</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">100% Genuine Products</h4>
                <p className="text-xs text-gray-500">Hand-curated premium quality apparel</p>
              </div>
            </div>
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
                ECOM<span className="text-brand-600">FASHION</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              India&apos;s premier modern fashion destination offering curated ethnic wear, contemporary
              western silhouettes, plus size fits, and trend-setting daily wardrobe essentials.
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

          {/* Categories */}
          <div className="space-y-3 text-xs">
            <h5 className="font-bold text-gray-900 uppercase tracking-wider">Top Categories</h5>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link href="/category/women" className="hover:text-brand-600">
                  Women Ethnic & Western
                </Link>
              </li>
              <li>
                <Link href="/category/men" className="hover:text-brand-600">
                  Men Shirts & Denim
                </Link>
              </li>
              <li>
                <Link href="/category/curve-plus" className="hover:text-brand-600">
                  Curve + Plus Size
                </Link>
              </li>
              <li>
                <Link href="/category/kids" className="hover:text-brand-600">
                  Kids Festive & Casual
                </Link>
              </li>
              <li>
                <Link href="/sale" className="text-red-600 font-bold hover:underline">
                  Flash Sale (Up to 70% Off)
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3 text-xs">
            <h5 className="font-bold text-gray-900 uppercase tracking-wider">Customer Support</h5>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link href="/track-order" className="hover:text-brand-600">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/help/returns" className="hover:text-brand-600">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/help/shipping" className="hover:text-brand-600">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/help/cod" className="hover:text-brand-600">
                  COD Guidelines
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-brand-600">
                  Help Center & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Legal */}
          <div className="space-y-3 text-xs">
            <h5 className="font-bold text-gray-900 uppercase tracking-wider">Policies</h5>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link href="/privacy-policy" className="hover:text-brand-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-brand-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-brand-600">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-brand-600">
                  Security & Fraud Protection
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* 3. Bottom Copyright & Payment Badges */}
      <div className="border-t border-gray-100 pt-6">
        <Container size="xl" className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 text-center sm:text-left">
          <p>© 2026 EcomFashion MVP. All rights reserved.</p>
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
