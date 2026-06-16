import { useLocalSearchParams, useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStats } from '@/features/leagues/useStats';
import {
  FavoritesCard,
  FireStreakCard,
  StarDrinkCard,
} from '@/features/leagues/components/StatsCards';
import {
  EmptyStats,
  StatsError,
  StatsSkeleton,
} from '@/features/leagues/components/StatsStates';
import { apiErrorMessage } from '@/features/leagues/errors';
import { colors } from '@/theme/colors';

export default function StatsScreen() {
  const router = useRouter();
  const { leagueId, leagueName } = useLocalSearchParams<{
    leagueId: string;
    leagueName?: string;
  }>();

  const { data, isLoading, isError, error, refetch, isRefetching } = useStats(leagueId);

  function goLog() {
    router.push({ pathname: '/(app)/log-consumption', params: { leagueId, leagueName } });
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <StatsSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <StatsError message={apiErrorMessage(error)} onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const stats = data!;
  const isEmpty = stats.totalConsumptions === 0;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          {leagueName ? <Text style={styles.title}>{leagueName} · Insights</Text> : null}
          {stats.seasonName ? <Text style={styles.season}>{stats.seasonName}</Text> : null}
        </View>

        {isEmpty ? (
          <EmptyStats onLogDrink={goLog} />
        ) : (
          <View style={styles.cards}>
            {stats.starDrink ? <StarDrinkCard star={stats.starDrink} /> : null}
            {stats.fireStreak ? <FireStreakCard streak={stats.fireStreak} /> : null}
            {stats.topFavorites.length > 0 ? (
              <FavoritesCard favorites={stats.topFavorites} />
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 12, flexGrow: 1 },
  header: { gap: 4, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  season: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  cards: { gap: 12 },
});
