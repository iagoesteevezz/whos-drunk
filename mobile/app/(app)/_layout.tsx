import { Stack } from 'expo-router';
import { useTranslation } from '@/i18n';
import { colors } from '@/theme/colors';

export default function AppLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: t('nav.groups') }} />
      <Stack.Screen name="profile" options={{ title: t('nav.profile') }} />
      <Stack.Screen name="settings" options={{ title: t('nav.settings') }} />
      <Stack.Screen name="leaderboard" options={{ title: t('nav.leaderboard') }} />
      <Stack.Screen name="hall-of-fame" options={{ title: t('nav.hallOfFame') }} />
      <Stack.Screen name="stats" options={{ title: t('nav.insights') }} />
      <Stack.Screen
        name="create-league"
        options={{ title: t('nav.createGroup'), presentation: 'modal' }}
      />
      <Stack.Screen
        name="join-league"
        options={{ title: t('nav.joinGroup'), presentation: 'modal' }}
      />
      <Stack.Screen
        name="log-consumption"
        options={{ title: t('nav.logDrink'), presentation: 'modal' }}
      />
    </Stack>
  );
}
