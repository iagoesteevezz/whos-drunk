import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/features/auth/authStore';

interface DeepLinkTarget {
  leagueId: string;
}

/** Extracts a navigation target from an OVERTAKE notification's data payload. */
function parseTarget(response: Notifications.NotificationResponse | null): DeepLinkTarget | null {
  const data = response?.notification?.request?.content?.data as
    | { type?: string; leagueId?: string }
    | undefined;
  if (data?.type === 'OVERTAKE' && typeof data.leagueId === 'string') {
    return { leagueId: data.leagueId };
  }
  return null;
}

/**
 * Routes the user to the relevant league leaderboard when they tap a "Sorpasso"
 * push notification.
 *
 * Handles three cases:
 *  - App in foreground/background (listener fires immediately).
 *  - Cold start (app launched by the tap → getLastNotificationResponseAsync).
 *  - Not yet authenticated (cold start before bootstrap) → defer the jump until
 *    the auth state is ready so we never push a protected route too early.
 */
export function usePushNavigation(): void {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const pending = useRef<DeepLinkTarget | null>(null);
  const handledIds = useRef<Set<string>>(new Set());

  const navigate = useCallback(
    (target: DeepLinkTarget) => {
      router.push({ pathname: '/(app)/leaderboard', params: { leagueId: target.leagueId } });
    },
    [router],
  );

  const handleResponse = useCallback(
    (response: Notifications.NotificationResponse | null) => {
      if (!response) return;

      // Dedupe: cold start can surface the same response via both paths.
      const id = response.notification.request.identifier;
      if (handledIds.current.has(id)) return;
      handledIds.current.add(id);

      const target = parseTarget(response);
      if (!target) return;

      if (useAuthStore.getState().status === 'authenticated') {
        navigate(target);
      } else {
        // Defer until the session is restored (protected route guard).
        pending.current = target;
      }
    },
    [navigate],
  );

  // Taps while the app is already running.
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => subscription.remove();
  }, [handleResponse]);

  // Cold start: the app was opened by tapping a notification.
  useEffect(() => {
    let cancelled = false;
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!cancelled) handleResponse(response);
    });
    return () => {
      cancelled = true;
    };
  }, [handleResponse]);

  // Flush a deferred jump once the user is authenticated.
  useEffect(() => {
    if (status === 'authenticated' && pending.current) {
      const target = pending.current;
      pending.current = null;
      navigate(target);
    }
  }, [status, navigate]);
}
