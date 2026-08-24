'use client';

import React from 'react';
import { Dialog } from '../ui/dialog';
import { Drawer } from '../ui/drawer';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { useAuth } from '../../context/auth-context';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authView, setAuthView, intendedDestination } = useAuth();

  return (
    <>
      <div className="hidden md:block">
        <Dialog
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          size="sm"
          className="p-8"
        >
          {authView === 'login' ? (
            <LoginForm
              onSuccess={closeAuthModal}
              onSwitchToRegister={() => setAuthView('register')}
              redirectUrl={intendedDestination || undefined}
            />
          ) : (
            <RegisterForm
              onSuccess={closeAuthModal}
              onSwitchToLogin={() => setAuthView('login')}
              redirectUrl={intendedDestination || undefined}
            />
          )}
        </Dialog>
      </div>

      <div className="block md:hidden">
        <Drawer
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          position="bottom"
          size="full"
          className="p-6 max-h-[90vh] rounded-t-3xl"
        >
          {authView === 'login' ? (
            <LoginForm
              onSuccess={closeAuthModal}
              onSwitchToRegister={() => setAuthView('register')}
              redirectUrl={intendedDestination || undefined}
            />
          ) : (
            <RegisterForm
              onSuccess={closeAuthModal}
              onSwitchToLogin={() => setAuthView('login')}
              redirectUrl={intendedDestination || undefined}
            />
          )}
        </Drawer>
      </div>
    </>
  );
};
