import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';

/** Loading placeholder mirroring the stat cards. */
export function StatsSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.lineShort} />
          <View style={styles.lineWide} />
          <View style={styles.lineNarrow} />
        </View>
      ))}
    </View>
  );
}

/** No consumptions logged yet this season. */
export function EmptyStats({ onLogDrink }: { onLogDrink: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>📊</Text>
      <Text style={styles.title}>No stats yet</Text>
      <Text style={styles.subtitle}>
        Nobody has logged a drink this season. Get the round going and the bragging rights will follow.
      </Text>
      <View style={styles.action}>
        <Button title="Log a drink 🍻" onPress={onLogDrink} />
      </View>
    </View>
  );
}

/** Error with retry. */
export function StatsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>😵‍💫</Text>
      <Text style={styles.title}>Couldn't load the stats</Text>
      <Text style={styles.subtitle}>{message}</Text>
      <View style={styles.action}>
        <Button title="Try again" variant="secondary" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  card: { backgroundColor: colors.white, borderRadius: 18, padding: 16, gap: 10 },
  lineShort: { height: 12, width: '40%', borderRadius: 6, backgroundColor: '#ECECEC' },
  lineWide: { height: 18, width: '70%', borderRadius: 6, backgroundColor: '#ECECEC' },
  lineNarrow: { height: 12, width: '30%', borderRadius: 5, backgroundColor: '#F2F2F2' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  emoji: { fontSize: 56 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
  action: { alignSelf: 'stretch', marginTop: 12 },
});
