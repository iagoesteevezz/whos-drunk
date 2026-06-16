import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth/authStore';
import { Splash } from '@/components/Splash';

/**
 * Entry route ("/"). Sends the user to the right area based on the restored
 * session. The gate in the root layout keeps things consistent afterwards.
 */
export default function Index() {
  const status = useAuthStore((s) => s.status);

  if (status === 'loading') {
    return <Splash />;
  }
  return <Redirect href={status === 'authenticated' ? '/(app)' : '/(auth)/login'} />;
}
