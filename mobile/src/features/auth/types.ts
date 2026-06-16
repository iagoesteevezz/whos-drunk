/** Mirrors the backend `AuthResponse`. */
export interface AuthResponse {
  userId: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  /** ISO date (YYYY-MM-DD). */
  birthDate: string;
}

/** The authenticated user kept in memory. */
export interface SessionUser {
  id: string;
  displayName: string;
}

/** Token pair persisted in the device secure store. */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
