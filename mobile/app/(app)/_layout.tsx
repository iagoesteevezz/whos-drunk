import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'My Leagues' }} />
      <Stack.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
      <Stack.Screen name="hall-of-fame" options={{ title: 'Hall of Fame' }} />
      <Stack.Screen name="stats" options={{ title: 'Insights' }} />
      <Stack.Screen name="create-league" options={{ title: 'Create League', presentation: 'modal' }} />
      <Stack.Screen name="join-league" options={{ title: 'Join League', presentation: 'modal' }} />
      <Stack.Screen name="log-consumption" options={{ title: 'Log a Drink', presentation: 'modal' }} />
    </Stack>
  );
}
