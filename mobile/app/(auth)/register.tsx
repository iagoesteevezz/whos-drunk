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
import { useTranslation } from '@/i18n';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { DateField, formatDate } from '@/components/DateField';
import { colors } from '@/theme/colors';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { register, submitting, error } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  // 18+ cutoff: the latest birth date that still makes someone an adult today.
  const eighteenYearsAgo = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  }, []);

  const isAdult = birthDate ? birthDate <= eighteenYearsAgo : false;
  const disabled =
    submitting || !displayName || !email || password.length < 8 || !birthDate || !isAdult;
  const birthDateError = birthDate && !isAdult ? t('register.notAdult') : null;

  async function onSubmit() {
    if (!birthDate || !isAdult) return;
    await register({
      displayName: displayName.trim(),
      email: email.trim(),
      password,
      birthDate: formatDate(birthDate),
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <Logo size={0.9} />
          </View>

          <Text style={styles.title}>{t('register.title')}</Text>
          <Text style={styles.subtitle}>{t('register.subtitle')}</Text>

          <TextField
            label={t('register.displayName')}
            placeholder={t('register.displayNamePh')}
            value={displayName}
            onChangeText={setDisplayName}
          />
          <TextField
            label={t('register.email')}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label={t('register.password')}
            placeholder={t('register.passwordPh')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <DateField
            label={t('register.birthDate')}
            placeholder={t('register.birthDatePh')}
            value={birthDate}
            onChange={setBirthDate}
            maximumDate={eighteenYearsAgo}
            error={birthDateError}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={t('register.submit')}
            loading={submitting}
            disabled={disabled}
            onPress={onSubmit}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('register.haveAccount')}</Text>
            <Link href="/(auth)/login" style={styles.footerLink}>
              {t('register.login')}
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
  logo: { alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: 4 },
  error: { color: colors.danger, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  footerText: { color: colors.textMuted },
  footerLink: { color: colors.primary, fontWeight: '800' },
});
