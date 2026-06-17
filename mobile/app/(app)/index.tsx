import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { leaguesApi, type League } from '@/api/endpoints/leagues';
import { leagueKeys } from '@/features/leagues/queryKeys';
import { initialOf } from '@/features/leagues/format';
import { useAuthStore } from '@/features/auth/authStore';
import { usePushRegistration } from '@/features/notifications/usePushRegistration';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';

export default function GroupsDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Ask for push permission + register the device token on first entry.
  usePushRegistration();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: leagueKeys.mine,
    queryFn: leaguesApi.myLeagues,
  });

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('groups.greeting', { name: user?.displayName ?? '' })}</Text>
        <Pressable style={styles.avatar} onPress={() => router.push('/(app)/profile')}>
          <Text style={styles.avatarText}>{initialOf(user?.displayName ?? '?')}</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.error}>{t('groups.loadError')}</Text>
            <Pressable style={styles.retry} onPress={() => refetch()}>
              <Text style={styles.retryText}>{t('common.retry')}</Text>
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
                <Text style={styles.emptyEmoji}>🍻</Text>
                <Text style={styles.emptyTitle}>{t('groups.empty.title')}</Text>
                <Text style={styles.emptySubtitle}>{t('groups.empty.subtitle')}</Text>
              </View>
            }
            renderItem={({ item }) => <GroupCard league={item} />}
          />
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <Button
            title={t('groups.join')}
            variant="secondary"
            onPress={() => router.push('/(app)/join-league')}
          />
        </View>
        <View style={styles.actionItem}>
          <Button title={t('groups.create')} onPress={() => router.push('/(app)/create-league')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const BANNER_COLORS = ['#7C3AED', '#EC4899', '#F97316', '#06B6D4', '#10B981', '#F43F5E'];

function bannerColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return BANNER_COLORS[hash % BANNER_COLORS.length];
}

function GroupCard({ league }: { league: League }) {
  const { t } = useTranslation();
  const router = useRouter();
  const members =
    league.memberCount === 1 ? t('groups.member') : t('groups.members', { count: league.memberCount });

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
      <View style={[styles.banner, { backgroundColor: bannerColor(league.id) }]}>
        <Text style={styles.bannerEmoji}>🍻</Text>
        <Text style={styles.role}>{league.myRole}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {league.name}
        </Text>
        <Text style={styles.cardMeta}>
          {members} · {league.inviteCode}
        </Text>
        <Text style={styles.cardCta}>{t('groups.tapToView')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: { flex: 1, fontSize: 20, fontWeight: '900', color: colors.text },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '900', color: colors.white },

  content: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  list: { padding: 16, gap: 12, flexGrow: 1 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  banner: {
    height: 92,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerEmoji: { fontSize: 44, opacity: 0.95 },
  cardBody: { padding: 16, gap: 4 },
  cardTitle: { fontSize: 19, fontWeight: '900', color: colors.text },
  cardMeta: { color: colors.textMuted, fontSize: 13 },
  role: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardCta: { color: colors.primary, fontSize: 14, fontWeight: '800', marginTop: 4 },

  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  emptySubtitle: { color: colors.textMuted, textAlign: 'center' },
  error: { color: colors.danger },
  retry: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  retryText: { color: colors.white, fontWeight: '700' },

  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  actionItem: { flex: 1 },
});
