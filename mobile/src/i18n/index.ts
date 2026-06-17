import { useSettingsStore } from './settingsStore';
import { translations } from './translations';

export type { Language } from './translations';
export { useSettingsStore } from './settingsStore';

/**
 * Translation hook. Re-renders when the language changes.
 *
 *   const { t } = useTranslation();
 *   t('groups.greeting', { name: 'Iago' });
 */
export function useTranslation() {
  const language = useSettingsStore((s) => s.language);

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let value = translations[language][key] ?? key;
    if (vars) {
      for (const k of Object.keys(vars)) {
        value = value.replace(`{${k}}`, String(vars[k]));
      }
    }
    return value;
  };

  return { t, language };
}
