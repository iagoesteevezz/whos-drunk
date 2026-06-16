import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

interface SuccessOverlayProps {
  title?: string;
  /** Points earned, shown prominently. */
  points?: number;
  /** Called after the animation completes (e.g. to navigate back). */
  onDone: () => void;
  durationMs?: number;
}

/**
 * Full-screen success confirmation. Pops a check + points, then auto-dismisses
 * via `onDone` so the screen can return to the dashboard.
 */
export function SuccessOverlay({
  title = 'Logged!',
  points,
  onDone,
  durationMs = 1500,
}: SuccessOverlayProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onDone, durationMs);
    return () => clearTimeout(timer);
  }, [scale, opacity, onDone, durationMs]);

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
        <View style={styles.checkCircle}>
          <Text style={styles.check}>✓</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        {typeof points === 'number' ? (
          <Text style={styles.points}>
            +{points} <Text style={styles.pointsLabel}>pts</Text>
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,17,17,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 48,
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: colors.white, fontSize: 48, fontWeight: '900', lineHeight: 52 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  points: { fontSize: 30, fontWeight: '900', color: colors.primary },
  pointsLabel: { fontSize: 16, fontWeight: '700', color: colors.textMuted },
});
