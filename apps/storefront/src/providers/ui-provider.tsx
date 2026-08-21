'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface UiContextValue {
  // Mini-cart drawer
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;

  // Mobile navigation drawer
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;

  // Mobile search overlay / page state
  isMobileSearchOpen: boolean;
  openMobileSearch: () => void;
  closeMobileSearch: () => void;

  // Generic modal state
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export const UiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openCartDrawer = useCallback(() => setIsCartDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setIsCartDrawerOpen(false), []);
  const toggleCartDrawer = useCallback(() => setIsCartDrawerOpen((prev) => !prev), []);

  const openMobileNav = useCallback(() => setIsMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);
  const toggleMobileNav = useCallback(() => setIsMobileNavOpen((prev) => !prev), []);

  const openMobileSearch = useCallback(() => setIsMobileSearchOpen(true), []);
  const closeMobileSearch = useCallback(() => setIsMobileSearchOpen(false), []);

  const openModal = useCallback((modalId: string) => setActiveModal(modalId), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <UiContext.Provider
      value={{
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        toggleCartDrawer,
        isMobileNavOpen,
        openMobileNav,
        closeMobileNav,
        toggleMobileNav,
        isMobileSearchOpen,
        openMobileSearch,
        closeMobileSearch,
        activeModal,
        openModal,
        closeModal,
      }}
    >
      {children}
    </UiContext.Provider>
  );
};

export function useUi() {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used within a UiProvider');
  }
  return context;
}
