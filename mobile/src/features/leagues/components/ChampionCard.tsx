import { StyleSheet, Text, View } from 'react-native';
import type { Season } from '@/api/endpoints/seasons';
import { formatPoints, initialOf } from '../format';
import { colors } from '@/theme/colors';

/** A closed season, crowning its champion. */
export function ChampionCard({ season }: { season: Season }) {
  const hasWinner = !!season.winnerUserId && !!season.winnerDisplayName;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.season}>{season.name}</Text>
      </View>

      {hasWinner ? (
        <View style={styles.winnerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialOf(season.winnerDisplayName!)}</Text>
            <Text style={styles.crown}>👑</Text>
          </View>
          <View style={styles.winnerMain}>
            <Text style={styles.winnerLabel}>Champion</Text>
            <Text style={styles.winnerName} numberOfLines={1}>
              {season.winnerDisplayName}
            </Text>
          </View>
          <View style={styles.pointsBox}>
            <Text style={styles.points}>{formatPoints(season.winnerPoints ?? 0)}</Text>
            <Text style={styles.pointsLabel}>pts</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noWinner}>No champion crowned — the bar stayed quiet that month.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#F2E2A8',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trophy: { fontSize: 20 },
  season: { fontSize: 16, fontWeight: '800', color: colors.text },
  winnerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF6E5',
    borderWidth: 2,
    borderColor: '#F6C445',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#A9791B' },
  crown: { position: 'absolute', top: -14, fontSize: 18 },
  winnerMain: { flex: 1 },
  winnerLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  winnerName: { fontSize: 18, fontWeight: '800', color: colors.text },
  pointsBox: { alignItems: 'flex-end' },
  points: { fontSize: 22, fontWeight: '900', color: colors.primary },
  pointsLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  noWinner: { fontSize: 14, color: colors.textMuted, fontStyle: 'italic' },
});
