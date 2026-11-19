'use client';

import React from 'react';
import { PageEntrance } from '@/components/ui/effect';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <PageEntrance
      blur={true}
      fade={true}
      slide={true}
      zoom={true}
      delay={0.05}
      className="w-full"
    >
      {children}
    </PageEntrance>
  );
}
