import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useJoinLeague, type JoinResult } from '@/features/leagues/useLeagueMutations';
import { apiErrorMessage } from '@/features/leagues/errors';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors } from '@/theme/colors';

export default function JoinLeagueScreen() {
  const router = useRouter();
  const joinLeague = useJoinLeague();
  const [code, setCode] = useState('');

  function onSubmit() {
    joinLeague.mutate(code.trim());
  }

  if (joinLeague.isSuccess) {
    return <JoinSuccess result={joinLeague.data} onDone={() => router.back()} />;
  }

  // Friendly copy for the common failures from the backend.
  const errorMessage = joinLeague.isError
    ? apiErrorMessage(joinLeague.error, {
        404: "We couldn't find a league with that code. Double-check it and try again.",
      })
    : null;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>Join a league</Text>
        <Text style={styles.subtitle}>Enter the invite code a friend shared with you.</Text>

        <TextField
          label="Invite code"
          placeholder="e.g. K7P2QW9X"
          autoCapitalize="characters"
          autoCorrect={false}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          maxLength={16}
          error={errorMessage}
        />

        <Button
          title="Join league"
          loading={joinLeague.isPending}
          disabled={joinLeague.isPending || code.trim().length === 0}
          onPress={onSubmit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function JoinSuccess({ result, onDone }: { result: JoinResult; onDone: () => void }) {
  const { league, alreadyMember } = result;
  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>{alreadyMember ? '👀' : '🍻'}</Text>
        <Text style={styles.title}>
          {alreadyMember ? "You're already in!" : `Welcome to "${league.name}"!`}
        </Text>
        <Text style={styles.subtitle}>
          {alreadyMember
            ? `You already belong to "${league.name}". No changes made.`
            : `You joined as ${league.myRole.toLowerCase()}. Time to catch up on the leaderboard.`}
        </Text>
        <Button title="Go to my leagues" onPress={onDone} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 24, gap: 14, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  successContainer: { flex: 1, padding: 24, gap: 16, justifyContent: 'center' },
  successEmoji: { fontSize: 56, textAlign: 'center' },
});
