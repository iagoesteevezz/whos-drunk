import { useEffect, useRef } from 'react';
import { usersApi } from '@/api/endpoints/users';
import { useAuthStore } from '@/features/auth/authStore';
import { currentPlatform, registerForPushNotificationsAsync } from './push';

/**
 * Once the user is authenticated, asks for notification permission, mints the
 * Expo push token and registers it with the backend. Runs at most once per
 * session and fails silently (push is a nice-to-have, never blocking).
 */
export function usePushRegistration(): void {
  const status = useAuthStore((s) => s.status);
  const done = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || done.current) {
      return;
    }
    done.current = true;

    void (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await usersApi.registerDeviceToken({ token, platform: currentPlatform() });
        }
      } catch {
        // ignore: notifications are optional
      }
    })();
  }, [status]);
}
