import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/authStore';
import { useProtectedRoute } from '@/features/auth/useProtectedRoute';
import { setupNotificationHandler } from '@/features/notifications/push';
import { usePushNavigation } from '@/features/notifications/usePushNavigation';
import { useSettingsStore } from '@/i18n';
import { Splash } from '@/components/Splash';

const queryClient = new QueryClient();

export default function RootLayout() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const loadSettings = useSettingsStore((s) => s.load);

  // Restore the persisted session once on startup.
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // Restore saved settings (language + onboarding flag).
  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  // Configure how push notifications behave in the foreground.
  useEffect(() => {
    setupNotificationHandler();
  }, []);

  // Enforce the auth gate across the whole tree.
  useProtectedRoute();

  // Route "Sorpasso" notification taps to the right leaderboard.
  usePushNavigation();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {status === 'loading' ? (
          <Splash />
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        )}
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
