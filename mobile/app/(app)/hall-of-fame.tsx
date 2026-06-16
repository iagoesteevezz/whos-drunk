import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSeasons } from '@/features/leagues/useSeasons';
import { ChampionCard } from '@/features/leagues/components/ChampionCard';
import {
  EmptyHallOfFame,
  HallOfFameError,
  HallOfFameSkeleton,
} from '@/features/leagues/components/HallOfFameStates';
import { apiErrorMessage } from '@/features/leagues/errors';
import { colors } from '@/theme/colors';

export default function HallOfFameScreen() {
  const router = useRouter();
  const { leagueId, leagueName } = useLocalSearchParams<{
    leagueId: string;
    leagueName?: string;
  }>();

  const { data, isLoading, isError, error, refetch, isRefetching } = useSeasons(leagueId);

  const seasons = data ?? [];
  const closed = seasons.filter((s) => s.status === 'CLOSED');
  const current = seasons.find((s) => s.status === 'ACTIVE');

  function goLog() {
    router.push({ pathname: '/(app)/log-consumption', params: { leagueId, leagueName } });
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <HallOfFameSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <HallOfFameError message={apiErrorMessage(error)} onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <FlatList
        data={closed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {leagueName ? <Text style={styles.title}>{leagueName} · Hall of Fame</Text> : null}
            {current ? (
              <Text style={styles.current}>Current season: {current.name} · in progress</Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <ChampionCard season={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyHallOfFame onLogDrink={goLog} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  list: { padding: 16, flexGrow: 1 },
  header: { gap: 4, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  current: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  separator: { height: 12 },
});
