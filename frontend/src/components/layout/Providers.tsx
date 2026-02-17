'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const loadUser = useAuthStore((s) => s.loadUser);
  const darkMode = useUIStore((s) => s.darkMode);
  useEffect(() => { loadUser(); }, [loadUser]);
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);
  return <>{children}</>;
}
