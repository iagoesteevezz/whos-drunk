import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { leaguesApi, type League } from '@/api/endpoints/leagues';
import { leagueKeys } from '@/features/leagues/queryKeys';
import { useAuthStore } from '@/features/auth/authStore';
import { usePushRegistration } from '@/features/notifications/usePushRegistration';
import { Button } from '@/components/Button';

export default function LeaguesDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  // Ask for push permission + register the device token on first dashboard entry.
  usePushRegistration();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: leagueKeys.mine,
    queryFn: leaguesApi.myLeagues,
  });

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, {user?.displayName ?? 'there'} 👋</Text>
        <Pressable onPress={() => signOut()}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C4DF6" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.error}>Could not load your leagues.</Text>
          <Pressable style={styles.retry} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No leagues yet</Text>
              <Text style={styles.emptySubtitle}>
                Create a league or join one with an invite code.
              </Text>
            </View>
          }
          renderItem={({ item }) => <LeagueCard league={item} />}
        />
      )}
      </View>

      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <Button
            title="Join league"
            variant="secondary"
            onPress={() => router.push('/(app)/join-league')}
          />
        </View>
        <View style={styles.actionItem}>
          <Button title="Create league" onPress={() => router.push('/(app)/create-league')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function LeagueCard({ league }: { league: League }) {
  const router = useRouter();
  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/(app)/leaderboard',
          params: { leagueId: league.id, leagueName: league.name },
        })
      }
    >
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>{league.name}</Text>
        <Text style={styles.badge}>{league.myRole}</Text>
      </View>
      <Text style={styles.cardMeta}>
        {league.memberCount} member{league.memberCount === 1 ? '' : 's'} · Code{' '}
        {league.inviteCode}
      </Text>
      <Text style={styles.cardCta}>Tap to view ranking 🏆</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F6FB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: { fontSize: 18, fontWeight: '700', color: '#111' },
  signOut: { color: '#6C4DF6', fontWeight: '600' },
  content: { flex: 1 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  actionItem: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C4DF6',
    backgroundColor: '#EEE9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardMeta: { color: '#666', fontSize: 13 },
  cardCta: { color: '#6C4DF6', fontSize: 13, fontWeight: '700', marginTop: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  emptySubtitle: { color: '#666', textAlign: 'center' },
  error: { color: '#D7263D' },
  retry: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#6C4DF6', borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '700' },
});
