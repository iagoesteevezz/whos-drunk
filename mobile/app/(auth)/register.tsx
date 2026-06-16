import { useMemo, useState } from 'react';
import { Link } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { DateField, formatDate } from '@/components/DateField';
import { colors } from '@/theme/colors';

export default function RegisterScreen() {
  const { register, submitting, error } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  // 18+ cutoff: the latest date a person can be born and still be an adult today.
  const eighteenYearsAgo = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  }, []);

  const isAdult = birthDate ? birthDate <= eighteenYearsAgo : false;
  const disabled =
    submitting || !displayName || !email || password.length < 8 || !birthDate || !isAdult;

  const birthDateError =
    birthDate && !isAdult ? 'You must be 18 or older to sign up.' : null;

  async function onSubmit() {
    if (!birthDate || !isAdult) return;
    await register({
      displayName: displayName.trim(),
      email: email.trim(),
      password,
      birthDate: formatDate(birthDate),
    });
    // On success the auth gate redirects into (app).
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>You must be 18 or older to join.</Text>

          <TextField
            label="Display name"
            placeholder="How friends will see you"
            value={displayName}
            onChangeText={setDisplayName}
          />
          <TextField
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            placeholder="At least 8 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <DateField
            label="Birth date"
            placeholder="Select your birth date"
            value={birthDate}
            onChange={setBirthDate}
            maximumDate={eighteenYearsAgo}
            error={birthDateError}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Sign up" loading={submitting} disabled={disabled} onPress={onSubmit} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" style={styles.footerLink}>
              Log in
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { padding: 24, gap: 14, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: 8 },
  error: { color: colors.danger, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  footerText: { color: colors.textMuted },
  footerLink: { color: colors.primary, fontWeight: '700' },
});
