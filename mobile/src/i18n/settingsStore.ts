import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { Language } from './translations';

const LANG_KEY = 'wd.language';
const ONBOARDING_KEY = 'wd.onboardingDone';

interface SettingsState {
  language: Language;
  onboardingDone: boolean;
  setLanguage: (language: Language) => void;
  completeOnboarding: () => void;
  load: () => Promise<void>;
}

/**
 * App settings (language + onboarding flag). Persisted to secure-store so the
 * choices survive restarts. Default language is Spanish.
 */
export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'es',
  onboardingDone: false,

  setLanguage: (language) => {
    set({ language });
    SecureStore.setItemAsync(LANG_KEY, language).catch(() => {});
  },

  completeOnboarding: () => {
    set({ onboardingDone: true });
    SecureStore.setItemAsync(ONBOARDING_KEY, '1').catch(() => {});
  },

  load: async () => {
    try {
      const [lang, onboarding] = await Promise.all([
        SecureStore.getItemAsync(LANG_KEY),
        SecureStore.getItemAsync(ONBOARDING_KEY),
      ]);
      const next: Partial<SettingsState> = {};
      if (lang === 'en' || lang === 'es') next.language = lang;
      if (onboarding === '1') next.onboardingDone = true;
      if (Object.keys(next).length) set(next);
    } catch {
      // keep defaults
    }
  },
}));
