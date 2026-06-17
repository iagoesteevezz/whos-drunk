import { useState } from 'react';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/useAuth';
import { useTranslation } from '@/i18n';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors } from '@/theme/colors';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, submitting, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const disabled = submitting || !email || !password;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.logo}>
          <Logo size={1.1} />
        </View>

        <Text style={styles.title}>{t('login.title')}</Text>
        <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

        <TextField
          label={t('login.email')}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
        <TextField
          label={t('login.password')}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={t('login.submit')}
          loading={submitting}
          disabled={disabled}
          onPress={() => login({ email: email.trim(), password })}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('login.noAccount')}</Text>
          <Link href="/(auth)/register" style={styles.footerLink}>
            {t('login.create')}
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 14 },
  logo: { alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: 8 },
  error: { color: colors.danger, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  footerText: { color: colors.textMuted },
  footerLink: { color: colors.primary, fontWeight: '800' },
});
