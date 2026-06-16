import { StyleSheet, Text, View } from 'react-native';
import type { LeaderboardEntry } from '@/api/endpoints/leaderboard';
import { formatPoints, initialOf } from '../format';
import { colors } from '@/theme/colors';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

/** A single ranking row (used for places 4+). */
export function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
  return (
    <View style={[styles.row, isCurrentUser && styles.rowMe]}>
      <Text style={styles.rank}>{entry.rank}</Text>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initialOf(entry.displayName)}</Text>
      </View>
      <View style={styles.main}>
        <Text style={[styles.name, isCurrentUser && styles.meText]} numberOfLines={1}>
          {entry.displayName}
          {isCurrentUser ? ' (you)' : ''}
        </Text>
        <Text style={styles.meta}>
          {entry.totalConsumptions} drink{entry.totalConsumptions === 1 ? '' : 's'}
        </Text>
      </View>
      <Text style={styles.points}>{formatPoints(entry.totalPoints)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rowMe: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft },
  rank: { width: 26, textAlign: 'center', fontSize: 16, fontWeight: '800', color: colors.textMuted },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: colors.primary },
  main: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  meText: { color: colors.primary },
  meta: { fontSize: 12, color: colors.textMuted },
  points: { fontSize: 18, fontWeight: '900', color: colors.text },
});
