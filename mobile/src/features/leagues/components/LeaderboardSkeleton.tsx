import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';

/** Loading placeholder that mirrors the podium + list layout. */
export function LeaderboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Podium placeholder */}
      <View style={styles.podium}>
        <View style={[styles.pedestal, { height: 70 }]} />
        <View style={[styles.pedestal, { height: 96 }]} />
        <View style={[styles.pedestal, { height: 52 }]} />
      </View>

      {/* Rows placeholder */}
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.row}>
          <View style={styles.dot} />
          <View style={styles.lines}>
            <View style={styles.lineWide} />
            <View style={styles.lineNarrow} />
          </View>
          <View style={styles.pts} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10 },
  pedestal: { flex: 1, borderRadius: 10, backgroundColor: '#ECECEC' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
  },
  dot: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECECEC' },
  lines: { flex: 1, gap: 6 },
  lineWide: { height: 12, borderRadius: 6, backgroundColor: '#ECECEC', width: '60%' },
  lineNarrow: { height: 10, borderRadius: 5, backgroundColor: '#F2F2F2', width: '35%' },
  pts: { width: 28, height: 18, borderRadius: 6, backgroundColor: '#ECECEC' },
});
