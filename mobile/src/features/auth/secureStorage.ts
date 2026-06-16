import * as SecureStore from 'expo-secure-store';
import type { SessionUser, TokenPair } from './types';

/**
 * Thin wrapper over expo-secure-store. Tokens live in the device Keychain /
 * Keystore — never in AsyncStorage.
 */
const ACCESS_TOKEN_KEY = 'wd.accessToken';
const REFRESH_TOKEN_KEY = 'wd.refreshToken';
const USER_KEY = 'wd.user';

export const secureStorage = {
  async saveSession(tokens: TokenPair, user: SessionUser): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
  },

  async saveTokens(tokens: TokenPair): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  },

  async loadSession(): Promise<{ tokens: TokenPair; user: SessionUser } | null> {
    const [accessToken, refreshToken, userRaw] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ]);
    if (!accessToken || !refreshToken || !userRaw) {
      return null;
    }
    try {
      return { tokens: { accessToken, refreshToken }, user: JSON.parse(userRaw) as SessionUser };
    } catch {
      return null;
    }
  },

  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  },
};
