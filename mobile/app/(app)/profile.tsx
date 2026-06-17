import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { leaguesApi } from '@/api/endpoints/leagues';
import { leagueKeys } from '@/features/leagues/queryKeys';
import { useAuthStore } from '@/features/auth/authStore';
import { initialOf } from '@/features/leagues/format';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const { data: groups } = useQuery({
    queryKey: leagueKeys.mine,
    queryFn: leaguesApi.myLeagues,
  });

  const name = user?.displayName ?? '';

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialOf(name || '?')}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{groups?.length ?? 0}</Text>
              <Text style={styles.statLabel}>{t('profile.myGroups')}</Text>
            </View>
          </View>
        </View>

        {/* Trophy room (coming soon) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 {t('profile.palmaresTitle')}</Text>
          <Text style={styles.cardSubtitle}>{t('profile.palmaresSoon')}</Text>
        </View>

        {/* Settings link */}
        <Pressable style={styles.linkRow} onPress={() => router.push('/(app)/settings')}>
          <Text style={styles.linkText}>⚙️  {t('nav.settings')}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <View style={styles.signOut}>
          <Button title={t('common.signOut')} variant="secondary" onPress={() => signOut()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 14 },
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 38, fontWeight: '900', color: colors.primary },
  name: { fontSize: 22, fontWeight: '900', color: colors.white },
  statsRow: { flexDirection: 'row', gap: 24 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.white },
  statLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  card: { backgroundColor: colors.white, borderRadius: 18, padding: 16, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  cardSubtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },

  linkRow: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkText: { fontSize: 16, fontWeight: '700', color: colors.text },
  chevron: { fontSize: 24, color: colors.textMuted, fontWeight: '700' },

  signOut: { marginTop: 8 },
});
