'use client';

import React from 'react';
import { ClientWrapper } from './ClientWrapper';
import { AppRouter } from '@/shared';

export default function HomePage() {
  return (
    <ClientWrapper>
      <AppRouter />
    </ClientWrapper>
  );
}
