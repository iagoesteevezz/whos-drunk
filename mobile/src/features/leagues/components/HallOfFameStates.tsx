import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';

/** Loading placeholder mirroring the champion cards. */
export function HallOfFameSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.lineShort} />
          <View style={styles.row}>
            <View style={styles.dot} />
            <View style={styles.lines}>
              <View style={styles.lineWide} />
              <View style={styles.lineNarrow} />
            </View>
            <View style={styles.pts} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** No closed seasons yet. */
export function EmptyHallOfFame({ onLogDrink }: { onLogDrink: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>👑</Text>
      <Text style={styles.title}>No champions yet</Text>
      <Text style={styles.subtitle}>
        This league hasn't closed its first month. The first crown is up for grabs — make it count!
      </Text>
      <View style={styles.action}>
        <Button title="Log a drink 🍻" onPress={onLogDrink} />
      </View>
    </View>
  );
}

/** Error state with retry. */
export function HallOfFameError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>😵‍💫</Text>
      <Text style={styles.title}>Couldn't load the history</Text>
      <Text style={styles.subtitle}>{message}</Text>
      <View style={styles.action}>
        <Button title="Try again" variant="secondary" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  card: { backgroundColor: colors.white, borderRadius: 18, padding: 16, gap: 14 },
  lineShort: { height: 14, width: '40%', borderRadius: 6, backgroundColor: '#ECECEC' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#ECECEC' },
  lines: { flex: 1, gap: 6 },
  lineWide: { height: 12, width: '60%', borderRadius: 6, backgroundColor: '#ECECEC' },
  lineNarrow: { height: 10, width: '30%', borderRadius: 5, backgroundColor: '#F2F2F2' },
  pts: { width: 32, height: 20, borderRadius: 6, backgroundColor: '#ECECEC' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  emoji: { fontSize: 56 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
  action: { alignSelf: 'stretch', marginTop: 12 },
});
