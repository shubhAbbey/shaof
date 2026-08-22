'use client';

import React from 'react';
import { DesktopHeader } from './desktop-header';
import { MobileHeader } from './mobile-header';
import { MobileNavDrawer } from './mobile-nav-drawer';

export const Header: React.FC = () => {
  return (
    <>
      <DesktopHeader />
      <MobileHeader />
      <MobileNavDrawer />
    </>
  );
};
Header.displayName = 'Header';
