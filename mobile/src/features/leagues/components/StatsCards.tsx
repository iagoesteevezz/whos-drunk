import { StyleSheet, Text, View } from 'react-native';
import type { FireStreak, StarDrink, UserFavoriteDrink } from '@/api/endpoints/stats';
import { colors } from '@/theme/colors';

const MEDALS = ['🥇', '🥈', '🥉'];

/** League's most-logged drink. */
export function StarDrinkCard({ star }: { star: StarDrink }) {
  return (
    <View style={[styles.card, styles.starAccent]}>
      <Text style={styles.cardHeader}>⭐ League Star Drink</Text>
      <Text style={styles.bigName}>{star.name}</Text>
      {star.brandName ? <Text style={styles.subtle}>{star.brandName}</Text> : null}
      <View style={styles.pill}>
        <Text style={styles.pillText}>
          Logged {star.count} time{star.count === 1 ? '' : 's'}
        </Text>
      </View>
    </View>
  );
}

/** Longest consecutive-days streak. */
export function FireStreakCard({ streak }: { streak: FireStreak }) {
  return (
    <View style={[styles.card, styles.fireAccent]}>
      <Text style={styles.cardHeader}>🔥 On Fire</Text>
      <View style={styles.streakRow}>
        <Text style={styles.flame}>🔥</Text>
        <View style={styles.streakMain}>
          <Text style={styles.bigName}>{streak.displayName}</Text>
          <Text style={styles.subtle}>
            {streak.days}-day streak{streak.days >= 3 ? ' — unstoppable!' : ''}
          </Text>
        </View>
        <Text style={styles.streakDays}>{streak.days}d</Text>
      </View>
    </View>
  );
}

/** Favorite drink of each top-3 player. */
export function FavoritesCard({ favorites }: { favorites: UserFavoriteDrink[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>🍹 Signature Drinks · Top 3</Text>
      <View style={styles.favList}>
        {favorites.map((fav) => (
          <View key={fav.userId} style={styles.favRow}>
            <Text style={styles.medal}>{MEDALS[fav.rank - 1] ?? `#${fav.rank}`}</Text>
            <View style={styles.favMain}>
              <Text style={styles.favName} numberOfLines={1}>
                {fav.displayName}
              </Text>
              <Text style={styles.subtle} numberOfLines={1}>
                {fav.drinkName}
              </Text>
            </View>
            <Text style={styles.favCount}>×{fav.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#EFEFF4',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  starAccent: { borderColor: '#F2E2A8' },
  fireAccent: { borderColor: '#F6C2A8' },
  cardHeader: { fontSize: 13, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase' },
  bigName: { fontSize: 20, fontWeight: '900', color: colors.text },
  subtle: { fontSize: 14, color: colors.textMuted },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  pillText: { color: colors.primary, fontWeight: '800', fontSize: 13 },

  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flame: { fontSize: 34 },
  streakMain: { flex: 1 },
  streakDays: { fontSize: 26, fontWeight: '900', color: '#E0653A' },

  favList: { gap: 10, marginTop: 4 },
  favRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  medal: { fontSize: 22, width: 30, textAlign: 'center' },
  favMain: { flex: 1 },
  favName: { fontSize: 15, fontWeight: '700', color: colors.text },
  favCount: { fontSize: 16, fontWeight: '900', color: colors.primary },
});
