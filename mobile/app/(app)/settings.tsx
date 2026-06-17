import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore, useTranslation } from '@/i18n';
import { colors } from '@/theme/colors';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.language')}</Text>
          <Text style={styles.cardSubtitle}>{t('settings.languageHint')}</Text>

          <View style={styles.options}>
            <LanguageOption
              label={t('settings.spanish')}
              flag="🇪🇸"
              selected={language === 'es'}
              onPress={() => setLanguage('es')}
            />
            <LanguageOption
              label={t('settings.english')}
              flag="🇬🇧"
              selected={language === 'en'}
              onPress={() => setLanguage('en')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LanguageOption({
  label,
  flag,
  selected,
  onPress,
}: {
  label: string;
  flag: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={styles.flag}>{flag}</Text>
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
      {selected ? <Text style={styles.check}>✓</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 14 },
  card: { backgroundColor: colors.white, borderRadius: 18, padding: 16, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  cardSubtitle: { fontSize: 14, color: colors.textMuted },
  options: { gap: 10, marginTop: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  flag: { fontSize: 22 },
  optionLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  optionLabelSelected: { color: colors.primary },
  check: { fontSize: 18, fontWeight: '900', color: colors.primary },
});
