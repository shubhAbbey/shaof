'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Mail, LogOut, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Container } from '../../components/ui/container';
import { Button } from '../../components/ui/button';
import { LoginForm } from '../../components/auth/login-form';
import { useAuth } from '../../context/auth-context';

export default function AccountPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, logout, openRegister } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <Container size="sm" className="w-full">
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 max-w-md mx-auto">
            <LoginForm
              onSuccess={() => router.refresh()}
              onSwitchToRegister={() => openRegister('/account')}
              redirectUrl="/account"
            />
          </div>
        </Container>
      </div>
    );
  }

  const displayName = customer.firstName
    ? (customer.firstName + ' ' + (customer.lastName || '')).trim()
    : 'Valued Customer';

  return (
    <div className="min-h-[75vh] py-10 bg-gray-50/30">
      <Container size="lg">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-brand-600 text-white flex items-center justify-center text-2xl font-black shadow-md">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">{displayName}</h1>
                <p className="text-sm text-gray-500 font-medium">{customer.mobile}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={logout}
              leftIcon={<LogOut className="h-4 w-4 text-gray-500" />}
              className="text-gray-700 hover:text-red-600 hover:border-red-200"
            >
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-5">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShieldCheck className="h-5 w-5 text-brand-600" />
                <h2 className="text-base font-bold text-gray-900">Personal Information</h2>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Full Name</p>
                    <p className="font-semibold text-gray-800">{displayName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Verified Mobile</p>
                    <p className="font-semibold text-gray-800">{customer.mobile}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="font-semibold text-gray-800">{customer.email || 'Not provided'}</p>
                  </div>
                </div>

                {customer.gender && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Gender</p>
                      <p className="font-semibold text-gray-800 capitalize">{customer.gender.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-5">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShoppingBag className="h-5 w-5 text-brand-600" />
                <h2 className="text-base font-bold text-gray-900">Quick Navigation</h2>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => router.push('/search')}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/20 transition-all flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-gray-800">Explore Fashion Catalog</span>
                  <span className="text-brand-600 font-bold">&rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/wishlist')}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/20 transition-all flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-gray-800">Saved Wishlist Items</span>
                  <span className="text-brand-600 font-bold">&rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/sale/all')}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/20 transition-all flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-gray-800">Exclusive Sale Deals</span>
                  <span className="text-red-600 font-bold">&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
