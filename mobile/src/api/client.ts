import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '@/config/env';
import { useAuthStore } from '@/features/auth/authStore';
import type { AuthResponse } from '@/features/auth/types';

/** Main API client. All app requests go through here. */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Bare client with NO interceptors, used only to refresh tokens so we never
 * recurse into the 401 handler.
 */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Request interceptor: inject the access token.
// ---------------------------------------------------------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor: single-flight refresh on 401, then retry once.
// ---------------------------------------------------------------------------
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** Shared in-flight refresh so concurrent 401s trigger only one refresh call. */
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const { data } = await refreshClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  await useAuthStore.getState().updateTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    const isAuthEndpoint = original?.url?.includes('/auth/');
    const canRetry = status === 401 && original && !original._retry && !isAuthEndpoint;

    if (!canRetry) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newToken = await refreshPromise;

      const headers = AxiosHeaders.from(original.headers);
      headers.set('Authorization', `Bearer ${newToken}`);
      original.headers = headers;
      return api(original);
    } catch (refreshError) {
      // Refresh failed → session is dead. Gate will redirect to login.
      await useAuthStore.getState().signOut();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);
