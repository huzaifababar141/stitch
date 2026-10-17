'use client';

import { useSyncExternalStore } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  type Session,
  type AuthChangeEvent,
} from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
}

let globalState: AuthState = {
  user: null,
  loading: true,
};

const listeners = new Set<() => void>();
let isInitialized = false;

function isSameUser(prev: User | null, next: User | null): boolean {
  if (prev === next) return true;
  if (!prev || !next) return false;
  return (
    prev.id === next.id &&
    prev.email === next.email &&
    prev.updated_at === next.updated_at &&
    JSON.stringify(prev.user_metadata) === JSON.stringify(next.user_metadata)
  );
}

function notify() {
  listeners.forEach((listener) => listener());
}

function updateState(nextUser: User | null, nextLoading: boolean) {
  const userUnchanged = isSameUser(globalState.user, nextUser);
  const loadingUnchanged = globalState.loading === nextLoading;

  if (userUnchanged && loadingUnchanged) {
    return;
  }

  globalState = {
    user: userUnchanged ? globalState.user : nextUser,
    loading: nextLoading,
  };
  notify();
}

function initAuth() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  const supabase = createClient();

  // Fetch initial session
  supabase.auth
    .getSession()
    .then(({ data }: { data: { session: Session | null } }) => {
      updateState(data.session?.user || null, false);
    })
    .catch(() => {
      updateState(null, false);
    });

  // Listen to auth state changes across the browser tab
  supabase.auth.onAuthStateChange(
    (_event: AuthChangeEvent, session: Session | null) => {
      // When tab focus or token refresh occurs, GoTrue re-evaluates the session.
      // updateState checks isSameUser and discards duplicate references to prevent re-renders.
      updateState(session?.user || null, false);
    }
  );
}

// Start auth listener immediately in browser
if (typeof window !== 'undefined') {
  initAuth();
}

function subscribe(listener: () => void) {
  initAuth();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthState {
  return globalState;
}

const serverSnapshot: AuthState = {
  user: null,
  loading: true,
};

function getServerSnapshot(): AuthState {
  return serverSnapshot;
}

export function useAuth() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    updateState(null, false);
    window.location.href = '/login';
  };

  return {
    user: state.user,
    loading: state.loading,
    signOut,
    supabase,
  };
}
