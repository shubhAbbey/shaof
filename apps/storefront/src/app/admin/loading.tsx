import React from 'react';
import { AteevraLoader } from '../../components/ui/ateevra-loader';

export default function AdminLoading() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50">
      <AteevraLoader
        size="xl"
        variant="admin"
        text="Loading Super Admin..."
        subtext="Ateevra Governance & Trust Gateway"
        fadePulse={true}
      />
    </div>
  );
}
