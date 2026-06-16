import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLeaderboard } from '@/features/leagues/useLeaderboard';
import { Podium } from '@/features/leagues/components/Podium';
import { LeaderboardRow } from '@/features/leagues/components/LeaderboardRow';
import { LeaderboardSkeleton } from '@/features/leagues/components/LeaderboardSkeleton';
import {
  EmptyLeaderboard,
  LeaderboardError,
} from '@/features/leagues/components/LeaderboardStates';
import { apiErrorMessage } from '@/features/leagues/errors';
import { useAuthStore } from '@/features/auth/authStore';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';

export default function LeaderboardScreen() {
  const router = useRouter();
  const { leagueId, leagueName } = useLocalSearchParams<{
    leagueId: string;
    leagueName?: string;
  }>();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const { data, isLoading, isError, error, refetch, isRefetching } = useLeaderboard(leagueId);

  const entries = data ?? [];
  const top = entries.slice(0, 3);
  const rest = entries.slice(3);

  function goLog() {
    router.push({
      pathname: '/(app)/log-consumption',
      params: { leagueId, leagueName },
    });
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <LeaderboardSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <LeaderboardError
          message={apiErrorMessage(error, {
            404: "This league doesn't have an active season yet.",
          })}
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <FlatList
        data={rest}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          entries.length > 0 ? (
            <View style={styles.header}>
              {leagueName ? <Text style={styles.season}>{leagueName} · Season ranking</Text> : null}
              <View style={styles.navLinks}>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/(app)/hall-of-fame', params: { leagueId, leagueName } })
                  }
                >
                  <Text style={styles.hofLink}>🏆 Hall of Fame</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/(app)/stats', params: { leagueId, leagueName } })
                  }
                >
                  <Text style={styles.hofLink}>📊 Insights</Text>
                </Pressable>
              </View>
              <Podium top={top} currentUserId={currentUserId} />
              {rest.length > 0 ? <Text style={styles.restLabel}>The rest of the pack</Text> : null}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <LeaderboardRow entry={item} isCurrentUser={item.userId === currentUserId} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={entries.length === 0 ? <EmptyLeaderboard onLogDrink={goLog} /> : null}
      />

      {entries.length > 0 ? (
        <View style={styles.footer}>
          <Button title="Log a drink 🍻" onPress={goLog} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  list: { padding: 16, flexGrow: 1, gap: 0 },
  header: { gap: 12, marginBottom: 8 },
  season: { fontSize: 14, fontWeight: '700', color: colors.textMuted, textAlign: 'center' },
  navLinks: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  hofLink: { fontSize: 14, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  restLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginTop: 8 },
  separator: { height: 10 },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
