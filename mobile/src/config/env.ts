/**
 * Runtime configuration. `EXPO_PUBLIC_*` vars are inlined at build time by Expo.
 *
 * Android emulator reaches the host machine at 10.0.2.2; iOS simulator at
 * localhost; a physical device needs your machine's LAN IP.
 */
export const ENV = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080',
  apiPrefix: '/api/v1',
} as const;

export const API_BASE_URL = `${ENV.apiUrl}${ENV.apiPrefix}`;
