import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import type { League } from '@/api/endpoints/leagues';
import { useCreateLeague } from '@/features/leagues/useLeagueMutations';
import { apiErrorMessage } from '@/features/leagues/errors';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors } from '@/theme/colors';

export default function CreateLeagueScreen() {
  const router = useRouter();
  const createLeague = useCreateLeague();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function onSubmit() {
    createLeague.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  }

  // Success state: the league was created (mutation.data holds it).
  if (createLeague.isSuccess) {
    return <LeagueCreated league={createLeague.data} onDone={() => router.back()} />;
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>New league</Text>
          <Text style={styles.subtitle}>
            You'll be the owner. Invite friends with the code we generate next.
          </Text>

          <TextField
            label="League name"
            placeholder="e.g. Sunday Crew"
            value={name}
            onChangeText={setName}
            maxLength={120}
          />
          <TextField
            label="Description (optional)"
            placeholder="What's this league about?"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
          />

          {createLeague.isError ? (
            <Text style={styles.error}>{apiErrorMessage(createLeague.error)}</Text>
          ) : null}

          <Button
            title="Create league"
            loading={createLeague.isPending}
            disabled={createLeague.isPending || name.trim().length === 0}
            onPress={onSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LeagueCreated({ league, onDone }: { league: League; onDone: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await Clipboard.setStringAsync(league.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.title}>"{league.name}" is ready!</Text>
        <Text style={styles.subtitle}>Share this invite code so friends can join:</Text>

        <Pressable style={styles.codeBox} onPress={copyCode}>
          <Text style={styles.codeText}>{league.inviteCode}</Text>
          <Text style={styles.codeHint}>{copied ? 'Copied!' : 'Tap to copy'}</Text>
        </Pressable>

        <Button
          title={copied ? 'Copied to clipboard' : 'Copy invite code'}
          variant="secondary"
          onPress={copyCode}
        />
        <Button title="Go to my leagues" onPress={onDone} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { padding: 24, gap: 14 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  error: { color: colors.danger, fontSize: 14 },

  successContainer: { flex: 1, padding: 24, gap: 16, alignItems: 'stretch', justifyContent: 'center' },
  successEmoji: { fontSize: 56, textAlign: 'center' },
  codeBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  codeText: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 6,
    color: colors.primary,
  },
  codeHint: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
});
