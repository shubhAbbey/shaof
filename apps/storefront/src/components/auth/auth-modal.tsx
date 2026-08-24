'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authView,
    closeAuthModal,
    intendedDestination,
    authMobile,
    openLogin,
    openRegister,
  } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Responsive Container: Desktop Dialog / Mobile Bottom Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 z-10 animate-slideUp sm:animate-scaleIn max-h-[90vh] overflow-y-auto mt-auto sm:my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {authView === 'login' ? (
          <LoginForm
            onSuccess={closeAuthModal}
            onSwitchToRegister={(mobile) => openRegister(intendedDestination, mobile)}
            redirectUrl={intendedDestination}
          />
        ) : (
          <RegisterForm
            onSuccess={closeAuthModal}
            onSwitchToLogin={() => openLogin(intendedDestination)}
            redirectUrl={intendedDestination}
            initialMobile={authMobile}
          />
        )}
      </div>
    </div>
  );
};
