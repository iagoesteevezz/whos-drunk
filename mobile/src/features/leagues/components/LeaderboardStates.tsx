import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';

/** Empty state: active season, but nobody has scored yet. */
export function EmptyLeaderboard({ onLogDrink }: { onLogDrink: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>🍻</Text>
      <Text style={styles.title}>The bar is open!</Text>
      <Text style={styles.subtitle}>
        No one has scored this season yet. Be the first to put your name on the board.
      </Text>
      <View style={styles.action}>
        <Button title="Log the first drink" onPress={onLogDrink} />
      </View>
    </View>
  );
}

/** Error state with retry. */
export function LeaderboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>😵‍💫</Text>
      <Text style={styles.title}>Couldn't load the ranking</Text>
      <Text style={styles.subtitle}>{message}</Text>
      <View style={styles.action}>
        <Button title="Try again" variant="secondary" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  emoji: { fontSize: 56 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
  action: { alignSelf: 'stretch', marginTop: 12 },
});
