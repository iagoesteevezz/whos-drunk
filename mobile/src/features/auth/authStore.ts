import { create } from 'zustand';
import { secureStorage } from './secureStorage';
import type { AuthResponse, AuthStatus, SessionUser, TokenPair } from './types';

interface AuthState {
  status: AuthStatus;
  user: SessionUser | null;
  accessToken: string | null;
  refreshToken: string | null;

  /** Load any persisted session on app start. */
  bootstrap: () => Promise<void>;
  /** Persist + activate a session from an AuthResponse (login/register). */
  setSession: (auth: AuthResponse) => Promise<void>;
  /** Replace the token pair after a refresh (keeps the same user). */
  updateTokens: (tokens: TokenPair) => Promise<void>;
  /** Clear the session everywhere (logout or failed refresh). */
  signOut: () => Promise<void>;
}

/**
 * Single source of truth for the session. Usable outside React via
 * `useAuthStore.getState()` — the Axios interceptor relies on that.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,
  accessToken: null,
  refreshToken: null,

  async bootstrap() {
    const persisted = await secureStorage.loadSession();
    if (persisted) {
      set({
        status: 'authenticated',
        user: persisted.user,
        accessToken: persisted.tokens.accessToken,
        refreshToken: persisted.tokens.refreshToken,
      });
    } else {
      set({ status: 'unauthenticated', user: null, accessToken: null, refreshToken: null });
    }
  },

  async setSession(auth) {
    const user: SessionUser = { id: auth.userId, displayName: auth.displayName };
    const tokens: TokenPair = { accessToken: auth.accessToken, refreshToken: auth.refreshToken };
    await secureStorage.saveSession(tokens, user);
    set({
      status: 'authenticated',
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  },

  async updateTokens(tokens) {
    await secureStorage.saveTokens(tokens);
    set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    // keep current user/status untouched
    if (get().status !== 'authenticated') {
      set({ status: 'authenticated' });
    }
  },

  async signOut() {
    await secureStorage.clear();
    set({ status: 'unauthenticated', user: null, accessToken: null, refreshToken: null });
  },
}));
