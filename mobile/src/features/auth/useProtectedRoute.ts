import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from './authStore';

/**
 * Navigation gate. Keeps the protected `(app)` group unreachable without a
 * valid session and bounces authenticated users out of the `(auth)` group —
 * including deep links.
 */
export function useProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    const inAuthGroup = segments[0] === '(auth)';

    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [status, segments, router]);
}
