'use client';

import React, { createContext, useContext } from 'react';
import type { AdminActorDTO } from '@/lib/admin/types';

const AdminActorContext = createContext<AdminActorDTO | null>(null);

export function AdminActorProvider({
  actor,
  children,
}: {
  actor: AdminActorDTO;
  children: React.ReactNode;
}) {
  return (
    <AdminActorContext.Provider value={actor}>
      {children}
    </AdminActorContext.Provider>
  );
}

export function useAdminActor(): AdminActorDTO {
  const ctx = useContext(AdminActorContext);
  if (!ctx) {
    throw new Error('useAdminActor must be used within AdminLayout');
  }
  return ctx;
}
