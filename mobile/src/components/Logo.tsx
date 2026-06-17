import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

interface LogoProps {
  /** Overall scale. 1 = default. */
  size?: number;
  /** Hide the wordmark and show only the badge. */
  compact?: boolean;
}

/**
 * Brand logo — a vibrant rounded badge with 🍻 plus the wordmark.
 * Pure RN (no SVG dependency) so it works everywhere out of the box.
 */
export function Logo({ size = 1, compact = false }: LogoProps) {
  const badge = 64 * size;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.badge,
          { width: badge, height: badge, borderRadius: badge * 0.3 },
        ]}
      >
        <Text style={{ fontSize: badge * 0.5 }}>🍻</Text>
      </View>
      {!compact && (
        <View style={styles.wordmark}>
          <Text style={[styles.who, { fontSize: 26 * size }]}>WHO&apos;S</Text>
          <Text style={[styles.drunk, { fontSize: 26 * size }]}>DRUNK</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  wordmark: { justifyContent: 'center' },
  who: { fontWeight: '900', color: colors.text, letterSpacing: 1, lineHeight: 28 },
  drunk: { fontWeight: '900', color: colors.accent, letterSpacing: 1, lineHeight: 28 },
});
