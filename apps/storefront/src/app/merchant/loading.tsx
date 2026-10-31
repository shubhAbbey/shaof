import React from 'react';
import { AteevraLoader } from '../../components/ui/ateevra-loader';

export default function MerchantLoading() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gray-50">
      <AteevraLoader
        size="xl"
        variant="merchant"
        text="Loading Merchant Portal..."
        subtext="Ateevra Merchant Workspace"
        fadePulse={true}
      />
    </div>
  );
}
