import { useState } from 'react';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from './authStore';
import type { LoginCredentials, RegisterPayload } from './types';

/**
 * Screen-facing auth actions. Calls the API, then commits the session to the
 * store (which persists tokens to SecureStore). Exposes simple loading/error
 * state for forms.
 */
export function useAuth() {
  const setSession = useAuthStore((s) => s.setSession);
  const signOut = useAuthStore((s) => s.signOut);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run<T>(fn: () => Promise<T>): Promise<boolean> {
    setSubmitting(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch (e) {
      setError(extractMessage(e));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    submitting,
    error,
    login: (credentials: LoginCredentials) =>
      run(async () => setSession(await authApi.login(credentials))),
    register: (payload: RegisterPayload) =>
      run(async () => setSession(await authApi.register(payload))),
    signOut,
  };
}

function extractMessage(e: unknown): string {
  if (typeof e === 'object' && e && 'response' in e) {
    const resp = (e as { response?: { data?: { detail?: string } } }).response;
    if (resp?.data?.detail) return resp.data.detail;
  }
  return 'Something went wrong. Please try again.';
}
