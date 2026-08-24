'use client';

import React from 'react';
import type { CmsCategoryNavItemDto, CmsGlobalSettingsDto } from '@ecom/types';
import { DesktopHeader } from './desktop-header';
import { MobileHeader } from './mobile-header';
import { MobileNavDrawer } from './mobile-nav-drawer';

export interface HeaderProps {
  navigation?: CmsCategoryNavItemDto[];
  globalSettings?: CmsGlobalSettingsDto | null;
}

export const Header: React.FC<HeaderProps> = ({ navigation, globalSettings }) => {
  return (
    <>
      <DesktopHeader navigation={navigation} globalSettings={globalSettings} />
      <MobileHeader navigation={navigation} globalSettings={globalSettings} />
      <MobileNavDrawer navigation={navigation} globalSettings={globalSettings} />
    </>
  );
};
Header.displayName = 'Header';

