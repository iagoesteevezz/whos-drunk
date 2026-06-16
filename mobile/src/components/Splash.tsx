import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/** Shown while the persisted session is being restored on startup. */
export function Splash() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who's Drunk</Text>
      <ActivityIndicator size="large" color="#6C4DF6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#111' },
});
